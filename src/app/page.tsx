import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const modules = [
  {
    title: "Dashboard",
    description: "Wallet balance, open exposure, and realized PnL.",
    href: "/dashboard",
    status: "Phase 2",
  },
  {
    title: "Matches",
    description: "FIFA World Cup 2026 fixture browser powered by TheSportsDB.",
    href: "/matches",
    status: "Phase 4",
  },
  {
    title: "Bets",
    description: "Create pooled market bets and split stakes proportionally.",
    href: "/bets",
    status: "Phase 5",
  },
  {
    title: "Activity",
    description: "Immutable ledger of wallet and bet lifecycle events.",
    href: "/activity",
    status: "Phase 2",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge variant="secondary">Phase 1 — System Design</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          Football Stake Tracker
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          A private group platform for pooling virtual stakes on FIFA World Cup
          2026 bets against external markets. Friends co-invest; payouts are
          proportional to each participant&apos;s share of the pool.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {modules.map((module) => (
          <Card key={module.href}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg">{module.title}</CardTitle>
                <Badge variant="outline">{module.status}</Badge>
              </div>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link href={module.href}>View shell</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Architecture locked</CardTitle>
          <CardDescription>
            Next.js · TypeScript · Tailwind · ShadCN · Supabase · TheSportsDB ·
            OpenRouter · Vercel
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href="/docs">System design docs</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-disabled
              className="pointer-events-none opacity-50"
            >
              Deploy to Vercel (Phase 6)
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
