import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data: matches } = await supabase.from('matches').select('id, home_team, away_team, match_time').limit(5);
  console.log("Matches:", matches);
  
  // Test api-sports
  const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;
  const res = await fetch("https://v3.football.api-sports.io/players/topscorers?season=2026&league=15", {
    headers: { "x-apisports-key": API_FOOTBALL_KEY }
  });
  const json = await res.json();
  console.log("API Sports Topscorers:", JSON.stringify(json, null, 2));
}

main();
