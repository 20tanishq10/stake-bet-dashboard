import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ApproveBetButton } from "./ApproveBetButton";

export default async function BetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: bets }, { data: profile }] = await Promise.all([
    supabase
      .from("bets")
      .select("*, matches(home_team, away_team)")
      .order("created_at", { ascending: false }),
    user ? supabase
      .from("profiles")
      .select("role, is_broker")
      .eq("id", user.id)
      .single() : { data: null }
  ]);

  const isBrokerOrHost = profile?.role === "host" || profile?.is_broker === true;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Badge variant="outline">Phase 4</Badge>
          <h1 className="mt-2 text-2xl font-semibold">Bets & Pools</h1>
          <p className="text-muted-foreground">
            View all standard and AI-crazy bets across the group.
          </p>
        </div>
        <Link href="/bets/create">
          <Button>+ Create Bet</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(!bets || bets.length === 0) ? (
          <Card className="col-span-full">
            <CardContent className="pt-6 text-center text-muted-foreground">
              No bets created yet. Be the first to start a pool!
            </CardContent>
          </Card>
        ) : (
          bets.map((bet) => (
            <Card key={bet.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-base line-clamp-1">{bet.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    {isBrokerOrHost && bet.status === "draft" && (
                      <ApproveBetButton betId={bet.id} />
                    )}
                    <Badge variant={bet.status === 'open' ? 'default' : 'secondary'} className="text-[10px]">
                      {bet.status}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-xs">
                  {bet.matches?.home_team} vs {bet.matches?.away_team}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {bet.description}
                </p>
                <div className="mt-auto flex justify-between items-center text-xs font-medium border-t pt-3 mb-3">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <span className="text-muted-foreground">Type: {(bet.rule as any)?.mechanism === 'llm_crazy' ? 'AI Crazy' : 'Standard'}</span>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <span>Odds: {(bet.rule as any)?.odds ?? '-'}</span>
                </div>
                <Link href={`/bets/${bet.id}`} className="w-full">
                  <Button variant="outline" className="w-full" size="sm">View & Join Bet</Button>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
