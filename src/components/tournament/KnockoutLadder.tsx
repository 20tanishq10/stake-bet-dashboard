import { Badge } from "@/components/ui/badge";

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

  return (
    <div className="w-full overflow-x-auto pb-8">
      <div className="flex flex-row min-w-max space-x-12 px-4 items-stretch min-h-[1200px]">
        {knockoutStages.map((stage) => {
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
            <div key={stage} className="flex flex-col w-[260px] flex-shrink-0">
              <h3 className="text-center font-semibold mb-6 text-muted-foreground uppercase tracking-wider text-sm sticky top-0 bg-background py-2">
                {stage}
              </h3>
              <div className="flex flex-col justify-around flex-1 py-4">
                {displayMatches.map((match) => (
                  <div key={match.id} className="rounded-lg border bg-card p-3 shadow-sm my-2 relative">
                    {/* Visual Connector Line (Left) */}
                    {stage !== "Round of 32" && (
                      <div className="absolute top-1/2 -left-6 w-6 h-[2px] bg-border -translate-y-1/2" />
                    )}
                    {/* Visual Connector Line (Right) */}
                    {stage !== "Final" && (
                      <div className="absolute top-1/2 -right-6 w-6 h-[2px] bg-border -translate-y-1/2" />
                    )}
                    
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-2">
                      <span>{match.match_time ? new Date(match.match_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Date TBD"}</span>
                      <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">{match.status}</Badge>
                    </div>
                    <div className="space-y-2 text-sm font-medium">
                      <div className="flex justify-between items-center">
                        <span className="truncate">{match.home_team || "TBD"}</span>
                        <span className="tabular-nums">{match.home_score ?? "-"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="truncate">{match.away_team || "TBD"}</span>
                        <span className="tabular-nums">{match.away_score ?? "-"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
