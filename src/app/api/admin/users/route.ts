import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

type CreateUserBody = {
  email?: string;
  name?: string;
  password?: string;
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

export async function GET(request: Request) {
  const access = await requireHost(request);
  if ("error" in access) return access.error;

  const { admin } = access;
  const [profilesResult, authUsersResult] = await Promise.all([
    admin.from("profiles").select("id, display_name, role, wallet_balance, is_broker, created_at"),
    admin.auth.admin.listUsers(),
  ]);

  if (profilesResult.error) {
    return NextResponse.json({ error: profilesResult.error.message }, { status: 500 });
  }

  type ProfileRow = {
    id: string;
    display_name: string | null;
    role: string | null;
    wallet_balance: number | null;
    is_broker: boolean | null;
    created_at: string | null;
  };

  const profileById = new Map(
    ((profilesResult.data ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]),
  );

  const users = (authUsersResult.data.users ?? []).map((authUser) => {
    const profile = profileById.get(authUser.id);
    return {
      id: authUser.id,
      name:
        profile?.display_name ??
        authUser.user_metadata?.display_name ??
        authUser.email?.split("@")[0] ??
        "Unknown",
      email: authUser.email,
      wallet_balance: profile?.wallet_balance ?? 0,
      role: profile?.role ?? "participant",
      is_broker: profile?.is_broker ?? false,
      created_at: profile?.created_at ?? authUser.created_at,
    };
  });

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const access = await requireHost(request);
  if ("error" in access) return access.error;

  const { admin } = access;
  const body = (await request.json()) as CreateUserBody;

  if (!body.email?.trim() || !body.name?.trim() || !body.password?.trim()) {
    return NextResponse.json(
      { error: "email, name, and password are required" },
      { status: 400 },
    );
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: {
      display_name: body.name,
      created_by_admin: true,
    },
  });

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? "Unable to create user" }, { status: 500 });
  }

  type ProfileRow = {
    id: string;
    display_name: string | null;
    role: string | null;
    wallet_balance: number | null;
    is_broker: boolean | null;
    created_at: string | null;
  };

  const { data: profile } = await admin
    .from("profiles")
    .select("id, display_name, role, wallet_balance, is_broker, created_at")
    .eq("id", data.user.id)
    .maybeSingle();

  const typedProfile = profile as ProfileRow | null;

  return NextResponse.json({
    user: {
      id: data.user.id,
      name:
        typedProfile?.display_name ??
        data.user.user_metadata?.display_name ??
        body.name,
      email: data.user.email,
      wallet_balance: typedProfile?.wallet_balance ?? 0,
      role: typedProfile?.role ?? "participant",
      is_broker: typedProfile?.is_broker ?? false,
      created_at: typedProfile?.created_at ?? data.user.created_at,
    },
  });
}
