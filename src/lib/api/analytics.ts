"use server";

import { createClient } from "@/lib/supabase/server";

export type PnLDataPoint = {
  date: string;
  pnl: number;
  betTitle: string;
  result: "win" | "loss" | "void";
  amount: number;
};

export type AnalyticsStats = {
  totalPnL: number;
  winRate: number;
  totalBets: number;
  totalVolume: number;
  chartData: { date: string; cumulativePnL: number; dailyPnL: number }[];
  history: PnLDataPoint[];
};

export async function getUserAnalytics(): Promise<{ success: boolean; data?: AnalyticsStats; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { success: false, error: "Unauthorized" };

    // Fetch all participations for the user, joined with bets
    const { data: participations, error } = await supabase
      .from("bet_participations")
      .select(`
        stake_amount,
        joined_at,
        bets (
          title,
          status,
          net_result,
          settled_at,
          rule
        )
      `)
      .eq("user_id", user.id)
      .order("joined_at", { ascending: true });

    if (error) throw error;

    let totalPnL = 0;
    let wins = 0;
    let settledBets = 0;
    let totalVolume = 0;
    
    const history: PnLDataPoint[] = [];

    for (const part of participations || []) {
      const stake = Number(part.stake_amount);
      totalVolume += stake;
      
      const bet = Array.isArray(part.bets) ? part.bets[0] : part.bets;
      if (!bet) continue;
      
      if (bet.status === "settled" && bet.net_result !== null) {
        settledBets++;
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rule = bet.rule as any;
        const odds = Number(rule?.odds || 1.0);
        
        let pnl = 0;
        let result: "win" | "loss" | "void" = "void";
        let amount = 0;

        if (bet.net_result > 0) {
          // Win
          wins++;
          pnl = (stake * odds) - stake; // Profit portion
          result = "win";
          amount = pnl;
        } else if (bet.net_result < 0) {
          // Loss
          pnl = -stake;
          result = "loss";
          amount = pnl;
        } else {
          // Void / Refund
          pnl = 0;
          result = "void";
          amount = 0;
        }

        totalPnL += pnl;

        history.push({
          date: new Date(bet.settled_at || part.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          pnl: pnl,
          betTitle: bet.title,
          result,
          amount
        });
      }
    }

    const winRate = settledBets > 0 ? (wins / settledBets) * 100 : 0;

    // Generate Cumulative Chart Data
    let cumulativePnL = 0;
    const chartData = history.map((point) => {
      cumulativePnL += point.pnl;
      return {
        date: point.date,
        cumulativePnL: Number(cumulativePnL.toFixed(2)),
        dailyPnL: Number(point.pnl.toFixed(2))
      };
    });

    // Optionally add a starting point at 0
    if (chartData.length > 0) {
      chartData.unshift({
        date: "Start",
        cumulativePnL: 0,
        dailyPnL: 0
      });
    }

    return {
      success: true,
      data: {
        totalPnL,
        winRate,
        totalBets: participations?.length || 0,
        totalVolume,
        chartData,
        history: history.reverse() // Most recent first
      }
    };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Analytics fetch error:", error);
    return { success: false, error: error.message };
  }
}
