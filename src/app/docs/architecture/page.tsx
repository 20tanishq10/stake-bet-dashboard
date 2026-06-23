import { readFileSync } from "fs";
import { join } from "path";

import { Badge } from "@/components/ui/badge";

function loadDoc(filename: string) {
  const path = join(process.cwd(), "docs", filename);
  return readFileSync(path, "utf-8");
}

function MarkdownPreview({ content }: { content: string }) {
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed">
      {content}
    </pre>
  );
}

export default function ArchitectureDocPage() {
  const content = loadDoc("architecture.md");

  return (
    <div className="space-y-4">
      <Badge variant="outline">docs/architecture.md</Badge>
      <h1 className="text-2xl font-semibold">Architecture</h1>
      <MarkdownPreview content={content} />
    </div>
  );
}
