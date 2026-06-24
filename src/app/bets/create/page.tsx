import { Badge } from "@/components/ui/badge";
import { CreateBetForm } from "./CreateBetForm";

import { Suspense } from "react";

export default async function CreateBetPage() {
  const supabase = await createClient();

  return (
    <div className="space-y-6 max-w-2xl mx-auto pt-8">
      <div>
        <Badge variant="outline" className="mb-2">AI Betting Engine</Badge>
        <h1 className="text-3xl font-bold tracking-tight">Create a Bet</h1>
        <p className="text-muted-foreground mt-2">
          Use the Gemini AI to instantly generate structured bets from plain English.
        </p>
      </div>
      <Suspense fallback={<div>Loading form...</div>}>
        <CreateBetForm />
      </Suspense>
    </div>
  );
}
