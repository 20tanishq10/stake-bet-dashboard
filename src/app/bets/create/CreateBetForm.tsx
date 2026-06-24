"use client";

import { useState } from "react";
import { parseCrazyBet, createBet } from "@/lib/api/bets";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

type Match = {
  id: string;
  home_team: string;
  away_team: string;
  match_time: string;
};

export function CreateBetForm({ matches }: { matches: Match[] }) {
  const router = useRouter();
  const [type, setType] = useState<"rule_based" | "llm_crazy">("rule_based");
  const [matchId, setMatchId] = useState("");
  const [title, setTitle] = useState("");
  const [odds, setOdds] = useState("2.0");
  const [crazyText, setCrazyText] = useState("");
  const [ruleCondition, setRuleCondition] = useState("home_win");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!matchId || !title || !odds) {
      setError("Please fill out all required fields.");
      setLoading(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ruleData: any = {};

    if (type === "llm_crazy") {
      if (!crazyText) {
        setError("Please enter the crazy bet conditions.");
        setLoading(false);
        return;
      }
      const res = await parseCrazyBet(crazyText);
      if (!res.success) {
        setError("AI Parsing Failed: " + res.error);
        setLoading(false);
        return;
      }
      ruleData = {
        raw_prompt: crazyText,
        parsed_criteria: res.conditions,
      };
    } else {
      ruleData = {
        market: "match_winner",
        condition: ruleCondition,
      };
    }

    const betRes = await createBet({
      title,
      description: type === "llm_crazy" ? crazyText : `Match Winner: ${ruleCondition}`,
      match_id: parseInt(matchId),
      odds: parseFloat(odds),
      rule_type: type,
      rule_data: ruleData,
    });

    if (!betRes.success) {
      setError("Failed to create bet: " + betRes.error);
    } else {
      router.push("/bets");
    }
    
    setLoading(false);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 mb-6 p-1 bg-muted rounded-lg">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md ${type === "rule_based" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setType("rule_based")}
            >
              Standard Bet
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md ${type === "llm_crazy" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setType("llm_crazy")}
            >
              AI Crazy Bet
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Match</label>
            <select 
              value={matchId} 
              onChange={(e) => setMatchId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">-- Choose Match --</option>
              {matches.map(m => (
                <option key={m.id} value={m.id}>
                  {m.home_team} vs {m.away_team} ({new Date(m.match_time).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bet Title</label>
              <input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Messi Masterclass"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Odds (e.g. 2.0)</label>
              <input 
                type="number"
                step="0.01"
                value={odds} 
                onChange={(e) => setOdds(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {type === "rule_based" ? (
            <div className="space-y-2 pt-4 border-t">
              <label className="text-sm font-medium">Match Winner Condition</label>
              <select 
                value={ruleCondition} 
                onChange={(e) => setRuleCondition(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="home_win">Home Team Wins</option>
                <option value="away_win">Away Team Wins</option>
                <option value="draw">Draw</option>
              </select>
            </div>
          ) : (
            <div className="space-y-2 pt-4 border-t">
              <label className="text-sm font-medium text-primary">Crazy Conditions (Powered by Gemini AI)</label>
              <p className="text-xs text-muted-foreground mb-2">
                Type anything! e.g., &quot;Messi scores a hat-trick, Mbappe gets a red card, and it rains.&quot;
              </p>
              <textarea 
                value={crazyText} 
                onChange={(e) => setCrazyText(e.target.value)}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive font-medium">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Bet..." : "Publish Bet"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
