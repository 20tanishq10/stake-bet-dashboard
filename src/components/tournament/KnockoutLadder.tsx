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
  // Filter only knockout stages
  const knockoutStages = ["Round of 32", "Round of 16", "Quarter-finals", "Semi-finals", "Third place", "Final"];
  
  const knockoutMatches = matches.filter((m) => m.stage && knockoutStages.includes(m.stage));

  if (knockoutMatches.length === 0) {
    return <p className="text-sm text-muted-foreground">Knockout fixtures are not yet available.</p>;
  }

  // Group by stage
  const grouped = knockoutStages.reduce((acc, stage) => {
    acc[stage] = knockoutMatches.filter((m) => m.stage === stage);
    return acc;
  }, {} as Record<string, MatchRow[]>);

  return (
    <div className="space-y-8">
      {knockoutStages.map((stage) => {
        const stageMatches = grouped[stage];
        if (!stageMatches || stageMatches.length === 0) return null;

        return (
          <div key={stage} className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">{stage}</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stageMatches.map((match) => (
                <div key={match.id} className="rounded-lg border bg-card p-3 shadow-sm">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>{new Date(match.match_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <Badge variant="secondary" className="text-[10px] px-1 py-0">{match.status}</Badge>
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
  );
}
