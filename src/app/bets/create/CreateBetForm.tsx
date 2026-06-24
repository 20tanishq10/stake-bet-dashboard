"use client";

import { useState, useEffect } from "react";
import { parseCrazyBet, createBet } from "@/lib/api/bets";
import { joinBet } from "@/lib/api/joinBet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

export function CreateBetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams?.get("prompt") || "";
  
  const [crazyText, setCrazyText] = useState(initialPrompt);
  const [stake, setStake] = useState("50");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Wait for client mount
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!crazyText.trim()) return;
    
    const stakeAmount = parseFloat(stake);
    if (isNaN(stakeAmount) || stakeAmount <= 0) {
      setError("Please enter a valid stake amount.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    // 1. Ask AI to parse, generate title, and estimate odds
    const res = await parseCrazyBet(crazyText);
    if (!res.success) {
      setError("AI Parsing Failed: " + res.error);
      setLoading(false);
      return;
    }

    const ruleData = {
      raw_prompt: crazyText,
      parsed_criteria: res.conditions,
    };

    // 2. Create the bet directly with the AI-generated fields
    const betRes = await createBet({
      title: res.title || "Custom AI Bet",
      description: crazyText,
      match_id: null,
      odds: res.odds || 2.0,
      rule_type: "llm_crazy",
      rule_data: ruleData,
      lock_at: res.lock_at || null,
    });

    if (!betRes.success) {
      setError("Failed to create bet: " + betRes.error);
      setLoading(false);
      return;
    } 

    // 3. Immediately join the bet with the initial stake
    const joinRes = await joinBet(betRes.bet.id, [{ userId: "self", stake: stakeAmount }]);
    
    if (!joinRes.success) {
      setError("Bet created, but failed to join: " + joinRes.error);
      setLoading(false);
    } else {
      setSuccessMsg("Bet created and joined successfully! Redirecting...");
      setTimeout(() => {
        router.push("/bets");
      }, 1500);
    }
  }

  return (
    <Card className="border-primary/20 shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)] bg-card/50 backdrop-blur">
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">AI Bet Creator</h2>
            <p className="text-sm text-muted-foreground px-4">
              Describe any crazy parlay or specific event you want to bet on. 
              Our AI will automatically parse the conditions, calculate fair odds, and set the lock time.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-accent/30 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <textarea 
              value={crazyText} 
              onChange={(e) => setCrazyText(e.target.value)}
              rows={4}
              placeholder="e.g., Messi scores a hat-trick, Mbappe gets a red card, and Argentina wins by 2 goals..."
              className="relative flex w-full rounded-lg border border-input/50 bg-background/80 backdrop-blur px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Initial Stake Amount ($)</label>
            <input 
              type="number"
              step="1"
              value={stake} 
              onChange={(e) => setStake(e.target.value)}
              className="flex h-12 w-full rounded-lg border border-input/50 bg-background/80 px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md text-center">
              {error}
            </div>
          )}
          
          {successMsg && (
            <div className="p-3 bg-green-500/10 border-green-500/20 text-green-500 text-sm rounded-md text-center">
              {successMsg}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-5px_var(--primary)] transition-all" 
            disabled={loading || !crazyText.trim()}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing with AI...
              </span>
            ) : (
              "Generate & Publish Bet"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
