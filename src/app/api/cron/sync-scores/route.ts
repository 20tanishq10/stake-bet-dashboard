import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

const OPEN_API_URL = "https://worldcup26.ir/get/games";

export async function GET(request: Request) {
  // 1. Verify cron secret
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 2. Fetch live scores from Free World Cup Open API
    const response = await fetch(OPEN_API_URL);
    if (!response.ok) throw new Error("Failed to fetch live scores");
    const data = await response.json();

    const games = data.games || [];

    let updateCount = 0;

    // 3. Update Supabase matches sequentially
    // Or we could upsert just the fields we care about, but an update loop is fine for live games.
    // To be efficient, we might only update games that are 'live' or just finished, 
    // but the API limit for DB updates here isn't a huge concern for 104 matches.
    for (const match of games) {
      // only update if we have a score
      if (match.home_score === "null" || match.away_score === "null" || match.home_score === null) continue;
      
      const newStatus = match.finished === "TRUE" ? "finished" : (match.time_elapsed === "notstarted" ? "scheduled" : "live");
      
      const { error } = await adminClient
        .from("matches")
        .update({
          home_score: parseInt(match.home_score, 10),
          away_score: parseInt(match.away_score, 10),
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", String(match.id));

      if (error) {
        console.error(`Error updating match ${match.id}:`, error);
      } else {
        updateCount++;
      }
    }

    // 4. Trigger AI Referee Settlement for any finished matches
    try {
      const protocol = request.headers.get("x-forwarded-proto") || "http";
      const host = request.headers.get("host");
      const settleUrl = `${protocol}://${host}/api/cron/settle-bets`;
      
      await fetch(settleUrl, {
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET}`
        }
      });
    } catch (settleError) {
      console.error("Failed to trigger auto-settlement:", settleError);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced scores for ${updateCount} matches and triggered AI referee.`,
    });
  } catch (error) {
    console.error("Sync scores error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
