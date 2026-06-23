import { NextResponse } from "next/server";

import {
  getWorldCupFixtures,
  mapFixtureToMatchRow,
} from "@/lib/api-football/client";
import { createClient } from "@supabase/supabase-js";

/**
 * Vercel Cron: sync WC 2026 fixtures into Supabase `matches` table.
 * Schedule in vercel.json — e.g. every 6 hours pre-tournament, tighter during WC.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const season = 2026;
  const fixtures = await getWorldCupFixtures(season);
  const rows = fixtures.map(mapFixtureToMatchRow);

  const { error } = await supabase.from("matches").upsert(rows, { onConflict: "id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ synced: rows.length, season });
}
