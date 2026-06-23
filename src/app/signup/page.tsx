"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

type InviteValidationResponse = {
  valid: boolean;
  email?: string | null;
  expiresAt?: string;
  error?: string;
};

export default function SignupPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [inviteToken, setInviteToken] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteChecked, setInviteChecked] = useState(false);
  const [inviteValid, setInviteValid] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setInviteToken(params.get("invite") ?? "");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    async function runValidation() {
      setInviteChecked(false);
      setInviteValid(false);
      setInviteError(null);

      if (!inviteToken) {
        setInviteChecked(true);
        setInviteError("Invite token is required. Use your host's invite link.");
        return;
      }

      const res = await fetch("/api/invites/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: inviteToken }),
      });

      const data = (await res.json()) as InviteValidationResponse;

      if (!res.ok || !data.valid) {
        setInviteChecked(true);
        setInviteValid(false);
        setInviteError(data.error ?? "Invalid invite token");
        return;
      }

      if (data.email) {
        setEmail(data.email);
      }

      setInviteChecked(true);
      setInviteValid(true);
    }

    void runValidation();
  }, [hydrated, inviteToken]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    if (!inviteToken || !inviteValid) {
      setLoading(false);
      setError("A valid invite is required to sign up.");
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    const accessToken = data.session?.access_token;
    if (accessToken) {
      await fetch("/api/invites/consume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ token: inviteToken }),
      });
    }

    setLoading(false);

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    router.push("/login");
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Sign up with your invite to join the private group.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">
                Display name
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {!inviteChecked ? (
              <p className="text-sm text-muted-foreground">Validating invite...</p>
            ) : null}
            {inviteError ? <p className="text-sm text-destructive">{inviteError}</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button className="w-full" type="submit" disabled={loading || !inviteValid}>
              {loading ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already a member? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
