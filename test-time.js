import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function main() {
  const { data: matches } = await supabase.from('matches').select('id, home_team, away_team, match_time').limit(2);
  console.log("Matches:", matches);
}
main();
