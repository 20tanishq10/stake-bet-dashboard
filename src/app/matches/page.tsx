import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MatchesPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline">Phase 3</Badge>
        <h1 className="mt-2 text-2xl font-semibold">World Cup Matches</h1>
        <p className="text-muted-foreground">
          Fixtures filtered to FIFA World Cup 2026 via API-Football.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fixture browser shell</CardTitle>
          <CardDescription>
            Cached in Supabase <code>matches</code> table; synced by cron route.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Integration points:{" "}
          <code className="text-foreground">src/lib/api-football/client.ts</code>{" "}
          and{" "}
          <code className="text-foreground">src/app/api/cron/sync-matches/route.ts</code>
        </CardContent>
      </Card>
    </div>
  );
}
