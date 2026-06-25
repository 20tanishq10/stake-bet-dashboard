"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type ActiveBetRow = {
  id: string;
  stake_amount: number;
  share_pct: number;
  joined_at: string;
  bets: {
    id: string;
    title: string;
    status: string;
  } | null;
};

export function HoverActiveBets({ liveActiveBets }: { liveActiveBets: ActiveBetRow[] }) {
  const count = liveActiveBets.length;
  const recentBets = liveActiveBets.slice(0, 3);

  return (
    <HoverCard openDelay={200} closeDelay={200}>
      <HoverCardTrigger asChild>
        <div className="cursor-pointer h-full">
          <Card className="hover:border-primary/50 transition-colors h-full">
            <CardHeader className="pb-2">
              <CardDescription>Active bets</CardDescription>
              <CardTitle className="text-2xl">{count}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0" align="start">
        <div className="p-4 border-b">
          <h4 className="text-sm font-semibold">Your Open Positions</h4>
          <p className="text-xs text-muted-foreground mt-1">
            You currently have {count} active bets.
          </p>
        </div>
        <div className="flex flex-col">
          {recentBets.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No active bets.
            </div>
          ) : (
            recentBets.map(entry => (
              <div key={entry.id} className="p-3 border-b text-sm flex justify-between items-center hover:bg-muted/50 transition-colors">
                <div className="flex flex-col gap-1 overflow-hidden pr-2">
                  <span className="font-medium truncate">{entry.bets?.title}</span>
                  <span className="text-xs text-muted-foreground">Stake: ${entry.stake_amount.toFixed(2)}</span>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">{entry.bets?.status}</Badge>
              </div>
            ))
          )}
        </div>
        <div className="p-2 bg-muted/20">
          <Link href="/activity">
            <Button variant="ghost" className="w-full text-xs justify-between" size="sm">
              View all in Activity
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
