import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const placeholders = [
  { label: "Wallet balance", value: "—" },
  { label: "Open exposure", value: "—" },
  { label: "Realized PnL", value: "—" },
  { label: "Active bets", value: "—" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline">Phase 2</Badge>
        <h1 className="mt-2 text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Per-user wallet, exposure, and PnL summary.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {placeholders.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-2xl">{item.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Not implemented yet</CardTitle>
          <CardDescription>
            Wallet ledger queries and PnL aggregation land in Phase 2.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          See <code className="text-foreground">docs/data-model.md</code> for
          ledger types and settlement math.
        </CardContent>
      </Card>
    </div>
  );
}
