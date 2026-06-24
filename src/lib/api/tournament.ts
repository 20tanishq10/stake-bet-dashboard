const API_FOOTBALL_BASE_URL = process.env.API_FOOTBALL_BASE_URL || "https://v3.football.api-sports.io";
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || "";
const LEAGUE_ID = process.env.API_FOOTBALL_WC_LEAGUE_ID || "1";
const OPEN_API_URL = "https://worldcup26.ir/get";

export type PlayerStat = {
  player: {
    id: number;
    name: string;
    photo: string;
  };
  statistics: Array<{
    team: {
      id: number;
      name: string;
      logo: string;
    };
    goals: {
      total: number | null;
      assists: number | null;
    };
    cards: {
      yellow: number | null;
      red: number | null;
    };
  }>;
};

export async function getPlayerStats(endpoint: string): Promise<PlayerStat[]> {
  const url = `${API_FOOTBALL_BASE_URL}/players/${endpoint}?season=2026&league=${LEAGUE_ID}`;
  
  if (!API_FOOTBALL_KEY) {
    console.warn("API_FOOTBALL_KEY not set. Returning empty stats.");
    return [];
  }

  // Next.js native caching: revalidate every 6 hours (21600 seconds)
  // This ensures we only make ~4 requests per 6 hours, staying well under the 100 req/day limit.
  const response = await fetch(url, {
    headers: {
      "x-rapidapi-host": "v3.football.api-sports.io",
      "x-rapidapi-key": API_FOOTBALL_KEY,
    },
    next: { revalidate: 21600 },
  });

  if (!response.ok) {
    console.error(`Failed to fetch ${endpoint} from API-Football:`, response.status);
    return [];
  }

  const data = await response.json();
  return data.response || [];
}

export async function getOpenApiGroups() {
  const response = await fetch(`${OPEN_API_URL}/groups`, {
    next: { revalidate: 3600 }, // 1 hour cache
  });
  if (!response.ok) return [];
  const data = await response.json();
  return data.groups || [];
}

export async function getOpenApiTeams() {
  const response = await fetch(`${OPEN_API_URL}/teams`, {
    next: { revalidate: 86400 }, // 24 hours cache (teams rarely change)
  });
  if (!response.ok) return [];
  const data = await response.json();
  return data.teams || [];
}
