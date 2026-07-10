import type { ResumeInput } from "./resume.functions";
import type { AIContent } from "./resume-templates";

export type ATSTab = "personal" | "education" | "skills" | "experience" | "projects";

export type ATSAction =
  | { kind: "focus"; tab: ATSTab; fieldId?: string; label: string }
  | { kind: "generate"; label: string };

export type ATSCheck = {
  id: string;
  label: string;
  hint: string;
  passed: boolean;
  weight: number; // contribution to score
  action?: ATSAction;
};

export type ATSReport = {
  score: number; // 0–100
  passed: number;
  total: number;
  checks: ATSCheck[];
  grade: "Excellent" | "Good" | "Fair" | "Needs work";
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /[\d][\d\s\-().+]{6,}/;
const NUMBER_RE = /\d/;
const ACTION_VERBS = [
  "built", "led", "designed", "developed", "created", "shipped", "launched",
  "improved", "reduced", "increased", "implemented", "managed", "owned",
  "architected", "optimized", "delivered", "automated", "migrated", "scaled",
  "authored", "founded", "mentored", "analyzed", "researched",
];

export function scoreResume(input: ResumeInput, ai: AIContent | null): ATSReport {
  const p = input.personal;
  const hasAI = !!ai;

  const skills = ai?.skills ?? [];
  const experience = ai?.experience ?? [];
  const projects = ai?.projects ?? [];
  const education = ai?.education ?? [];
  const summary = ai?.summary || p.summary || "";

  const allBullets = [
    ...experience.flatMap((e) => e.bullets ?? []),
    ...projects.flatMap((pr) => pr.bullets ?? []),
  ];
  const bulletsWithNumbers = allBullets.filter((b) => NUMBER_RE.test(b));
  const bulletsWithVerbs = allBullets.filter((b) => {
    const first = b.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
    return first && ACTION_VERBS.includes(first);
  });
  const longBullets = allBullets.filter((b) => b.split(/\s+/).length > 28);

  const checks: ATSCheck[] = [
    {
      id: "name",
      label: "Full name in header",
      hint: "Recruiters and parsers look for a clear name first.",
      passed: p.fullName.trim().length >= 3,
      weight: 5,
      action: { kind: "focus", tab: "personal", fieldId: "field-personal-fullName", label: "Add name" },
    },
    {
      id: "title",
      label: "Professional headline",
      hint: "A role/title (e.g. 'Frontend Engineer') helps keyword matching.",
      passed: p.title.trim().length >= 3,
      weight: 5,
      action: { kind: "focus", tab: "personal", fieldId: "field-personal-title", label: "Add headline" },
    },
    {
      id: "email",
      label: "Valid email address",
      hint: "Use a professional email that parsers can extract.",
      passed: EMAIL_RE.test(p.email.trim()),
      weight: 8,
      action: { kind: "focus", tab: "personal", fieldId: "field-personal-email", label: "Add email" },
    },
    {
      id: "phone",
      label: "Phone number",
      hint: "Include a reachable phone number with country code if possible.",
      passed: PHONE_RE.test(p.phone),
      weight: 5,
      action: { kind: "focus", tab: "personal", fieldId: "field-personal-phone", label: "Add phone" },
    },
    {
      id: "location",
      label: "Location",
      hint: "City / country helps location-based filters.",
      passed: p.location.trim().length >= 2,
      weight: 4,
      action: { kind: "focus", tab: "personal", fieldId: "field-personal-location", label: "Add location" },
    },
    {
      id: "link",
      label: "Website or LinkedIn URL",
      hint: "A portfolio or LinkedIn link boosts credibility.",
      passed: p.website.trim().length >= 4,
      weight: 4,
      action: { kind: "focus", tab: "personal", fieldId: "field-personal-website", label: "Add link" },
    },
    {
      id: "generated",
      label: "AI-generated content available",
      hint: "Click 'Generate with AI' to structure your notes into ATS-friendly sections.",
      passed: hasAI,
      weight: 10,
      action: { kind: "generate", label: "Generate with AI" },
    },
    {
      id: "summary",
      label: "Summary present (30–400 chars)",
      hint: "A short professional summary at the top improves relevance.",
      passed: summary.trim().length >= 30 && summary.trim().length <= 400,
      weight: 6,
      action: { kind: "focus", tab: "personal", fieldId: "field-personal-summary", label: "Edit summary" },
    },
    {
      id: "skills",
      label: "At least 6 skills listed",
      hint: "ATS scanners look for a dedicated skills section with keywords.",
      passed: skills.length >= 6,
      weight: 10,
      action: { kind: "focus", tab: "skills", fieldId: "field-skills", label: "Add skills" },
    },
    {
      id: "experience",
      label: "At least one work experience",
      hint: "Add a role with company and dates.",
      passed: experience.length >= 1,
      weight: 10,
      action: { kind: "focus", tab: "experience", fieldId: "field-experience", label: "Add experience" },
    },
    {
      id: "experience-bullets",
      label: "Experience has bullet points",
      hint: "Each role should have 2–5 achievement bullets.",
      passed: experience.some((e) => (e.bullets?.length ?? 0) >= 2),
      weight: 8,
      action: { kind: "focus", tab: "experience", fieldId: "field-experience", label: "Add bullet notes" },
    },
    {
      id: "education",
      label: "Education section",
      hint: "Include degree, school, and dates.",
      passed: education.length >= 1,
      weight: 7,
      action: { kind: "focus", tab: "education", fieldId: "field-education", label: "Add education" },
    },
    {
      id: "projects",
      label: "At least one project",
      hint: "Projects show impact — great for students and early-career.",
      passed: projects.length >= 1,
      weight: 5,
      action: { kind: "focus", tab: "projects", fieldId: "field-projects", label: "Add projects" },
    },
    {
      id: "quantified",
      label: "Quantified achievements",
      hint: "Include numbers (%, users, revenue, time saved) in at least one bullet.",
      passed: bulletsWithNumbers.length >= 1,
      weight: 8,
      action: { kind: "focus", tab: "experience", fieldId: "field-experience", label: "Add numbers to bullets" },
    },
    {
      id: "action-verbs",
      label: "Bullets start with action verbs",
      hint: "e.g. Built, Led, Reduced, Shipped. At least half your bullets should start with one.",
      passed: allBullets.length > 0 && bulletsWithVerbs.length / allBullets.length >= 0.5,
      weight: 6,
      action: { kind: "generate", label: "Rewrite with AI" },
    },
    {
      id: "bullet-length",
      label: "Bullets are concise (< 28 words)",
      hint: "Keep bullets short and scannable.",
      passed: allBullets.length > 0 && longBullets.length === 0,
      weight: 4,
      action: { kind: "generate", label: "Tighten with AI" },
    },
  ];

  const total = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.filter((c) => c.passed).reduce((s, c) => s + c.weight, 0);
  const score = Math.round((earned / total) * 100);

  const grade: ATSReport["grade"] =
    score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : "Needs work";

  return {
    score,
    passed: checks.filter((c) => c.passed).length,
    total: checks.length,
    checks,
    grade,
  };
}
