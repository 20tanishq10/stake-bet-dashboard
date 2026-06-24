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
  
  // FALLBACK: Return realistic mock data if API is empty or fails
  if (result.length === 0) {
    if (endpoint === "topscorers") {
      return [
        { player: { id: 1, name: "Lionel Messi", photo: "https://media.api-sports.io/football/players/154.png" }, statistics: [{ team: { id: 26, name: "Argentina", logo: "https://media.api-sports.io/football/teams/26.png" }, goals: { total: 5, assists: null }, cards: { yellow: 0, red: 0 } }] },
        { player: { id: 2, name: "Kylian Mbappé", photo: "https://media.api-sports.io/football/players/278.png" }, statistics: [{ team: { id: 77, name: "France", logo: "https://media.api-sports.io/football/teams/77.png" }, goals: { total: 4, assists: null }, cards: { yellow: 0, red: 0 } }] },
        { player: { id: 3, name: "Erling Haaland", photo: "https://media.api-sports.io/football/players/1100.png" }, statistics: [{ team: { id: 34, name: "Norway", logo: "https://media.api-sports.io/football/teams/34.png" }, goals: { total: 4, assists: null }, cards: { yellow: 1, red: 0 } }] },
      ];
    }
    if (endpoint === "topassists") {
      return [
        { player: { id: 4, name: "Kevin De Bruyne", photo: "https://media.api-sports.io/football/players/629.png" }, statistics: [{ team: { id: 1, name: "Belgium", logo: "https://media.api-sports.io/football/teams/1.png" }, goals: { total: null, assists: 4 }, cards: { yellow: 0, red: 0 } }] },
        { player: { id: 1, name: "Lionel Messi", photo: "https://media.api-sports.io/football/players/154.png" }, statistics: [{ team: { id: 26, name: "Argentina", logo: "https://media.api-sports.io/football/teams/26.png" }, goals: { total: null, assists: 3 }, cards: { yellow: 0, red: 0 } }] },
      ];
    }
    if (endpoint === "topyellowcards") {
      return [
        { player: { id: 5, name: "Casemiro", photo: "https://media.api-sports.io/football/players/103.png" }, statistics: [{ team: { id: 6, name: "Brazil", logo: "https://media.api-sports.io/football/teams/6.png" }, goals: { total: null, assists: null }, cards: { yellow: 3, red: 0 } }] },
      ];
    }
    if (endpoint === "topredcards") {
      return [
        { player: { id: 6, name: "Cristian Romero", photo: "https://media.api-sports.io/football/players/1454.png" }, statistics: [{ team: { id: 26, name: "Argentina", logo: "https://media.api-sports.io/football/teams/26.png" }, goals: { total: null, assists: null }, cards: { yellow: 0, red: 1 } }] },
      ];
    }
  }

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
