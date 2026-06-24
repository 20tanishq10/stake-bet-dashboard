"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { approveBet } from "@/lib/api/bets";
import { useRouter } from "next/navigation";

export function ApproveBetButton({ betId }: { betId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleApprove() {
    setLoading(true);
    const res = await approveBet(betId);
    if (res.success) {
      router.refresh();
    } else {
      alert("Failed to approve bet: " + res.error);
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleApprove} disabled={loading}>
      {loading ? "Approving..." : "Approve Proposal"}
    </Button>
  );
}
