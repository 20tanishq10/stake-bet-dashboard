/**
 * OpenRouter client for AI bet parsing/generation (Phase 5+).
 * Model default: Qwen via OpenRouter.
 */

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenRouterResponse = {
  choices: Array<{ message: { content: string } }>;
};

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "Football Stake Tracker",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? "qwen/qwen-2.5-72b-instruct",
      messages,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenRouter error: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as OpenRouterResponse;
  return data.choices[0]?.message.content ?? "";
}

/** Parse free-text bet idea into structured BetRule JSON (Phase 5) */
export async function parseBetIdea(prompt: string): Promise<string> {
  return chatCompletion([
    {
      role: "system",
      content:
        "You convert football bet ideas into JSON matching the BetRule schema. Respond with JSON only.",
    },
    { role: "user", content: prompt },
  ]);
}
