const BASE_URL =
  process.env.API_FOOTBALL_BASE_URL ?? "https://v3.football.api-sports.io";

export type ApiFootballFixture = {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string };
  };
  league: { id: number; season: number; round: string | null };
  teams: {
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  goals: { home: number | null; away: number | null };
};

type ApiFootballResponse<T> = {
  response: T[];
  errors: Record<string, string> | unknown[];
};

function headers(): HeadersInit {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) throw new Error("API_FOOTBALL_KEY is not configured");
  return { "x-apisports-key": key };
}

async function fetchApi<T>(path: string, params?: Record<string, string>) {
  const url = new URL(path, BASE_URL);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url, {
    headers: headers(),
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`API-Football error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as ApiFootballResponse<T>;
  return data.response;
}

/** FIFA World Cup fixtures for configured league + season */
export async function getWorldCupFixtures(season: number) {
  const leagueId = process.env.API_FOOTBALL_WC_LEAGUE_ID ?? "1";

  return fetchApi<ApiFootballFixture>("/fixtures", {
    league: leagueId,
    season: String(season),
  });
}

export async function getFixtureById(fixtureId: number) {
  const fixtures = await fetchApi<ApiFootballFixture>("/fixtures", {
    id: String(fixtureId),
  });
  return fixtures[0] ?? null;
}

export function mapFixtureToMatchRow(fixture: ApiFootballFixture) {
  return {
    id: fixture.fixture.id,
    league_id: fixture.league.id,
    season: fixture.league.season,
    round: fixture.league.round,
    home_team_id: fixture.teams.home.id,
    home_team_name: fixture.teams.home.name,
    away_team_id: fixture.teams.away.id,
    away_team_name: fixture.teams.away.name,
    kickoff_at: fixture.fixture.date,
    status: fixture.fixture.status.short,
    home_goals: fixture.goals.home,
    away_goals: fixture.goals.away,
    raw_payload: fixture as unknown as Record<string, unknown>,
  };
}
