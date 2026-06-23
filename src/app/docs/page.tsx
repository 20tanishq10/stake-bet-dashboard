import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const docs = [
  {
    title: "Architecture",
    href: "/docs/architecture",
    file: "docs/architecture.md",
    summary: "Stack, diagrams, folder structure, security, phase map.",
  },
  {
    title: "Data Model",
    href: "/docs/data-model",
    file: "docs/data-model.md",
    summary: "Tables, proportional settlement, bet rules, RLS.",
  },
  {
    title: "API Contracts",
    href: "/docs/api-contracts",
    file: "docs/api-contracts.md",
    summary: "Route handlers, RPC, TheSportsDB, OpenRouter.",
  },
  {
    title: "Auth Flow",
    href: "/docs/auth-flow",
    file: "docs/auth-flow.md",
    summary: "Invite links, roles, signup/login sequences.",
  },
];

export default function DocsIndexPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge>Phase 1</Badge>
        <h1 className="mt-2 text-2xl font-semibold">System Design Docs</h1>
        <p className="text-muted-foreground">
          Full markdown lives in the repo{" "}
          <code className="text-foreground">docs/</code> folder.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {docs.map((doc) => (
          <Card key={doc.href}>
            <CardHeader>
              <CardTitle className="text-lg">{doc.title}</CardTitle>
              <CardDescription>{doc.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Source:{" "}
                <code className="text-foreground">{doc.file}</code>
              </p>
              <Link href={doc.href} className="text-primary hover:underline">
                Open summary page →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
