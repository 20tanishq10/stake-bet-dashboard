const API_KEY = process.env.THESPORTSDB_API_KEY ?? "123";
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;
const LEAGUE_ID = process.env.THESPORTSDB_LEAGUE_ID ?? "4429";
const SEASON = process.env.THESPORTSDB_SEASON ?? "2026";

export const FOCUS_PLAYERS = ["Haaland", "Salah", "Mbappe"] as const;
export const FOCUS_TEAMS = ["Arsenal", "Liverpool", "Barcelona"] as const;

export type TheSportsDbLeague = {
  idLeague: string;
  strLeague: string;
  strSport: string | null;
  strCountry: string | null;
  strBadge: string | null;
  strLogo: string | null;
  strBanner: string | null;
  strDescriptionEN: string | null;
};

export type TheSportsDbTeam = {
  idTeam: string;
  strTeam: string;
  strTeamShort: string | null;
  strBadge: string | null;
  strLogo: string | null;
  strBanner: string | null;
  strFanart1: string | null;
  strCountry: string | null;
  strStadium: string | null;
  intFormedYear: string | null;
  strFlag: string | null;
  strDescriptionEN: string | null;
};

export type TheSportsDbEvent = {
  idEvent: string;
  strEvent: string;
  dateEvent: string | null;
  strTime: string | null;
  idHomeTeam: string;
  idAwayTeam: string;
  strHomeTeam: string | null;
  strAwayTeam: string | null;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strStatus: string | null;
  strProgress: string | null;
  strResult: string | null;
  strSeason: string | null;
};

export type TheSportsDbPlayer = {
  idPlayer: string;
  idTeam: string | null;
  strPlayer: string;
  strTeam: string | null;
  strNationality: string | null;
  dateBorn: string | null;
  strPosition: string | null;
  strCutout: string | null;
  strThumb: string | null;
  strImage: string | null;
  strDescriptionEN: string | null;
};

export type TheSportsDbTableRow = {
  intRank: string | null;
  strTeam: string | null;
  idTeam: string | null;
  strGroup: string | null;
  intPlayed: string | null;
  intWin: string | null;
  intDraw: string | null;
  intLoss: string | null;
  intGoalsFor: string | null;
  intGoalsAgainst: string | null;
  intGoalDifference: string | null;
  intPoints: string | null;
};

type TheSportsDbResponse = Record<string, unknown>;

function extractRows<T>(response: TheSportsDbResponse) {
  const array = Object.values(response).find(Array.isArray);
  return (array ?? []) as T[];
}

function parseString(value: unknown) {
  return value == null ? null : String(value);
}

