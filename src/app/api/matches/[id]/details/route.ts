import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

const API_FOOTBALL_BASE_URL = process.env.API_FOOTBALL_BASE_URL || "https://v3.football.api-sports.io";
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // 1. Fetch match from cache
    const { data: match, error: matchError } = await adminClient
      .from("matches")
      .select("*")
      .eq("id", id)
      .single();

    if (matchError || !match) {
      return new NextResponse("Match not found", { status: 404 });
    }

    // 2. Finished Cache Hit
    if (match.status === "finished" && match.api_football_data !== null) {
      return NextResponse.json({
        cached: true,
        data: match.api_football_data,
        baseline: match,
      });
    }

    // 3. Throttled Live Fetch (less than 2 minutes ago)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const updatedAt = new Date(match.updated_at);
    if (match.api_football_data !== null && updatedAt > twoMinutesAgo) {
      return NextResponse.json({
        cached: true,
        throttled: true,
        data: match.api_football_data,
        baseline: match,
      });
    }

    // If no API football ID is linked yet, just return baseline
    if (!match.api_football_id) {
      return NextResponse.json({
        cached: true,
        rate_limited: false,
        no_link: true,
        data: null,
        baseline: match,
      });
    }

    // 4. Rate Limit Check
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    
    // Upsert today's rate limit row just in case it doesn't exist
    // Using an RPC or secure upsert is better, but this works for demo
    let { data: rateLimitRow } = await adminClient
      .from("api_rate_limits")
      .select("request_count")
      .eq("date", today)
      .single();

    if (!rateLimitRow) {
      const { data: inserted } = await adminClient
        .from("api_rate_limits")
        .insert({ date: today, request_count: 0 })
        .select()
        .single();
      rateLimitRow = inserted || { request_count: 0 };
    }

    if (rateLimitRow && rateLimitRow.request_count >= 95) {
      // Rate limited
      return NextResponse.json({
        rate_limited: true,
        data: match.api_football_data, // could be stale or null
        baseline: match,
      });
    }

    // 5. Fetch from API-Football
    const response = await fetch(`${API_FOOTBALL_BASE_URL}/fixtures?id=${match.api_football_id}`, {
      headers: {
        "x-apisports-key": API_FOOTBALL_KEY || "",
      },
    });

    if (!response.ok) {
      throw new Error(`API-Football error: ${response.status}`);
    }

    const apiFootballData = await response.json();

    // 6. Atomic Update (Increment Rate Limit and save match data)
    // In a production app, we would use a Postgres function to safely increment
    await adminClient
      .from("api_rate_limits")
      .update({ request_count: rateLimitRow.request_count + 1 })
      .eq("date", today);

    await adminClient
      .from("matches")
      .update({
        api_football_data: apiFootballData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({
      cached: false,
      data: apiFootballData,
      baseline: match,
    });

  } catch (error) {
    console.error("Match details fetch error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
