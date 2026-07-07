// Server-only helper for calling the Lovable AI Gateway.
export async function callAI(messages: Array<{ role: string; content: string }>, opts?: { model?: string; jsonSchema?: unknown; schemaName?: string }) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  const body: Record<string, unknown> = {
    model: opts?.model ?? "google/gemini-2.5-flash",
    messages,
  };

  if (opts?.jsonSchema) {
    body.response_format = {
      type: "json_schema",
      json_schema: { name: opts.schemaName ?? "output", schema: opts.jsonSchema, strict: false },
    };
  }

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("AI rate limit — please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted — please add credits in workspace settings.");
    throw new Error(`AI error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
