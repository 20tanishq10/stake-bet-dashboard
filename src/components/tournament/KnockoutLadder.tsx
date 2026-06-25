"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClientTime } from "@/components/ui/ClientTime";

type MatchRow = {
  id: string;
  home_team: string;
  away_team: string;
  match_time: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  stage: string | null;
};

// Simulated fixed dates for the WC 2026 Knockout Stage
const STAGE_DATES: Record<string, string> = {
  "Round of 32": "Jun 28 - Jul 3, 2026",
  "Round of 16": "Jul 4 - Jul 7, 2026",
  "Quarter-finals": "Jul 9 - Jul 11, 2026",
  "Semi-finals": "Jul 14 - Jul 15, 2026",
  "Final": "Jul 19, 2026",
};

export function KnockoutLadder({ matches }: { matches: MatchRow[] }) {
  const knockoutStages = [
    "Round of 32",
    "Round of 16",
    "Quarter-finals",
    "Semi-finals",
    "Final",
  ];

  const expectedMatches: Record<string, number> = {
    "Round of 32": 16,
    "Round of 16": 8,
    "Quarter-finals": 4,
    "Semi-finals": 2,
    "Final": 1,
  };

  const knockoutMatches = matches.filter((m) => m.stage && knockoutStages.includes(m.stage));

  const grouped = knockoutStages.reduce((acc, stage) => {
    acc[stage] = knockoutMatches.filter((m) => m.stage === stage);
    return acc;
  }, {} as Record<string, MatchRow[]>);

  const [selectedMatch, setSelectedMatch] = useState<MatchRow | null>(null);

  return (
    <div className="w-full overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-primary/20">
      <div className="flex flex-row min-w-max space-x-12 px-8 items-stretch min-h-[1400px] bg-background/50 rounded-xl p-8 border shadow-inner">
        {knockoutStages.map((stage, colIndex) => {
          const actualMatches = grouped[stage] || [];
          const expected = expectedMatches[stage];
          const paddingCount = Math.max(0, expected - actualMatches.length);
          
          const paddingMatches = Array.from({ length: paddingCount }).map((_, i) => ({
            id: `tbd-${stage}-${i}`,
            home_team: "TBD",
            away_team: "TBD",
            match_time: "", 
            status: "Scheduled",
            home_score: null,
            away_score: null,
            stage: stage,
          }));

          const displayMatches = [...actualMatches, ...paddingMatches];

          return (
            <div key={stage} className="flex flex-col w-[260px] flex-shrink-0 relative">
              <div className="text-center sticky top-0 bg-background/95 backdrop-blur z-10 py-4 mb-4 border-b">
                <h3 className="font-bold uppercase tracking-widest text-primary">
                  {stage}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {STAGE_DATES[stage]}
                </p>
              </div>
              
              <div className="flex flex-col justify-around flex-1 py-4 relative">
                {displayMatches.map((match, i) => {
                  const isTopNode = i % 2 === 0;
                  const hasNextRound = stage !== "Final";

                  return (
                    <div key={match.id} className="relative w-full my-4 flex items-center justify-center">
                      {/* CONNECTORS TO PREVIOUS ROUND */}
                      {colIndex > 0 && (
                        <div className="absolute top-1/2 -left-6 w-6 h-[2px] bg-border -translate-y-1/2" />
                      )}
                      
                      {/* CONNECTORS TO NEXT ROUND */}
                      {hasNextRound && (
                        <>
                          <div className="absolute top-1/2 -right-6 w-6 h-[2px] bg-border -translate-y-1/2" />
                          <div 
                            className={`absolute -right-6 w-[2px] bg-border ${isTopNode ? 'top-1/2 bottom-[-50%]' : 'bottom-1/2 top-[-50%]'}`}
                            style={{ height: 'calc(100% + 2rem)' /* Roughly connects the two matches visually */ }}
                          />
                        </>
                      )}

                      {/* MATCH CARD */}
                      <div 
                        onClick={() => setSelectedMatch(match)}
                        className={`w-full rounded-xl border bg-card p-3 shadow-sm hover:border-primary/50 hover:shadow-[0_0_15px_-5px_var(--primary)] cursor-pointer transition-all duration-300 ${match.status === 'live' ? 'border-green-500 shadow-[0_0_15px_-5px_#22c55e]' : ''}`}
                      >
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-3 pb-2 border-b border-border/50">
                          <span className="font-medium">
                            {match.match_time ? new Date(match.match_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "TBA"}
                          </span>
                          <Badge variant={match.status === 'finished' ? "secondary" : match.status === 'live' ? "default" : "outline"} className={`text-[9px] px-1.5 py-0 h-4 ${match.status === 'live' ? 'bg-green-500 hover:bg-green-600' : ''}`}>
                            {match.status}
                          </Badge>
                        </div>
                        <div className="space-y-2.5 text-sm font-semibold">
                          <div className={`flex justify-between items-center px-1 rounded ${match.home_score !== null && match.away_score !== null && match.home_score > match.away_score ? 'text-primary' : ''}`}>
                            <span className="truncate">{match.home_team || "TBD"}</span>
                            <span className="tabular-nums bg-secondary/50 px-2 py-0.5 rounded">{match.home_score ?? "-"}</span>
                          </div>
                          <div className={`flex justify-between items-center px-1 rounded ${match.home_score !== null && match.away_score !== null && match.away_score > match.home_score ? 'text-primary' : ''}`}>
                            <span className="truncate">{match.away_team || "TBD"}</span>
                            <span className="tabular-nums bg-secondary/50 px-2 py-0.5 rounded">{match.away_score ?? "-"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Match Details Interactive Dialog */}
      <MatchDialog selectedMatch={selectedMatch} onClose={() => setSelectedMatch(null)} />
    </div>
  );
}

function MatchDialog({ selectedMatch, onClose }: { selectedMatch: MatchRow | null, onClose: () => void }) {
  if (!selectedMatch) return null;

  return (
    <Dialog open={!!selectedMatch} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Knockout Stage: {selectedMatch.stage}</DialogTitle>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          <div className="flex justify-between items-center text-center">
            <div className="space-y-2 flex-1">
              <p className="font-bold text-xl">{selectedMatch.home_team || "TBD"}</p>
              <p className="text-3xl font-black text-primary">{selectedMatch.home_score ?? "-"}</p>
            </div>
            <div className="text-muted-foreground px-4 font-bold opacity-50 text-sm">VS</div>
            <div className="space-y-2 flex-1">
              <p className="font-bold text-xl">{selectedMatch.away_team || "TBD"}</p>
              <p className="text-3xl font-black text-primary">{selectedMatch.away_score ?? "-"}</p>
            </div>
          </div>
          
          <div className="text-center text-sm font-medium text-muted-foreground bg-secondary/20 py-2 rounded-lg">
            {selectedMatch.match_time ? <ClientTime timeString={selectedMatch.match_time} showDate /> : "Kickoff Date TBA"}
          </div>
          
          {selectedMatch.status === "Scheduled" && selectedMatch.home_team !== "TBD" && (
            <div className="pt-4 flex justify-center border-t border-border/50">
              <Link 
                href={`/bets/create?matchId=${selectedMatch.id}&prompt=${encodeURIComponent(`${selectedMatch.home_team || "TBD"} vs ${selectedMatch.away_team || "TBD"}: `)}`} 
                className="w-full"
              >
                <Button className="w-full h-12 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-5px_var(--primary)] transition-all">
                  + Place Bet on this Match
                </Button>
              </Link>
            </div>
          )}
          
          {(selectedMatch.home_team === "TBD" || selectedMatch.away_team === "TBD") && (
            <div className="pt-4 border-t border-border/50 text-center text-sm text-muted-foreground italic">
              Awaiting qualification results to enable betting.
            </div>
          )}

          {selectedMatch.status === "finished" && (
            <div className="pt-4 border-t border-border/50 text-center text-sm text-muted-foreground">
              This match has concluded.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
