import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

type CreateInviteBody = {
  email?: string;
  expiresInDays?: number;
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

  const { admin, user } = access;
  const body = (await request.json()) as CreateInviteBody;

  type InviteRow = {
    id: string;
    token: string;
    email: string | null;
    expires_at: string;
    used_by: string | null;
    used_at: string | null;
    created_at: string;
  };

  const expiresInDays = Number.isFinite(body.expiresInDays)
    ? Math.min(30, Math.max(1, Number(body.expiresInDays)))
    : 7;
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from("invites")
    .insert({
      token,
      email: body.email?.trim() || null,
      created_by: user.id,
      expires_at: expiresAt,
    } as never)
    .select("id, token, email, expires_at, used_by, used_at, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Unable to create invite" }, { status: 500 });
  }

  const typedInvite = data as InviteRow;

  return NextResponse.json({
    invite: typedInvite,
    inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/invite/${typedInvite.token}`,
  });
}