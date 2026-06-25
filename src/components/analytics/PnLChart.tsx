"use client";

import { useMemo, useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PnLChartProps {
  data: { date: string; cumulativePnL: number; dailyPnL: number }[];
}

export function PnLChart({ data }: PnLChartProps) {
  const [viewMode, setViewMode] = useState<"cumulative" | "daily">("cumulative");

  // We want to color the chart green if we are overall profitable, red if at a loss.
  const gradientOffset = useMemo(() => {
    if (data.length === 0) return 0;
    const dataMax = Math.max(...data.map(i => i.cumulativePnL));
    const dataMin = Math.min(...data.map(i => i.cumulativePnL));
    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;
    return dataMax / (dataMax - dataMin);
  }, [data]);

  const isCumulative = viewMode === "cumulative";

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Profit & Loss</CardTitle>
          <CardDescription>Track your betting performance over time</CardDescription>
        </div>
        <div className="flex bg-secondary/50 p-1 rounded-lg">
          <Button 
            variant={isCumulative ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => setViewMode("cumulative")}
            className="text-xs"
          >
            Cumulative
          </Button>
          <Button 
            variant={!isCumulative ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => setViewMode("daily")}
            className="text-xs"
          >
            Daily Spikes
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length <= 1 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border/50">
            Not enough settled bets to generate a chart.
          </div>
        ) : (
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              {isCumulative ? (
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset={gradientOffset} stopColor="#22c55e" stopOpacity={0.8} />
                      <stop offset={gradientOffset} stopColor="#ef4444" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={30} />
                  <YAxis tickFormatter={(value) => `$${value}`} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const pnl = payload[0].value as number;
                        const isProfit = pnl >= 0;
                        return (
                          <div className="bg-background border border-border/50 shadow-xl rounded-lg p-3">
                            <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
                            <p className={`text-lg font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                              {isProfit ? '+' : ''}${pnl.toFixed(2)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="cumulativePnL" stroke="url(#splitColor)" strokeWidth={3} fill="url(#splitColor)" fillOpacity={0.2} activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              ) : (
                <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={30} />
                  <YAxis tickFormatter={(value) => `$${value}`} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const pnl = payload[0].value as number;
                        const isProfit = pnl >= 0;
                        return (
                          <div className="bg-background border border-border/50 shadow-xl rounded-lg p-3">
                            <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
                            <p className={`text-lg font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                              {isProfit ? '+' : ''}${pnl.toFixed(2)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="dailyPnL" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    shape={(props: any) => {
                      const { x, y, width, height, value } = props;
                      const isProfit = value >= 0;
                      return <rect x={x} y={y} width={width} height={height} fill={isProfit ? '#22c55e' : '#ef4444'} rx={4} ry={4} />;
                    }}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
