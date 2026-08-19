// Server-only helper for calling AI.
// Uses the user's own Google Gemini key (GEMINI_API_KEY) when it is present and
// well-formed, and falls back to the built-in Lovable AI Gateway otherwise.
// This file is server-only — no key ever reaches the browser.

type Msg = { role: string; content: string };

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const LOVABLE_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

/** Google AI Studio keys look like `AIza...` and are ~39 chars. */
function normalizeGeminiKey(raw: string | undefined) {
  const key = (raw ?? "").trim().replace(/^["']|["']$/g, "");
  if (!key) return { key: "", valid: false };
  const valid = /^AIza[0-9A-Za-z_-]{30,45}$/.test(key);
  return { key, valid };
}

type Opts = { model?: string; jsonSchema?: unknown; schemaName?: string };

function buildBody(messages: Msg[], opts: Opts | undefined, gemini: boolean) {
  const body: Record<string, unknown> = {
    model: opts?.model ?? (gemini ? "gemini-2.5-flash" : "google/gemini-2.5-flash"),
    messages,
  };
  if (opts?.jsonSchema) {
    body.response_format = {
      type: "json_schema",
      json_schema: { name: opts?.schemaName ?? "output", schema: opts.jsonSchema, strict: false },
    };
  }
  return body;
}

async function request(url: string, headers: Record<string, string>, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text };
}

/** Turn any provider failure into a short, human-readable message. */
function friendlyError(status: number, provider: "gemini" | "lovable"): string {
  if (status === 429) return "The AI is busy right now — please try again in a few seconds.";
  if (status === 402) return "AI credits are exhausted. Add credits in your workspace settings to keep generating.";
  if (status === 400 || status === 401 || status === 403) {
    return provider === "gemini"
      ? "Your Gemini API key was rejected. Check the GEMINI_API_KEY secret and that the Generative Language API is enabled."
      : "AI access was denied. Please try again, or contact support if this persists.";
  }
  if (status >= 500) return "The AI service is temporarily unavailable. Please try again shortly.";
  return "AI request failed. Please try again.";
}

export async function callAI(messages: Msg[], opts?: Opts) {
  const { key: geminiKey, valid: geminiValid } = normalizeGeminiKey(process.env.GEMINI_API_KEY);
  const lovableKey = process.env.LOVABLE_API_KEY;

  if (!geminiValid && !lovableKey) {
    throw new Error(
      geminiKey
        ? "The configured GEMINI_API_KEY doesn't look like a Google AI Studio key (it should start with \"AIza\"). Please update the secret."
        : "AI is not configured yet — no AI key is available.",
    );
  }

  const attempts: Array<{ provider: "gemini" | "lovable"; url: string; headers: Record<string, string> }> = [];
  if (geminiValid) {
    attempts.push({
      provider: "gemini",
      url: GEMINI_URL,
      // Google's OpenAI-compatible endpoint accepts the key as a bearer token.
      headers: { Authorization: `Bearer ${geminiKey}` },
    });
  }
  if (lovableKey) {
    attempts.push({ provider: "lovable", url: LOVABLE_URL, headers: { "Lovable-API-Key": lovableKey } });
  }

  let lastMessage = "AI request failed. Please try again.";

  for (let i = 0; i < attempts.length; i++) {
    const a = attempts[i]!;
    const body = buildBody(messages, opts, a.provider === "gemini");
    let result: { ok: boolean; status: number; text: string };
    try {
      result = await request(a.url, a.headers, body);
    } catch {
      lastMessage = "Couldn't reach the AI service. Please check your connection and try again.";
      continue;
    }

    if (result.ok) {
      try {
        const data = JSON.parse(result.text);
        return (data.choices?.[0]?.message?.content ?? "") as string;
      } catch {
        lastMessage = "The AI returned an unexpected response. Please try again.";
        continue;
      }
    }

    // Log details server-side only; never surface raw provider JSON to the user.
    console.error(`[ai] ${a.provider} failed with ${result.status}: ${result.text.slice(0, 500)}`);
    lastMessage = friendlyError(result.status, a.provider);

    // Credit/rate errors are not fixed by another provider attempt unless one is available.
    const hasFallback = i < attempts.length - 1;
    if (!hasFallback) throw new Error(lastMessage);
  }

  throw new Error(lastMessage);
}
