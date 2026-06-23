import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

type AdjustWalletBody = {
  userId?: string;
  amount?: number;
  note?: string;
};

async function requireHost(request: Request) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!accessToken) {
    return { error: NextResponse.json({ error: "Missing access token" }, { status: 401 }) };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return { error: NextResponse.json({ error: "Supabase credentials are not configured" }, { status: 500 }) };
  }

  const admin = createClient<Database>(supabaseUrl, serviceRoleKey);
  const {
    data: { user },
    error,
  } = await admin.auth.getUser(accessToken);

  if (error || !user) {
    return { error: NextResponse.json({ error: "Invalid session" }, { status: 401 }) };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if ((profile as { role?: string } | null)?.role !== "host") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { admin, user };
}

export async function POST(request: Request) {
  const access = await requireHost(request);
  if ("error" in access) return access.error;

  const { admin, user: actor } = access;
  const body = (await request.json()) as AdjustWalletBody;

  if (!body.userId || typeof body.amount !== "number" || Number.isNaN(body.amount)) {
    return NextResponse.json(
      { error: "userId and amount are required" },
      { status: 400 },
    );
  }

  const { data: targetProfile, error: profileError } = await admin
    .from("profiles")
    .select("id, wallet_balance")
    .eq("id", body.userId)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  type TargetProfile = {
    id: string;
    wallet_balance: number | null;
  };

  const typedTargetProfile = targetProfile as TargetProfile | null;

  if (!typedTargetProfile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const nextBalance = Number(typedTargetProfile.wallet_balance ?? 0) + body.amount;
  if (nextBalance < 0) {
    return NextResponse.json(
      { error: "Wallet balance cannot go below zero" },
      { status: 400 },
    );
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({ wallet_balance: nextBalance } as never)
    .eq("id", body.userId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const entryType = body.amount >= 0 ? "host_credit" : "host_debit";

  const { error: ledgerError } = await admin.from("wallet_ledger").insert({
    user_id: body.userId,
    entry_type: entryType,
    amount: body.amount,
    balance_after: nextBalance,
    note: body.note?.trim() || null,
    created_by: actor.id,
  } as never);

  if (ledgerError) {
    return NextResponse.json({ error: ledgerError.message }, { status: 500 });
  }

  const { error: activityError } = await admin.from("activity_logs").insert({
    event_type: "wallet_adjusted",
    actor_id: actor.id,
    target_user_id: body.userId,
    metadata: {
      amount: body.amount,
      note: body.note ?? null,
      balance_after: nextBalance,
    },
  } as never);

  if (activityError) {
    return NextResponse.json({ error: activityError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    wallet_balance: nextBalance,
  });
}
