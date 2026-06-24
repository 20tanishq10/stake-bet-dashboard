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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any = null;
  if (API_FOOTBALL_KEY) {
    try {
      const response = await fetch(url, {
        headers: {
          "x-apisports-key": API_FOOTBALL_KEY,
        },
        next: { revalidate: 21600 },
      });
      if (response.ok) {
        data = await response.json();
      }
    } catch (e) {
      console.error(`Failed to fetch ${endpoint} from API-Football:`, e);
    }
  }

  const result = data?.response || [];
  
  // Because the 2026 World Cup hasn't started, the live API naturally returns empty arrays.
  // We now return those empty arrays instead of returning fake mock data.

  return result;
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
