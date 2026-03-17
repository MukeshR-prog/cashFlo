/**
 * groq-llm.ts
 * ───────────
 * Thin wrapper around the Groq REST API.
 * Uses native fetch – no SDK dependency needed.
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function callGroq(
  systemPrompt: string,
  userContent: string,
  model?: string
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set in environment variables.");

  const selectedModel = model ?? process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

  const messages: GroqMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ];

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: selectedModel,
      messages,
      temperature: 0.3,        // low temp for factual answers
      max_tokens: 512,
      top_p: 0.9,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content as string | undefined;
  if (!content) throw new Error("Groq returned an empty response.");
  return content.trim();
}
