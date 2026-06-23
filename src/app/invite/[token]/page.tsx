"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type InviteValidationResponse = {
  valid: boolean;
  error?: string;
};

export default function InvitePage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function validateAndRedirect() {
      if (!token) {
        setChecking(false);
        setError("Invite token is missing.");
        return;
      }

      const res = await fetch("/api/invites/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = (await res.json()) as InviteValidationResponse;

      if (res.ok && data.valid) {
        router.replace(`/signup?invite=${encodeURIComponent(token)}`);
        return;
      }

      setChecking(false);
      setError(data.error ?? "Invite is invalid or expired.");
    }

    void validateAndRedirect();
  }, [router, token]);

  if (checking) {
    return (
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Checking invite</CardTitle>
            <CardDescription>Validating your private access link.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Invite unavailable</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
