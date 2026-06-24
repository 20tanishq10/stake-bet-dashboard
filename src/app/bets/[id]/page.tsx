import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { JoinBetForm } from "./JoinBetForm";

export default async function BetDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: bet }, { data: profile }] = await Promise.all([
    supabase.from("bets").select("*, matches(home_team, away_team, status)").eq("id", id).single(),
    user ? supabase.from("profiles").select("id, role, is_broker, wallet_balance, display_name").eq("id", user.id).single() : { data: null }
  ]);

  if (!bet) return <div className="p-6">Bet not found.</div>;

  const isBrokerOrHost = profile?.role === "host" || profile?.is_broker === true;

  // If broker, fetch interested users to allow pooling
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let interestedUsers: any[] = [];
  if (isBrokerOrHost) {
    const { data } = await supabase.from("profiles").select("id, display_name, wallet_balance").eq("is_interested", true);
    interestedUsers = data || [];
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Badge variant="outline">Bet Details</Badge>
        <h1 className="mt-2 text-2xl font-semibold">{bet.title}</h1>
        <p className="text-muted-foreground">{bet.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pool Funding</CardTitle>
          <CardDescription>Allocate stakes to join this bet pool.</CardDescription>
        </CardHeader>
        <CardContent>
          {bet.status === "open" ? (
            <JoinBetForm 
              betId={bet.id} 
              currentUser={profile} 
              isBroker={isBrokerOrHost} 
              interestedUsers={interestedUsers} 
            />
          ) : (
            <p className="text-sm text-muted-foreground">This bet is currently {bet.status} and cannot accept new stakes.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
