import Image from "next/image";
import { PlayerStat } from "@/lib/api/tournament";

export function PlayerStats({
  title,
  stats,
  type,
}: {
  title: string;
  stats: PlayerStat[];
  type: "goals" | "assists" | "yellow" | "red";
}) {
  if (stats.length === 0) {
    return <p className="text-sm text-muted-foreground">No stats available yet.</p>;
  }

  // Take top 10
  const topStats = stats.slice(0, 10);

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 border-b">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="p-4 space-y-4">
        {topStats.map((stat, index) => {
          let value = 0;
          const stats0 = stat.statistics?.[0];
          if (type === "goals") value = stats0?.goals?.total || 0;
          if (type === "assists") value = stats0?.goals?.assists || 0;
          if (type === "yellow") value = stats0?.cards?.yellow || 0;
          if (type === "red") value = stats0?.cards?.red || 0;

          return (
            <div key={stat.player.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="w-4 text-center text-sm text-muted-foreground">{index + 1}</span>
                <div className="relative w-10 h-10 overflow-hidden rounded-full bg-muted border">
                  {stat.player.photo && (
                    <Image src={stat.player.photo} alt={stat.player.name} fill className="object-cover" unoptimized />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">{stat.player.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stats0?.team?.logo && (
                      <div className="relative w-4 h-4">
                        <Image src={stats0.team.logo} alt="team" fill className="object-contain" unoptimized />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">{stats0?.team?.name}</p>
                  </div>
                </div>
              </div>
              <div className="text-lg font-semibold pr-2">{value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