async function fetchTheSportsDb(path: string, query?: Record<string, string>) {
  const url = new URL(path, `${BASE_URL}/`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url, {
    next: { revalidate: 900 },
  });

  if (!response.ok) {
    throw new Error(`TheSportsDB error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as TheSportsDbResponse;
}

export async function lookupLeague() {
  const data = await fetchTheSportsDb("lookupleague.php", { id: LEAGUE_ID });
  return extractRows<TheSportsDbLeague>(data)[0] ?? null;
}

export async function getWorldCupTeams() {
  const data = await fetchTheSportsDb("search_all_teams.php", { l: "FIFA World Cup" });
  return extractRows<TheSportsDbTeam>(data);
}

export async function searchTeamByName(name: string) {
  const data = await fetchTheSportsDb("searchteams.php", { t: name });
  return extractRows<TheSportsDbTeam>(data);
}

export async function getFocusTeams() {
  const allTeams = await Promise.all(FOCUS_TEAMS.map((name) => searchTeamByName(name)));
  const byId = new Map<string, TheSportsDbTeam>();

  for (const team of allTeams.flat()) {
    byId.set(team.idTeam, team);
  }

  return [...byId.values()];
}

export async function getWorldCupFixtures() {
  const data = await fetchTheSportsDb("eventsseason.php", { id: LEAGUE_ID, s: SEASON });
  return extractRows<TheSportsDbEvent>(data);
}

export async function getWorldCupHistoricalResults() {
  const data = await fetchTheSportsDb("eventslast.php", { id: LEAGUE_ID });
  return extractRows<TheSportsDbEvent>(data);
}

export async function getWorldCupStandings() {
  const data = await fetchTheSportsDb("lookuptable.php", { l: LEAGUE_ID, s: SEASON });
  return extractRows<TheSportsDbTableRow>(data);
}

export async function searchPlayersByName(name: string) {
  const data = await fetchTheSportsDb("searchplayers.php", { p: name });
  return extractRows<TheSportsDbPlayer>(data);
}

export async function lookupPlayerById(playerId: string) {
  const data = await fetchTheSportsDb("lookupplayer.php", { id: playerId });
  return extractRows<TheSportsDbPlayer>(data)[0] ?? null;
}

export async function getEventStats(eventId: string) {
  const data = await fetchTheSportsDb("lookupeventstats.php", { id: eventId });
  return extractRows<Record<string, unknown>>(data);
}

export async function getFocusPlayers() {
  const allPlayers = await Promise.all(FOCUS_PLAYERS.map((name) => searchPlayersByName(name)));
  const byId = new Map<string, TheSportsDbPlayer>();

  for (const player of allPlayers.flat()) {
    byId.set(player.idPlayer, player);
  }

  const resolved = await Promise.all(
    [...byId.values()].map(async (player) => lookupPlayerById(player.idPlayer) ?? player),
  );

  const resolvedById = new Map<string, TheSportsDbPlayer>();
  for (const player of resolved) {
    resolvedById.set(player.idPlayer, player);
  }

  return [...resolvedById.values()];
}

export function mapLeagueRow(league: TheSportsDbLeague | null) {
  if (!league) return null;

  return {
    idLeague: league.idLeague,
    strLeague: league.strLeague,
    strSport: league.strSport,
    strCountry: league.strCountry,
    strBadge: league.strBadge,
    strLogo: league.strLogo,
    strBanner: league.strBanner,
    strDescriptionEN: league.strDescriptionEN,
    raw_payload: league as unknown as Record<string, unknown>,
  };
}

export function mapTeamRow(team: TheSportsDbTeam) {
  return {
    id: Number(team.idTeam),
    league_id: Number(LEAGUE_ID),
    season: SEASON,
    name: team.strTeam,
    short_name: team.strTeamShort,
    badge_url: team.strBadge,
    flag_url: team.strFlag,
    country: team.strCountry,
    stadium: team.strStadium,
    formed_year: team.intFormedYear ? Number(team.intFormedYear) : null,
    raw_payload: team as unknown as Record<string, unknown>,
  };
}

export function mapMatchRow(event: TheSportsDbEvent) {
  const homeScore = event.intHomeScore ? Number(event.intHomeScore) : null;
  const awayScore = event.intAwayScore ? Number(event.intAwayScore) : null;
  let timeString = event.strTime;
  if (timeString && timeString.split(":").length > 2) {
    timeString = timeString.split(":").slice(0, 2).join(":");
  }
  const kickoffAt =
    event.dateEvent && timeString
      ? new Date(`${event.dateEvent}T${timeString}:00Z`).toISOString()
      : event.dateEvent
        ? new Date(`${event.dateEvent}T00:00:00Z`).toISOString()
        : new Date().toISOString();

  return {
    id: Number(event.idEvent),
    league_id: Number(LEAGUE_ID),
    season: Number(event.strSeason ?? SEASON),
    round: event.strProgress ?? null,
    home_team_id: Number(event.idHomeTeam),
    home_team_name: event.strHomeTeam ?? event.strEvent.split(" vs ")[0] ?? "Home Team",
    away_team_id: Number(event.idAwayTeam),
    away_team_name: event.strAwayTeam ?? event.strEvent.split(" vs ")[1] ?? "Away Team",
    kickoff_at: kickoffAt,
    status: event.strStatus ?? "SCHEDULED",
    home_goals: homeScore,
    away_goals: awayScore,
    raw_payload: event as unknown as Record<string, unknown>,
    synced_at: new Date().toISOString(),
  };
}

export function mapStandingsRow(row: TheSportsDbTableRow) {
  return {
    league_id: Number(LEAGUE_ID),
    season: SEASON,
    team_id: row.idTeam ? Number(row.idTeam) : null,
    rank: row.intRank ? Number(row.intRank) : null,
    group_name: row.strGroup ?? null,
    played: row.intPlayed ? Number(row.intPlayed) : null,
    wins: row.intWin ? Number(row.intWin) : null,
    draws: row.intDraw ? Number(row.intDraw) : null,
    losses: row.intLoss ? Number(row.intLoss) : null,
    goals_for: row.intGoalsFor ? Number(row.intGoalsFor) : null,
    goals_against: row.intGoalsAgainst ? Number(row.intGoalsAgainst) : null,
    goal_difference: row.intGoalDifference ? Number(row.intGoalDifference) : null,
    points: row.intPoints ? Number(row.intPoints) : null,
    raw_payload: row as unknown as Record<string, unknown>,
  };
}

export function mapPlayerRow(player: TheSportsDbPlayer) {
  return {
    id: Number(player.idPlayer),
    team_id: player.idTeam ? Number(player.idTeam) : null,
    league_id: Number(LEAGUE_ID),
    season: SEASON,
    name: player.strPlayer,
    firstname: null,
    lastname: null,
    nationality: player.strNationality,
    birth_date: player.dateBorn,
    position: player.strPosition,
    photo_url: player.strCutout ?? player.strThumb ?? player.strImage,
    raw_payload: player as unknown as Record<string, unknown>,
    synced_at: new Date().toISOString(),
  };
}

function statValue(stat: Record<string, unknown>) {
  const home = stat.strHome ?? stat.intHome ?? stat.strHomeTeam ?? stat.home;
  const away = stat.strAway ?? stat.intAway ?? stat.strAwayTeam ?? stat.away;
  const value = stat.strStatValue ?? stat.value ?? stat.strStat ?? stat.strLabel;

  if (home !== undefined || away !== undefined) {
    return `${parseString(home) ?? ""}${home !== undefined || away !== undefined ? " - " : ""}${parseString(away) ?? ""}`.trim();
  }

  return parseString(value);
}

export function mapMatchStatRows(matchId: number, stats: Record<string, unknown>[]) {
  return stats.map((stat) => ({
    match_id: matchId,
    league_id: Number(LEAGUE_ID),
    season: SEASON,
    stat_type: String(stat.strStat ?? stat.strType ?? stat.strLabel ?? stat.name ?? "stat"),
    stat_value: statValue(stat),
    raw_payload: stat as unknown as Record<string, unknown>,
    synced_at: new Date().toISOString(),
  }));
}

export function mapPlayerStatRows(playerId: number, player: TheSportsDbPlayer) {
  return [
    {
      match_id: null,
      player_id: playerId,
      league_id: Number(LEAGUE_ID),
      season: SEASON,
      stat_type: "team",
      stat_value: player.strTeam,
      raw_payload: player as unknown as Record<string, unknown>,
      synced_at: new Date().toISOString(),
    },
    {
      match_id: null,
      player_id: playerId,
      league_id: Number(LEAGUE_ID),
      season: SEASON,
      stat_type: "position",
      stat_value: player.strPosition,
      raw_payload: player as unknown as Record<string, unknown>,
      synced_at: new Date().toISOString(),
    },
    {
      match_id: null,
      player_id: playerId,
      league_id: Number(LEAGUE_ID),
      season: SEASON,
      stat_type: "nationality",
      stat_value: player.strNationality,
      raw_payload: player as unknown as Record<string, unknown>,
      synced_at: new Date().toISOString(),
    },
  ];
}
