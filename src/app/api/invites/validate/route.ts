import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ValidateInviteBody = {
  token?: string;
};

export async function POST(request: Request) {
  const { token } = (await request.json()) as ValidateInviteBody;

  if (!token?.trim()) {
    return NextResponse.json(
      { valid: false, error: "Invite token is required" },
      { status: 400 },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { valid: false, error: "Supabase service credentials are not configured" },
      { status: 500 },
    );
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await admin
    .from("invites")
    .select("token, email, expires_at, used_by")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ valid: false, error: "Invite not found" }, { status: 404 });
  }

  if (data.used_by) {
    return NextResponse.json({ valid: false, error: "Invite already used" }, { status: 400 });
  }

  const isExpired = new Date(data.expires_at).getTime() <= Date.now();
  if (isExpired) {
    return NextResponse.json({ valid: false, error: "Invite expired" }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    email: data.email,
    expiresAt: data.expires_at,
  });
}
