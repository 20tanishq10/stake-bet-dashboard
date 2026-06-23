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

  const { data: nextBalance, error } = await admin.rpc("adjust_wallet", {
    p_user_id: body.userId,
    p_amount: body.amount,
    p_note: body.note?.trim() || null,
    p_actor_id: actor.id,
  } as never);

  if (error) {
    const status =
      error.message.includes("Forbidden") ? 403
      : error.message.includes("not found") ? 404
      : error.message.includes("below zero") ? 400
      : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({
    ok: true,
    wallet_balance: nextBalance,
  });
}
