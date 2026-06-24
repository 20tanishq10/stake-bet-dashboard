"use server";

import { createClient } from "@/lib/supabase/server";

export async function joinBet(betId: string, allocations: { userId: string; stake: number }[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_broker")
    .eq("id", user.id)
    .single();

  const isBrokerOrHost = profile?.role === "host" || profile?.is_broker === true;

  // Process 'self' alias
  for (const alloc of allocations) {
    if (alloc.userId === "self") {
      alloc.userId = user.id;
    }
  }

  // Validate allocations
  if (!isBrokerOrHost) {
    if (allocations.length !== 1 || allocations[0].userId !== user.id) {
      return { success: false, error: "Only brokers can place bets for others" };
    }
  }

  // Calculate total stake and check bet status
  const totalStake = allocations.reduce((sum, a) => sum + a.stake, 0);
  if (totalStake <= 0) return { success: false, error: "Invalid stake amount" };

  const { data: bet } = await supabase.from("bets").select("status").eq("id", betId).single();
  if (bet?.status !== "open") return { success: false, error: "Bet is not open" };

  // Note: Real implementation would run a Postgres function/transaction 
  // to safely deduct wallets and insert participations.
  // For this phase, we do it sequentially.
  
  for (const alloc of allocations) {
    if (alloc.stake <= 0) continue;

    const { data: userProfile } = await supabase
      .from("profiles")
      .select("wallet_balance, is_interested")
      .eq("id", alloc.userId)
      .single();

    if (!userProfile) continue;
    if (!isBrokerOrHost && alloc.userId !== user.id) continue;
    if (alloc.userId !== user.id && !userProfile.is_interested) {
       return { success: false, error: "User is not marked as interested." };
    }
    if ((userProfile.wallet_balance || 0) < alloc.stake) {
      return { success: false, error: `Insufficient funds for user ${alloc.userId}` };
    }

    // Deduct wallet
    await supabase.from("profiles").update({ 
      wallet_balance: (userProfile.wallet_balance || 0) - alloc.stake 
    }).eq("id", alloc.userId);

    // Insert ledger
    await supabase.from("wallet_ledger").insert({
      user_id: alloc.userId,
      entry_type: "stake_lock",
      amount: -alloc.stake,
      balance_after: (userProfile.wallet_balance || 0) - alloc.stake,
      bet_id: betId,
      created_by: user.id
    });

    // Insert participation
    await supabase.from("bet_participations").insert({
      bet_id: betId,
      user_id: alloc.userId,
      stake_amount: alloc.stake,
      share_pct: 0 // Will be recalculated later in a pooling model
    });
  }

  return { success: true };
}
