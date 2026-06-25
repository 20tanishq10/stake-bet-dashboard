import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { ActivityTabs } from "@/components/activity/ActivityTabs";

type ActiveBetRow = {
  id: string;
  stake_amount: number;
  share_pct: number;
  joined_at: string;
  bets: {
    id: string;
    title: string;
    status: string;
    net_result: number | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rule?: any;
  } | null;
};

type ActivityRow = {
  id: string;
  event_type: string;
  created_at: string;
  metadata: Record<string, unknown>;
};

export default async function ActivityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: activityData }, { data: betsData }] = await Promise.all([
    supabase
      .from("activity_logs")
      .select("id, event_type, created_at, metadata")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("bet_participations")
      .select("id, stake_amount, share_pct, joined_at, bets(id, title, status, net_result, rule)")
      .eq("user_id", user?.id ?? "")
      .order("joined_at", { ascending: false })
  ]);

  const activity = (activityData ?? []) as ActivityRow[];
  const allParticipations = (betsData ?? []) as unknown as ActiveBetRow[];

  const liveActiveBets = allParticipations.filter(
    (entry) => entry.bets && entry.bets.status !== "settled",
  );

  const settledBets = allParticipations.filter(
    (entry) => entry.bets && entry.bets.status === "settled",
  );

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline">Phase 4 (Live)</Badge>
        <h1 className="mt-2 text-2xl font-semibold">Activity Hub</h1>
        <p className="text-muted-foreground mt-1">
          Track your active positions, betting history, and wallet audit trail.
        </p>
      </div>

      <ActivityTabs 
        liveActiveBets={liveActiveBets} 
        settledBets={settledBets} 
        activity={activity} 
      />
    </div>
  );
}

