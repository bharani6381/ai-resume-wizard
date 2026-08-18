// Server-only helper for calling AI.
// Prefers the user's own Gemini API key (GEMINI_API_KEY) via Google's
// OpenAI-compatible endpoint, and falls back to the Lovable AI Gateway.
// This file is server-only — the key never reaches the browser.

type Msg = { role: string; content: string };

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const LOVABLE_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export async function callAI(
  messages: Msg[],
  opts?: { model?: string; jsonSchema?: unknown; schemaName?: string },
) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;

  const useGemini = Boolean(geminiKey);
  if (!useGemini && !lovableKey) throw new Error("No AI credentials configured");

  const body: Record<string, unknown> = {
    model: opts?.model ?? (useGemini ? "gemini-2.5-flash" : "google/gemini-2.5-flash"),
    messages,
  };

  if (opts?.jsonSchema) {
    body.response_format = {
      type: "json_schema",
      json_schema: { name: opts.schemaName ?? "output", schema: opts.jsonSchema, strict: false },
    };
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (useGemini) {
    headers.Authorization = `Bearer ${geminiKey}`;
  } else {
    headers["Lovable-API-Key"] = lovableKey!;
  }

  const res = await fetch(useGemini ? GEMINI_URL : LOVABLE_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("AI rate limit — please try again in a moment.");
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        useGemini
          ? "Gemini rejected the API key — please check that GEMINI_API_KEY is valid and has the Generative Language API enabled."
          : "AI access denied.",
      );
    }
    if (res.status === 402) throw new Error("AI credits exhausted — please add credits in workspace settings.");
    throw new Error(`AI error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
