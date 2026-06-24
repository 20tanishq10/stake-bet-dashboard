"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { joinBet } from "@/lib/api/joinBet";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function JoinBetForm({ betId, currentUser, isBroker, interestedUsers }: { betId: string, currentUser: any, isBroker: boolean, interestedUsers: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // State for broker allocations
  const [allocations, setAllocations] = useState<{userId: string, stake: string}[]>(
    isBroker ? [] : [{ userId: currentUser?.id, stake: "" }]
  );

  function handleAddUser(userId: string) {
    if (!allocations.find(a => a.userId === userId)) {
      setAllocations([...allocations, { userId, stake: "" }]);
    }
  }

  function handleRemoveUser(userId: string) {
    setAllocations(allocations.filter(a => a.userId !== userId));
  }

  function updateStake(userId: string, stake: string) {
    setAllocations(allocations.map(a => a.userId === userId ? { ...a, stake } : a));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validAllocations = allocations
      .map(a => ({ userId: a.userId, stake: parseFloat(a.stake) }))
      .filter(a => !isNaN(a.stake) && a.stake > 0);

    if (validAllocations.length === 0) {
      setError("Please enter valid stake amounts.");
      setLoading(false);
      return;
    }

    const res = await joinBet(betId, validAllocations);
    if (!res.success) {
      setError(res.error || "Failed to join bet.");
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isBroker && (
        <div className="space-y-2 mb-4 p-4 border rounded-md bg-muted/20">
          <label className="text-sm font-medium text-primary">Broker Panel: Pool Funds</label>
          <p className="text-xs text-muted-foreground mb-2">Select interested users to pool funds from their wallets.</p>
          <div className="flex flex-wrap gap-2">
            {!allocations.find(a => a.userId === currentUser.id) && (
              <Button type="button" variant="outline" size="sm" onClick={() => handleAddUser(currentUser.id)}>
                + Myself
              </Button>
            )}
            {interestedUsers.map(u => (
              !allocations.find(a => a.userId === u.id) && (
                <Button key={u.id} type="button" variant="outline" size="sm" onClick={() => handleAddUser(u.id)}>
                  + {u.display_name} (${u.wallet_balance?.toFixed(2)})
                </Button>
              )
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {allocations.map((a) => {
          const uName = a.userId === currentUser.id ? "Your Stake" : (interestedUsers.find(u => u.id === a.userId)?.display_name + "'s Stake");
          return (
            <div key={a.userId} className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium">{uName}</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={a.stake}
                  onChange={(e) => updateStake(a.userId, e.target.value)}
                  placeholder="0.00"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              {isBroker && (
                <Button type="button" variant="ghost" size="sm" className="mt-5 text-destructive" onClick={() => handleRemoveUser(a.userId)}>
                  Remove
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-destructive font-medium">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading || allocations.length === 0}>
        {loading ? "Processing..." : "Place Bets"}
      </Button>
    </form>
  );
}
