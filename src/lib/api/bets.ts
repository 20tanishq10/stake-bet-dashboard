"use server";

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function parseCrazyBet(prompt: string) {
  try {
    const supabase = await createClient();
    const { data: activeMatches } = await supabase
      .from("matches")
      .select("id, home_team, away_team")
      .neq("status", "finished");
      
    const matchContext = activeMatches?.map(m => `${m.id}: ${m.home_team} vs ${m.away_team}`).join("\n") || "No active matches.";

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy_key_for_build" });
    const now = new Date().toISOString();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert sports betting parser for the FIFA World Cup.
The user is submitting a text-based bet. 

CRITICAL RULE: If the user tries to place a bet on an event that has already occurred (based on the current date/time), or an event that is completely irrelevant to football/the tournament, you MUST decline it. In this case, return EXACTLY this JSON and nothing else:
{
  "declined": true,
  "decline_reason": "Brief explanation of why it was declined (e.g. 'This match has already finished' or 'This is not a football bet')."
}

Otherwise, your job is to extract the core conditions, generate a catchy short "title" for this bet, estimate reasonable "odds" (e.g., 2.0) based on likelihood, and estimate a reasonable "lock_at" time (in ISO 8601 format) before which the bet must be placed.
The current date and time is: ${now}.

If the bet is about a specific match, estimate the kickoff time. If it is about the entire tournament (e.g., "who wins the World Cup"), estimate the start or end of the tournament. 

Here are the upcoming matches (ID: Home vs Away):
${matchContext}

If the user's bet clearly relates to one of these matches, return its EXACT integer ID in the "match_id" field. If you are unsure or it's a general tournament bet, provide null for "match_id".

For example, if the prompt is: "Messi scores a hat trick against France" and match ID 5 is Argentina vs France:
Return exactly:
{
  "title": "Messi Hat-Trick vs France",
  "conditions": ["Lionel Messi scores 3 or more goals against France"],
  "odds": 8.5,
  "match_id": 5,
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

    if (parsed.declined) {
      return { success: false, error: parsed.decline_reason || "Bet declined by AI checker." };
    }

    return { 
      success: true, 
      title: parsed.title || "Custom AI Bet",
      odds: parsed.odds || 2.0,
      match_id: parsed.match_id || null,
      conditions: parsed.conditions || [], 
      lock_at: parsed.lock_at || null 
    };
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

  // Use admin client to bypass RLS for inserts since the policy only allows hosts
  const { data, error } = await supabaseAdmin.from("bets").insert({
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
