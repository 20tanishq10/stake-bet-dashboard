import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

type ActiveBetRow = {
  id: string;
  stake_amount: number;
  share_pct: number;
  payout_amount: number | null;
  joined_at: string;
  bets: {
    id: string;
    title: string;
    status: string;
    lock_at: string | null;
    net_result: number | null;
  } | null;
};

type ActivityRow = {
  id: string;
  event_type: string;
  created_at: string;
  metadata: Record<string, unknown>;
};

type ProfileRow = {
  display_name: string | null;
  wallet_balance: number | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: activeBets }, { data: activity }] = await Promise.all([
    supabase.from("profiles").select("display_name, wallet_balance").eq("id", user?.id ?? "").maybeSingle(),
    supabase
      .from("bet_participations")
      .select("id, stake_amount, share_pct, payout_amount, joined_at, bets(id, title, status, lock_at, net_result)")
      .eq("user_id", user?.id ?? "")
      .order("joined_at", { ascending: false }),
    supabase
      .from("activity_logs")
      .select("id, event_type, created_at, metadata")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const liveActiveBets = ((activeBets ?? []) as unknown as ActiveBetRow[]).filter(
    (entry) => entry.bets && entry.bets.status !== "settled",
  );

  const recentActivity = (activity ?? []) as ActivityRow[];
  const typedProfile = profile as ProfileRow | null;

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline">Phase 3</Badge>
        <h1 className="mt-2 text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Wallet, active bets, and recent group activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Wallet balance</CardDescription>
            <CardTitle className="text-2xl">{typedProfile?.wallet_balance?.toFixed(2) ?? "0.00"}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active bets</CardDescription>
            <CardTitle className="text-2xl">{liveActiveBets.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Member</CardDescription>
            <CardTitle className="text-2xl">{typedProfile?.display_name ?? user?.email ?? "User"}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active bets</CardTitle>
            <CardDescription>Your open and pending positions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {liveActiveBets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active bets yet.</p>
            ) : (
              liveActiveBets.map((entry) => (
                <div key={entry.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{entry.bets?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(entry.joined_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="secondary">{entry.bets?.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Stake {entry.stake_amount.toFixed(2)} · Share {Math.round(entry.share_pct * 100)}%
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
            <CardDescription>Latest wallet and bet events across the group.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing to show yet.</p>
            ) : (
              recentActivity.map((item) => (
                <div key={item.id} className="rounded-lg border p-3">
                  <p className="font-medium">{item.event_type}</p>
                  <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
