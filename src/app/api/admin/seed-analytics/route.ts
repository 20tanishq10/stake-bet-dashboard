import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user to attach dummy bets to
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const dummyBets = [
      { title: "Argentina vs Saudi Arabia (Upset)", net_result: -1, odds: 1.5, stake: 100, daysAgo: 10 },
      { title: "France wins Group D", net_result: 1, odds: 1.8, stake: 50, daysAgo: 8 },
      { title: "Mbappe Golden Boot", net_result: 1, odds: 3.5, stake: 20, daysAgo: 6 },
      { title: "Brazil vs Croatia", net_result: -1, odds: 2.1, stake: 150, daysAgo: 5 },
      { title: "Morocco reaches Semi", net_result: 1, odds: 12.0, stake: 10, daysAgo: 4 },
      { title: "Messi gets Yellow", net_result: -1, odds: 4.0, stake: 30, daysAgo: 2 },
      { title: "Argentina wins WC", net_result: 1, odds: 2.5, stake: 200, daysAgo: 1 },
    ];

    let inserted = 0;

    for (const dbet of dummyBets) {
      const settledAt = new Date();
      settledAt.setDate(settledAt.getDate() - dbet.daysAgo);

      // Insert bet
      const { data: bet, error: betError } = await supabase.from('bets').insert({
        created_by: user.id,
        title: dbet.title,
        description: "Dummy bet for analytics",
        status: "settled",
        net_result: dbet.net_result,
        settled_at: settledAt.toISOString(),
        rule: { mechanism: "llm_crazy", odds: dbet.odds }
      }).select().single();

      if (betError) continue;

      // Insert participation
      await supabase.from('bet_participations').insert({
        bet_id: bet.id,
        user_id: user.id,
        stake_amount: dbet.stake,
        share_pct: 1.0,
        joined_at: settledAt.toISOString()
      });

      inserted++;
    }

    return NextResponse.json({ success: true, message: `Successfully seeded ${inserted} dummy bets for analytics.` });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
