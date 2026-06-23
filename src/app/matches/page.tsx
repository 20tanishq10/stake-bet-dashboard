import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

type MatchRow = {
  id: number;
  home_team_name: string;
  away_team_name: string;
  kickoff_at: string;
  status: string;
  home_goals: number | null;
  away_goals: number | null;
  round: string | null;
};

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scoreLabel(match: MatchRow) {
  if (match.home_goals != null && match.away_goals != null) {
    return `${match.home_goals} – ${match.away_goals}`;
  }
  return "—";
}

export default async function MatchesPage() {
  const supabase = await createClient();

  const { data: matches, error } = await supabase
    .from("matches")
    .select("id, home_team_name, away_team_name, kickoff_at, status, home_goals, away_goals, round")
    .order("kickoff_at", { ascending: true });

  const rows = (matches ?? []) as MatchRow[];
  const upcoming = rows.filter((m) => !["FT", "AET", "PEN"].includes(m.status.toUpperCase()));
  const finished = rows.filter((m) => ["FT", "AET", "PEN"].includes(m.status.toUpperCase()));

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline">Phase 4</Badge>
        <h1 className="mt-2 text-2xl font-semibold">World Cup Matches</h1>
        <p className="text-muted-foreground">
          Fixtures cached from TheSportsDB and synced every 15 minutes.
        </p>
      </div>

      {error ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">
            Could not load matches: {error.message}
          </CardContent>
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No fixtures yet</CardTitle>
            <CardDescription>
              Run the sync cron once to populate the database, then refresh this page.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <MatchSection title="Upcoming" description="Scheduled and in-progress fixtures." matches={upcoming} />
          <MatchSection title="Results" description="Finished matches with scores." matches={finished.reverse()} />
        </>
      )}
    </div>
  );
}

function MatchSection({
  title,
  description,
  matches,
}: {
  title: string;
  description: string;
  matches: MatchRow[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <p className="text-sm text-muted-foreground">None to show.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-3 py-2">Kickoff</th>
                  <th className="px-3 py-2">Match</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr key={match.id} className="border-t">
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                      {formatKickoff(match.kickoff_at)}
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {match.home_team_name} vs {match.away_team_name}
                      {match.round ? (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {match.round}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 tabular-nums">{scoreLabel(match)}</td>
                    <td className="px-3 py-2">
                      <Badge variant="secondary">{match.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
