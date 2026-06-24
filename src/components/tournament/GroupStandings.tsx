import Image from "next/image";
import { Badge } from "@/components/ui/badge";

type GroupTeam = {
  team_id: string;
  mp: string;
  w: string;
  l: string;
  d: string;
  pts: string;
  gf: string;
  ga: string;
  gd: string;
};

type Group = {
  _id: string;
  name: string;
  teams: GroupTeam[];
};

type TeamDetails = {
  id: string;
  name_en: string;
  flag: string;
};

export function GroupStandings({ groups, teams }: { groups: Group[]; teams: TeamDetails[] }) {
  // Create a dictionary for quick team lookups
  const teamDict = teams.reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {} as Record<string, TeamDetails>);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <div key={group._id} className="rounded-lg border bg-card p-4">
          <h3 className="mb-4 text-lg font-semibold border-b pb-2">Group {group.name}</h3>
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="font-normal text-left pb-2">Team</th>
                <th className="font-normal text-center pb-2">MP</th>
                <th className="font-normal text-center pb-2">W</th>
                <th className="font-normal text-center pb-2">D</th>
                <th className="font-normal text-center pb-2">L</th>
                <th className="font-normal text-center pb-2">GD</th>
                <th className="font-bold text-center pb-2">Pts</th>
              </tr>
            </thead>
            <tbody>
              {/* Sort teams by points, then goal difference */}
              {[...group.teams]
                .sort((a, b) => parseInt(b.pts) - parseInt(a.pts) || parseInt(b.gd) - parseInt(a.gd))
                .map((teamData, index) => {
                  const teamInfo = teamDict[teamData.team_id];
                  return (
                    <tr key={teamData.team_id} className="border-t border-border/50 last:border-0">
                      <td className="py-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                        {teamInfo?.flag && (
                          <div className="relative w-5 h-3 overflow-hidden rounded-sm border">
                            <Image src={teamInfo.flag} alt="flag" fill className="object-cover" unoptimized />
                          </div>
                        )}
                        <span className="font-medium">{teamInfo?.name_en || "Unknown"}</span>
                      </td>
                      <td className="py-2 text-center text-muted-foreground">{teamData.mp}</td>
                      <td className="py-2 text-center text-muted-foreground">{teamData.w}</td>
                      <td className="py-2 text-center text-muted-foreground">{teamData.d}</td>
                      <td className="py-2 text-center text-muted-foreground">{teamData.l}</td>
                      <td className="py-2 text-center text-muted-foreground">{teamData.gd}</td>
                      <td className="py-2 text-center font-bold">{teamData.pts}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
