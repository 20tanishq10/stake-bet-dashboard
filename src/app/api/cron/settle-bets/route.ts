import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

      settledCount++;
    }

    return NextResponse.json({ success: true, message: `Processed ${settledCount} bets.` });
  } catch (error) {
    console.error("Settlement error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
