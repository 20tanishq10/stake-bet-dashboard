"use server";

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

export async function parseCrazyBet(prompt: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy_key_for_build" });
    const now = new Date().toISOString();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert sports betting parser for the FIFA World Cup.
The user is submitting a text-based bet. 
Your job is to extract the core conditions and estimate a reasonable "lock_at" time (in ISO 8601 format) before which the bet must be placed.
The current date and time is: ${now}.

If the bet is about a specific match, estimate the kickoff time. If it is about the entire tournament (e.g., "who wins the World Cup"), estimate the start or end of the tournament. If you are unsure, provide null.

For example, if the prompt is: "Messi scores a hat trick and gets a yellow card"
Return exactly:
{
  "conditions": ["Lionel Messi scores 3 or more goals", "Lionel Messi receives a yellow card"],
  "lock_at": "2026-06-30T15:00:00Z"
}

User prompt: "${prompt}"

Return ONLY valid JSON matching this structure. No markdown formatting, no code blocks.`,
    });

    let text = response.text || '{"conditions":[], "lock_at":null}';
    // Clean up potential markdown formatting from the response
    if (text.startsWith("```json")) {
      text = text.replace(/```json\n?/, "").replace(/```\n?$/, "");
    } else if (text.startsWith("```")) {
      text = text.replace(/```\n?/, "").replace(/```\n?$/, "");
    }
    
    const parsed = JSON.parse(text);
    return { success: true, conditions: parsed.conditions || [], lock_at: parsed.lock_at || null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Gemini Parsing Error:", error);
    return { success: false, error: error.message };
  }
}

export async function createBet(formData: {
  title: string;
  description: string;
  match_id: number | null;
  odds: number;
  rule_type: "rule_based" | "llm_crazy";
  lock_at?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rule_data: any;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const rulePayload = {
    mechanism: formData.rule_type,
    odds: formData.odds,
    ...formData.rule_data
  };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_broker")
    .eq("id", user.id)
    .single();

  const isBrokerOrHost = profile?.role === "host" || profile?.is_broker === true;
  const initialStatus = isBrokerOrHost ? "open" : "draft";

  const { data, error } = await supabase.from("bets").insert({
    created_by: user.id,
    match_id: formData.match_id,
    title: formData.title,
    description: formData.description,
    status: initialStatus,
    rule: rulePayload,
    lock_at: formData.lock_at || null,
  }).select().single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, bet: data };
}

export async function approveBet(betId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_broker")
    .eq("id", user.id)
    .single();

  const isBrokerOrHost = profile?.role === "host" || profile?.is_broker === true;
  if (!isBrokerOrHost) return { success: false, error: "Only brokers can approve bets" };

  const { error } = await supabase.from("bets").update({ status: "open" }).eq("id", betId);
  if (error) return { success: false, error: error.message };

  return { success: true };
}
