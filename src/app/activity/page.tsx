import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

type ActivityRow = {
  id: string;
  event_type: string;
  created_at: string;
  metadata: Record<string, unknown>;
};

export default async function ActivityPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("activity_logs")
    .select("id, event_type, created_at, metadata")
    .order("created_at", { ascending: false })
    .limit(20);

  const activity = (data ?? []) as ActivityRow[];

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline">Phase 3</Badge>
        <h1 className="mt-2 text-2xl font-semibold">Activity Log</h1>
        <p className="text-muted-foreground">
          Append-only audit trail for wallet and bet events.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent events</CardTitle>
          <CardDescription>
            Backed by <code>activity_logs</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="rounded-lg border p-3">
                <p className="font-medium">{item.event_type}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
