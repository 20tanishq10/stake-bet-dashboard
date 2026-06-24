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
    // 2. Fetch baseline data from Free World Cup Open API
    const response = await fetch(OPEN_API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Open API: ${response.statusText}`);
    }
    const data = await response.json();

    const games = data.games || [];

    // Transform API response to our database schema
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchesToInsert = games.map((m: any) => ({
      id: String(m.id),
      home_team: m.home_team_name_en || m.home_team_label || "Unknown",
      away_team: m.away_team_name_en || m.away_team_label || "Unknown",
      // convert "MM/DD/YYYY HH:mm" or similar to ISO. 
      // the api provides "local_date": "06/13/2026 21:00"
      match_time: new Date(m.local_date).toISOString(),
      stage: m.group || "Unknown",
      home_score: m.home_score !== "null" && m.home_score !== null ? parseInt(m.home_score, 10) : null,
      away_score: m.away_score !== "null" && m.away_score !== null ? parseInt(m.away_score, 10) : null,
      status: m.finished === "TRUE" ? "finished" : (m.time_elapsed === "notstarted" ? "scheduled" : "live"),
    }));

    // 3. Upsert into Supabase
    // We use adminClient to bypass RLS
    const { error } = await adminClient
      .from("matches")
      .upsert(matchesToInsert, { onConflict: "id" });

    if (error) {
      console.error("Supabase upsert error:", error);
      return new NextResponse("Error upserting matches", { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully initialized ${matchesToInsert.length} matches.`,
    });
  } catch (error) {
    console.error("Cron initialization error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
