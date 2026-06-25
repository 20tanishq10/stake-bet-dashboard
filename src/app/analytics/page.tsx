import { getUserAnalytics } from "@/lib/api/analytics";
import { PnLChart } from "@/components/analytics/PnLChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, DollarSign, Target } from "lucide-react";

export default async function AnalyticsPage() {
  const { success, data, error } = await getUserAnalytics();

  if (!success || !data) {
    return (
      <div className="p-8 text-center text-destructive">
        Failed to load analytics: {error || "Unknown error"}
      </div>
    );
  }

  const isProfitable = data.totalPnL >= 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pt-8">
      <div>
        <Badge variant="outline" className="mb-2">Performance Metrics</Badge>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track your betting profitability, win rates, and historical statistics.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total PnL</CardTitle>
            <DollarSign className={`h-4 w-4 ${isProfitable ? "text-green-500" : "text-red-500"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isProfitable ? "text-green-500" : "text-red-500"}`}>
              {isProfitable ? "+" : ""}${data.totalPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Net profit across all settled bets
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {data.winRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Percentage of bets won
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              ${data.totalVolume.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total amount staked
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
            <div className="h-4 w-4 text-purple-500 flex items-center justify-center font-black">#</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {data.totalBets}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total active and settled bets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <PnLChart data={data.chartData} />

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Settlement History</CardTitle>
        </CardHeader>
        <CardContent>
          {data.history.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No settled bets yet.
            </div>
          ) : (
            <div className="space-y-4">
              {data.history.slice(0, 10).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/10 hover:bg-secondary/20 transition-colors">
                  <div>
                    <p className="font-medium">{item.betTitle}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={item.result === "win" ? "default" : item.result === "loss" ? "destructive" : "secondary"}>
                      {item.result.toUpperCase()}
                    </Badge>
                    <div className={`font-bold tabular-nums min-w-[80px] text-right ${item.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {item.pnl >= 0 ? "+" : ""}${item.pnl.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
