"use server";

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

export async function parseCrazyBet(prompt: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy_key_for_build" });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert sports betting parser for the FIFA World Cup.
The user is submitting a "crazy" text-based bet. 
Extract the core conditions of this bet into a JSON array of strings. 
Make each condition a clear, verifiable football statistic or event.

For example, if the prompt is: "Messi scores a hat trick and gets a yellow card"
Return exactly:
["Lionel Messi scores 3 or more goals", "Lionel Messi receives a yellow card"]

User prompt: "${prompt}"

Return ONLY valid JSON. No markdown formatting, no code blocks, just the JSON array.`,
    });

    let text = response.text || "[]";
    // Clean up potential markdown formatting from the response
    if (text.startsWith("```json")) {
      text = text.replace(/```json\n?/, "").replace(/```\n?$/, "");
    } else if (text.startsWith("```")) {
      text = text.replace(/```\n?/, "").replace(/```\n?$/, "");
    }
    
    return { success: true, conditions: JSON.parse(text) };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Gemini Parsing Error:", error);
    return { success: false, error: error.message };
  }
}

export async function createBet(formData: {
  title: string;
  description: string;
  match_id: number;
  odds: number;
  rule_type: "rule_based" | "llm_crazy";
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
    rule: rulePayload
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
