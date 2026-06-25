"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClientTime } from "@/components/ui/ClientTime";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type MatchRow = {
  id: string;
  home_team: string;
  away_team: string;
  match_time: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
};

export function MatchCardInteractive({ match }: { match: MatchRow }) {
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && !details) {
      setLoading(true);
      fetch(`/api/matches/${match.id}/details`)
        .then((res) => res.json())
        .then((data) => {
          setDetails(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch match details", err);
          setLoading(false);
        });
    }
  }, [open, match.id, details]);

  const apiData = details?.data;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="rounded-lg border p-3 flex flex-col justify-between shadow-sm bg-muted/20 cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex justify-between items-center mb-3">
            <Badge variant={match.status === "finished" ? "secondary" : "default"} className="text-[10px] px-1 py-0">
              {match.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              <ClientTime timeString={match.match_time} />
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center font-medium">
              <span>{match.home_team || "TBD"}</span>
              <span className="tabular-nums">{match.home_score ?? "-"}</span>
            </div>
            <div className="flex justify-between items-center font-medium">
              <span>{match.away_team || "TBD"}</span>
              <span className="tabular-nums">{match.away_score ?? "-"}</span>
            </div>
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Match Details</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="flex justify-between items-center text-center">
            <div className="space-y-2 flex-1">
              <p className="font-bold text-lg">{match.home_team || "TBD"}</p>
              <p className="text-2xl font-black">{match.home_score ?? "-"}</p>
            </div>
            <div className="text-muted-foreground px-4 font-semibold">VS</div>
            <div className="space-y-2 flex-1">
              <p className="font-bold text-lg">{match.away_team || "TBD"}</p>
              <p className="text-2xl font-black">{match.away_score ?? "-"}</p>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            {new Date(match.match_time).toLocaleString()}
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm border-b pb-2">Live Insights</h4>
            {loading ? (
              <p className="text-sm text-muted-foreground animate-pulse text-center py-4">Fetching live data...</p>
            ) : !apiData ? (
              <p className="text-sm text-muted-foreground text-center py-4">No detailed statistics available yet.</p>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Referee</span>
                  <span>{apiData[0]?.fixture?.referee || "TBA"}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Venue</span>
                  <span>{apiData[0]?.fixture?.venue?.name || "TBA"}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Time Elapsed</span>
                  <span>{apiData[0]?.fixture?.status?.elapsed ? `${apiData[0].fixture.status.elapsed}'` : "Not started"}</span>
                </div>
                {apiData[0]?.events && apiData[0].events.length > 0 && (
                  <div className="mt-4 pt-2">
                    <h5 className="font-medium text-xs mb-2 uppercase text-muted-foreground">Key Events</h5>
                    <ul className="space-y-2">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {apiData[0].events.slice(0, 4).map((evt: any, idx: number) => (
                        <li key={idx} className="flex gap-2 text-xs">
                          <span className="font-medium w-8">{evt.time.elapsed}&apos;</span>
                          <span>{evt.type} - {evt.player.name} ({evt.team.name})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="pt-4 flex justify-center border-t border-border/50">
            <Link 
              href={`/bets/create?matchId=${match.id}&prompt=${encodeURIComponent(`${match.home_team || "TBD"} vs ${match.away_team || "TBD"}: `)}`} 
              className="w-full"
            >
              <Button className="w-full font-bold">
                + Place Bet on this Match
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
