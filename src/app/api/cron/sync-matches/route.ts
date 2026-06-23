import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import {
  getEventStats,
  getFocusPlayers,
  getFocusTeams,
  getWorldCupFixtures,
  getWorldCupHistoricalResults,
  getWorldCupStandings,
  getWorldCupTeams,
  lookupLeague,
  mapMatchRow,
  mapMatchStatRows,
  mapPlayerRow,
  mapPlayerStatRows,
  mapStandingsRow,
  mapTeamRow,
} from "@/lib/thesportsdb/client";

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  const secretHeader = request.headers.get("x-cron-secret");
  return (
    authHeader === `Bearer ${cronSecret}` ||
    secretHeader === cronSecret
  );
}

function adminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase credentials are not configured");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

function finishedMatchIds(
  fixtures: Awaited<ReturnType<typeof getWorldCupFixtures>>,
  results: Awaited<ReturnType<typeof getWorldCupHistoricalResults>>,
) {
  const ids = new Set<number>();

  for (const event of [...fixtures, ...results]) {
    const status = (event.strStatus ?? "").toUpperCase();
    const hasScore = event.intHomeScore != null && event.intAwayScore != null;
    if (hasScore || status.includes("FT") || status.includes("FINISH")) {
      ids.add(Number(event.idEvent));
    }
  }

  return [...ids];
}

async function syncMatchStats(matchIds: number[]) {
  const settled = await Promise.allSettled(matchIds.map((matchId) => getEventStats(String(matchId))));
  const rows: ReturnType<typeof mapMatchStatRows>[number][] = [];

  settled.forEach((result, index) => {
    if (result.status === "fulfilled") {
      rows.push(...mapMatchStatRows(matchIds[index], result.value));
    }
  });

  return rows;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = adminClient();
  const league = await lookupLeague();
  const [teams, focusTeams, fixtures, results, standings, focusPlayers] = await Promise.all([
    getWorldCupTeams(),
    getFocusTeams(),
    getWorldCupFixtures(),
    getWorldCupHistoricalResults(),
    getWorldCupStandings(),
    getFocusPlayers(),
  ]);

  const allTeams = [...teams, ...focusTeams];
  const teamById = new Map(allTeams.map((team) => [team.idTeam, team]));
  const teamRows = [...teamById.values()].map(mapTeamRow);
  const fixtureRows = fixtures.map(mapMatchRow);
  const resultRows = results.map(mapMatchRow);
  const standingsRows = standings.map(mapStandingsRow);
  const playerRows = focusPlayers.map(mapPlayerRow);
  const playerStatRows = focusPlayers.flatMap((player) =>
    mapPlayerStatRows(Number(player.idPlayer), player),
  );
  const matchStatRows = await syncMatchStats(finishedMatchIds(fixtures, results));

  const [teamsResult, fixturesResult, resultsResult, standingsResult, playersResult, playerStatsResult, matchStatsResult] =
    await Promise.all([
      supabase.from("teams").upsert(teamRows, { onConflict: "id" }),
      supabase.from("matches").upsert(fixtureRows, { onConflict: "id" }),
      supabase.from("matches").upsert(resultRows, { onConflict: "id" }),
      supabase.from("standings").upsert(standingsRows, { onConflict: "league_id,season,team_id,group_name" }),
      supabase.from("players").upsert(playerRows, { onConflict: "id" }),
      supabase.from("player_stats").upsert(playerStatRows, { onConflict: "player_id,stat_type,season" }),
      supabase.from("match_stats").upsert(matchStatRows, { onConflict: "match_id,stat_type" }),
    ]);

  const firstError =
    teamsResult.error ??
    fixturesResult.error ??
    resultsResult.error ??
    standingsResult.error ??
    playersResult.error ??
    playerStatsResult.error ??
    matchStatsResult.error;

  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 });
  }

  return NextResponse.json({
    synced: {
      league: league?.idLeague ? 1 : 0,
      teams: teamRows.length,
      fixtures: fixtureRows.length,
      results: resultRows.length,
      standings: standingsRows.length,
      players: playerRows.length,
      playerStats: playerStatRows.length,
      matchStats: matchStatRows.length,
    },
  });
}
