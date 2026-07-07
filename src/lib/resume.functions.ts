import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAI } from "./ai-gateway.server";

const ResumeInputSchema = z.object({
  personal: z.object({
    fullName: z.string().max(120).default(""),
    title: z.string().max(120).default(""),
    email: z.string().max(200).default(""),
    phone: z.string().max(40).default(""),
    location: z.string().max(120).default(""),
    website: z.string().max(200).default(""),
    summary: z.string().max(2000).default(""),
  }),
  education: z.string().max(3000).default(""),
  skills: z.string().max(1500).default(""),
  experience: z.string().max(5000).default(""),
  projects: z.string().max(5000).default(""),
});

export type ResumeInput = z.infer<typeof ResumeInputSchema>;

export const generateResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => ResumeInputSchema.parse(v))
  .handler(async ({ data }) => {
    const schema = {
      type: "object",
      properties: {
        summary: { type: "string" },
        skills: { type: "array", items: { type: "string" } },
        experience: {
          type: "array",
          items: {
            type: "object",
            properties: {
              role: { type: "string" },
              company: { type: "string" },
              period: { type: "string" },
              bullets: { type: "array", items: { type: "string" } },
            },
          },
        },
        projects: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              bullets: { type: "array", items: { type: "string" } },
            },
          },
        },
        education: {
          type: "array",
          items: {
            type: "object",
            properties: {
              school: { type: "string" },
              degree: { type: "string" },
              period: { type: "string" },
              details: { type: "string" },
            },
          },
        },
      },
    };

    const system =
      "You are an expert resume writer. Turn the user's raw notes into a concise, ATS-friendly resume. " +
      "Write in strong action verbs. Quantify impact where possible. Keep each bullet under 22 words. " +
      "Never fabricate roles or companies the user didn't mention. Return valid JSON matching the schema.";

    const user = `Build a resume from these details.\n\n${JSON.stringify(data, null, 2)}`;

    const raw = await callAI(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { jsonSchema: schema, schemaName: "resume" },
    );

    try {
      return JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new Error("AI returned invalid JSON");
    }
  });
