import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { GoogleGenAI } from "@google/genai";

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 1. Find all bets that are locked or open where the match has finished
    const { data: bets, error } = await adminClient
      .from("bets")
      .select("*, matches(*)")
      .in("status", ["open", "locked"])
      .not("matches.status", "eq", "scheduled")
      .not("matches.status", "eq", "live"); // i.e. finished

    if (error) throw error;
    if (!bets || bets.length === 0) {
      return NextResponse.json({ success: true, message: "No bets require settlement." });
    }

    let settledCount = 0;

    for (const bet of bets) {
      const match = bet.matches;
      if (!match || match.status !== "finished") continue;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rule = bet.rule as any;
      let netResult = 0; // Negative means loss, Positive means win for participants
      let settlementNotes = "";

      if (rule.mechanism === "rule_based") {
        if (rule.market === "match_winner") {
          const won = 
            (rule.condition === "home_win" && match.home_score > match.away_score) ||
            (rule.condition === "away_win" && match.away_score > match.home_score) ||
            (rule.condition === "draw" && match.home_score === match.away_score);
          netResult = won ? 1 : -1;
        }
      } else if (rule.mechanism === "llm_crazy") {
        // AI REFEREE EVALUATION
        const prompt = `You are the AI Referee for the FIFA World Cup.
The match ${match.home_team} (${match.home_score}) vs ${match.away_team} (${match.away_score}) has finished.
The user placed a crazy bet with the following conditions:
${JSON.stringify(rule.parsed_criteria)}

Based ONLY on the final score and general knowledge if applicable (if you cannot determine, default to 'disputed'), did this bet WIN or LOSE?
Return strictly JSON format:
{ "result": "win" | "lose" | "disputed", "reasoning": "your reasoning..." }`;

        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy_key_for_build" });
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
          });
          
          let text = response.text || "{}";
          if (text.startsWith("```json")) text = text.replace(/```json\n?/, "").replace(/```\n?$/, "");
          else if (text.startsWith("```")) text = text.replace(/```\n?/, "").replace(/```\n?$/, "");

          const aiDecision = JSON.parse(text);
          if (aiDecision.result === "win") netResult = 1;
          else if (aiDecision.result === "lose") netResult = -1;
          else netResult = 0; // Disputed
          
          settlementNotes = aiDecision.reasoning;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          console.error("AI Referee Error:", e);
          netResult = 0; // Default to disputed
          settlementNotes = "AI referee failed to evaluate. Requires admin review.";
        }
      }

      const finalStatus = netResult === 0 ? "pending_settlement" : "settled";

      // Mark bet as settled (or pending settlement if disputed)
      await adminClient.from("bets").update({
        status: finalStatus,
        net_result: netResult,
        description: bet.description + (settlementNotes ? `\n\nAI Referee: ${settlementNotes}` : ""),
        settled_at: new Date().toISOString(),
      }).eq("id", bet.id);

      // Handle Payouts if the bet is fully settled
      if (finalStatus === "settled") {
        const { data: participations } = await adminClient.from("bet_participations").select("*").eq("bet_id", bet.id);
        
        if (participations) {
          if (netResult === 1) { // Win
            const odds = rule.odds || 1.0;
            for (const p of participations) {
              const payout = p.stake_amount * odds;
              
              // 1. Update participation with payout_amount
              await adminClient.from("bet_participations").update({ payout_amount: payout }).eq("id", p.id);

              // 2. Fetch user profile
              const { data: userProfile } = await adminClient.from("profiles").select("wallet_balance").eq("id", p.user_id).single();
              const newBalance = (userProfile?.wallet_balance || 0) + payout;

              // 3. Update wallet
              await adminClient.from("profiles").update({ wallet_balance: newBalance }).eq("id", p.user_id);

              // 4. Insert into wallet_ledger
              await adminClient.from("wallet_ledger").insert({
                user_id: p.user_id,
                entry_type: "payout",
                amount: payout,
                balance_after: newBalance,
                bet_id: bet.id,
                created_by: bet.created_by,
                note: "AI Bet Settlement Payout"
              });
            }
          } else if (netResult === -1) { // Loss
            for (const p of participations) {
              await adminClient.from("bet_participations").update({ payout_amount: 0 }).eq("id", p.id);
            }
          }
        }
      }

      settledCount++;
    }

    return NextResponse.json({ success: true, message: `Processed ${settledCount} bets.` });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Settlement error details:", error?.message, error?.stack, error);
    return new NextResponse(`Internal Server Error: ${error?.message}`, { status: 500 });
  }
}
