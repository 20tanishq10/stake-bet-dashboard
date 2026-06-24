import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";
import { getOpenApiGroups, getOpenApiTeams, getPlayerStats } from "@/lib/api/tournament";
import { GroupStandings } from "@/components/tournament/GroupStandings";
import { PlayerStats } from "@/components/tournament/PlayerStats";
import { KnockoutLadder } from "@/components/tournament/KnockoutLadder";
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
  stage: string | null;
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
  if (match.home_score != null && match.away_score != null) {
    return `${match.home_score} – ${match.away_score}`;
  }
  return "—";
}

export default async function MatchesPage() {
  const supabase = await createClient();

  const { data: matches, error } = await supabase
    .from("matches")
    .select("id, home_team, away_team, match_time, status, home_score, away_score, stage")
    .order("match_time", { ascending: true });

  // Fetch all tournament data concurrently
  const [groups, teams, topscorers, assists, yellowcards, redcards] = await Promise.all([
    getOpenApiGroups(),
    getOpenApiTeams(),
    getPlayerStats("topscorers"),
    getPlayerStats("topassists"),
    getPlayerStats("topyellowcards"),
    getPlayerStats("topredcards"),
  ]);

  const rows = (matches ?? []) as MatchRow[];
  const upcoming = rows.filter((m) => !["finished"].includes(m.status.toLowerCase()));
  const finished = rows.filter((m) => ["finished"].includes(m.status.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline">Phase 4 (Hybrid API)</Badge>
        <h1 className="mt-2 text-2xl font-semibold">World Cup Tournament</h1>
        <p className="text-muted-foreground">
          Fixtures, Standings, and Player Stats powered by Hybrid API cache.
        </p>
      </div>

      <Tabs defaultValue="fixtures" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="fixtures">Fixtures & Results</TabsTrigger>
          <TabsTrigger value="standings">Group Stage</TabsTrigger>
          <TabsTrigger value="knockout">Knockout Stage</TabsTrigger>
          <TabsTrigger value="stats">Player Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="fixtures" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="standings">
          <GroupStandings groups={groups} teams={teams} />
        </TabsContent>

        <TabsContent value="knockout">
          <KnockoutLadder matches={rows} />
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <PlayerStats title="Top Scorers" stats={topscorers} type="goals" />
            <PlayerStats title="Top Assists" stats={assists} type="assists" />
            <PlayerStats title="Yellow Cards" stats={yellowcards} type="yellow" />
            <PlayerStats title="Red Cards" stats={redcards} type="red" />
          </div>
        </TabsContent>
      </Tabs>
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
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr key={match.id} className="border-t">
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                      {formatKickoff(match.match_time)}
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {match.home_team} vs {match.away_team}
                      {match.stage ? (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {match.stage}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 tabular-nums">{scoreLabel(match)}</td>
                    <td className="px-3 py-2">
                      <Badge variant="secondary">{match.status}</Badge>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link href={`/bets/create?matchId=${match.id}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          + Bet
                        </Button>
                      </Link>
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
