import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function BetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline">Phase 4</Badge>
        <h1 className="mt-2 text-2xl font-semibold">Pooled Bets</h1>
        <p className="text-muted-foreground">
          Friends co-invest against external markets; payouts are proportional
          to stake share.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bet lifecycle</CardTitle>
          <CardDescription>
            draft → open → locked → pending_settlement → settled | void
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Rule schema lives in{" "}
          <code className="text-foreground">src/types/bet-rules.ts</code>.
          Settlement math in{" "}
          <code className="text-foreground">src/lib/settlement/proportional.ts</code>.
        </CardContent>
      </Card>
    </div>
  );
}
