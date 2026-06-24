import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { CreateBetForm } from "./CreateBetForm";

export default async function CreateBetPage() {
  const supabase = await createClient();

  const { data: matches } = await supabase
    .from("matches")
    .select("id, home_team, away_team, match_time")
    .order("match_time", { ascending: true });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Badge variant="outline">Phase 4</Badge>
        <h1 className="mt-2 text-2xl font-semibold">Create New Bet</h1>
        <p className="text-muted-foreground">
          Deploy standard pool bets or use the Gemini AI to create crazy custom parlays.
        </p>
      </div>
      <CreateBetForm matches={matches ?? []} />
    </div>
  );
}
