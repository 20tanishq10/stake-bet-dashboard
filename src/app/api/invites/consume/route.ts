import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ConsumeInviteBody = {
  token?: string;
};

export async function POST(request: Request) {
  const { token } = (await request.json()) as ConsumeInviteBody;

  if (!token?.trim()) {
    return NextResponse.json({ error: "Invite token is required" }, { status: 400 });
  }

  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Supabase credentials are not configured" },
      { status: 500 },
    );
  }

  const authClient = createClient(supabaseUrl, anonKey);
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser(accessToken);

  if (authError || !user) {
    return NextResponse.json({ error: "Invalid access token" }, { status: 401 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  const { data: invite, error: inviteError } = await admin
    .from("invites")
    .select("used_by, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (invite.used_by && invite.used_by !== user.id) {
    return NextResponse.json({ error: "Invite already used" }, { status: 400 });
  }

  if (new Date(invite.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 400 });
  }

  if (invite.used_by === user.id) {
    return NextResponse.json({ ok: true });
  }

  const { error: updateError } = await admin
    .from("invites")
    .update({ used_by: user.id, used_at: new Date().toISOString() })
    .eq("token", token)
    .is("used_by", null);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
