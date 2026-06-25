"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

export function ActivityTabs({ 
  liveActiveBets, 
  settledBets, 
  activity 
}: { 
  liveActiveBets: ActiveBetRow[];
  settledBets: ActiveBetRow[];
  activity: ActivityRow[];
}) {
  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="active">Active Bets</TabsTrigger>
        <TabsTrigger value="past">Past Bets</TabsTrigger>
        <TabsTrigger value="wallet">Wallet Logs</TabsTrigger>
      </TabsList>

      <TabsContent value="active">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Active Bets</CardTitle>
            <CardDescription>All your open, draft, and locked positions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {liveActiveBets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active bets yet.</p>
            ) : (
              liveActiveBets.map((entry) => (
                <div key={entry.id} className="rounded-lg border p-4 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                  <div>
                    <p className="font-medium">{entry.bets?.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Joined {new Date(entry.joined_at).toLocaleString()}
                    </p>
                    <p className="text-sm font-semibold mt-2 text-primary">
                      Stake: ${entry.stake_amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={entry.bets?.status === 'open' ? 'default' : 'secondary'}>{entry.bets?.status}</Badge>
                    <Link href={`/bets/${entry.bets?.id}`}>
                      <Button variant="outline" size="sm">View Bet</Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="past">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Past Bets</CardTitle>
            <CardDescription>Your settled bet history and profit/loss.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {settledBets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No past bets yet.</p>
            ) : (
              settledBets.map((entry) => {
                const isWin = entry.bets?.net_result === 1;
                const isLoss = entry.bets?.net_result === -1;
                const odds = entry.bets?.rule?.odds || 1;
                
                let pnlText = "$0.00";
                let pnlClass = "text-muted-foreground";
                
                if (isWin) {
                  const profit = entry.stake_amount * (odds - 1);
                  pnlText = `+$${profit.toFixed(2)}`;
                  pnlClass = "text-green-500 font-bold";
                } else if (isLoss) {
                  pnlText = `-$${entry.stake_amount.toFixed(2)}`;
                  pnlClass = "text-destructive font-bold";
                }

                return (
                  <div key={entry.id} className="rounded-lg border p-4 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                    <div>
                      <p className="font-medium">{entry.bets?.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Settled • Stake: ${entry.stake_amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Result</p>
                        <p className={pnlClass}>{pnlText}</p>
                      </div>
                      <Link href={`/bets/${entry.bets?.id}`}>
                        <Button variant="outline" size="sm">Details</Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="wallet">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Wallet Logs</CardTitle>
            <CardDescription>Raw audit trail of wallet transactions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="rounded-lg border p-3 flex justify-between items-center">
                  <p className="font-medium text-sm">{item.event_type}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
