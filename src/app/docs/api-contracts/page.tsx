import { readFileSync } from "fs";
import { join } from "path";

import { Badge } from "@/components/ui/badge";

function loadDoc(filename: string) {
  return readFileSync(join(process.cwd(), "docs", filename), "utf-8");
}

export default function ApiContractsDocPage() {
  return (
    <div className="space-y-4">
      <Badge variant="outline">docs/api-contracts.md</Badge>
      <h1 className="text-2xl font-semibold">API Contracts</h1>
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed">
        {loadDoc("api-contracts.md")}
      </pre>
    </div>
  );
}
