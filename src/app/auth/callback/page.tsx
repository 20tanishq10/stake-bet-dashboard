"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Completing sign in...");

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const next = params.get("next") || "/dashboard";

      if (!code) {
        setMessage("Missing sign-in code.");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        setMessage(error.message);
        return;
      }

      router.replace(next);
      router.refresh();
    };

    void run();
  }, [router]);

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Signing you in</CardTitle>
          <CardDescription>Magic link confirmation in progress.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{message}</CardContent>
      </Card>
    </div>
  );
}