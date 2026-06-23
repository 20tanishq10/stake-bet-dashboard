import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline">Phase 2</Badge>
        <h1 className="mt-2 text-2xl font-semibold">Activity Log</h1>
        <p className="text-muted-foreground">
          Append-only audit trail for wallet and bet events.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event feed shell</CardTitle>
          <CardDescription>
            Backed by <code>activity_logs</code> and{" "}
            <code>wallet_ledger</code> tables.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Host adjustments, stake locks, and settlement payouts all emit log
          entries for transparency across the friend group.
        </CardContent>
      </Card>
    </div>
  );
}
