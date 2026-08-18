import type { ResumeInput } from "./resume.functions";

export type AIContent = {
  summary?: string;
  skills?: string[];
  experience?: Array<{ role?: string; company?: string; period?: string; bullets?: string[] }>;
  projects?: Array<{ name?: string; description?: string; bullets?: string[] }>;
  education?: Array<{ school?: string; degree?: string; period?: string; details?: string }>;
};

export type TemplateId = "modern" | "professional" | "minimal" | "creative" | "ats";

export const TEMPLATES: { id: TemplateId; name: string; description: string; accent: string }[] = [
  { id: "modern", name: "Modern", description: "Dark sidebar with skills and education at a glance", accent: "from-slate-900 to-slate-600" },
  { id: "professional", name: "Professional", description: "Traditional serif layout trusted by recruiters", accent: "from-stone-700 to-stone-400" },
  { id: "minimal", name: "Minimal", description: "Dense, clean single column that fits on one page", accent: "from-zinc-500 to-zinc-300" },
  { id: "creative", name: "Creative", description: "Centered header with refined, editorial typography", accent: "from-rose-500 to-amber-400" },
  { id: "ats", name: "ATS-Friendly", description: "Plain structure, no columns — maximum parser safety", accent: "from-emerald-600 to-teal-400" },
];

/** Sample content used for template gallery previews. */
export const SAMPLE_INPUT: ResumeInput = {
  personal: {
    fullName: "Alex Morgan",
    title: "Frontend Engineer",
    email: "alex@example.com",
    phone: "+1 555 0142",
    location: "Bengaluru, IN",
    website: "alexmorgan.dev",
    summary: "Frontend engineer focused on accessible, fast product interfaces.",
  },
  education: "",
  skills: "",
  experience: "",
  projects: "",
};

export const SAMPLE_AI: AIContent = {
  summary:
    "Frontend engineer with 4 years building React products used by 100k+ people. Ships accessible interfaces and cuts load times through measurement.",
  skills: ["React", "TypeScript", "Tailwind CSS", "Node.js", "Testing", "Accessibility"],
  experience: [
    {
      role: "Frontend Engineer",
      company: "Northwind",
      period: "2023 — Present",
      bullets: [
        "Rebuilt checkout flow, lifting conversion 18% in one quarter.",
        "Reduced bundle size by 42% through route-level code splitting.",
      ],
    },
    {
      role: "Junior Developer",
      company: "Bluepeak",
      period: "2021 — 2023",
      bullets: ["Delivered 12 customer-facing features across 3 product teams."],
    },
  ],
  projects: [
    { name: "Resumly", description: "AI resume builder", bullets: ["2k users in first month."] },
  ],
  education: [
    { school: "State University", degree: "B.Tech, Computer Science", period: "2017 — 2021", details: "GPA 8.6/10" },
  ],
};

type Props = { ai: AIContent; input: ResumeInput };

function contactStr(p: ResumeInput["personal"]) {
  return [p.email, p.phone, p.location, p.website].filter(Boolean).join(" · ");
}

/* ---------- Classic ---------- */
export function ClassicTemplate({ ai, input }: Props) {
  const p = input.personal;
  return (
    <div className="font-serif text-[13px] leading-relaxed text-slate-900">
      <header className="border-b-2 border-slate-900 pb-3">
        <h1 className="text-3xl font-bold tracking-tight">{p.fullName || "Your Name"}</h1>
        {p.title && <p className="mt-0.5 text-sm text-slate-700">{p.title}</p>}
        {contactStr(p) && <p className="mt-1 text-xs text-slate-600">{contactStr(p)}</p>}
      </header>
      {(ai.summary || p.summary) && (
        <Section title="Summary"><p>{ai.summary || p.summary}</p></Section>
      )}
      {ai.skills?.length ? <Section title="Skills"><p>{ai.skills.join(" · ")}</p></Section> : null}
      {ai.experience?.length ? (
        <Section title="Experience">
          {ai.experience.map((e, i) => (
            <div key={i} className="mt-3 first:mt-0">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-bold">{e.role}{e.company ? ` · ${e.company}` : ""}</p>
                {e.period && <p className="text-xs text-slate-600">{e.period}</p>}
              </div>
              {e.bullets && <ul className="mt-1 list-disc space-y-1 pl-5">{e.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>}
            </div>
          ))}
        </Section>
      ) : null}
      {ai.projects?.length ? (
        <Section title="Projects">
          {ai.projects.map((pr, i) => (
            <div key={i} className="mt-3 first:mt-0">
              <p className="font-bold">{pr.name}</p>
              {pr.description && <p>{pr.description}</p>}
              {pr.bullets && <ul className="mt-1 list-disc space-y-1 pl-5">{pr.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>}
            </div>
          ))}
        </Section>
      ) : null}
      {ai.education?.length ? (
        <Section title="Education">
          {ai.education.map((ed, i) => (
            <div key={i} className="mt-2 first:mt-0">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-bold">{ed.degree}{ed.school ? ` · ${ed.school}` : ""}</p>
                {ed.period && <p className="text-xs text-slate-600">{ed.period}</p>}
              </div>
              {ed.details && <p>{ed.details}</p>}
            </div>
          ))}
        </Section>
      ) : null}
    </div>
  );

  function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <section className="mt-4">
        <h2 className="border-b border-slate-300 pb-0.5 text-sm font-bold uppercase tracking-wider">{title}</h2>
        <div className="mt-2">{children}</div>
      </section>
    );
  }
}

/* ---------- Modern (sidebar) ---------- */
export function ModernTemplate({ ai, input }: Props) {
  const p = input.personal;
  return (
    <div className="grid grid-cols-[35%_1fr] gap-6 text-[12.5px] leading-relaxed text-slate-900">
      <aside className="-m-10 mr-0 bg-slate-900 p-8 text-slate-100">
        <h1 className="text-2xl font-semibold leading-tight">{p.fullName || "Your Name"}</h1>
        {p.title && <p className="mt-1 text-sm text-slate-300">{p.title}</p>}
        <div className="mt-6 space-y-1 text-xs text-slate-300">
          {p.email && <p>{p.email}</p>}
          {p.phone && <p>{p.phone}</p>}
          {p.location && <p>{p.location}</p>}
          {p.website && <p className="break-all">{p.website}</p>}
        </div>
        {ai.skills?.length ? (
          <div className="mt-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Skills</h2>
            <ul className="mt-2 space-y-1 text-xs">{ai.skills.map((s, i) => <li key={i}>• {s}</li>)}</ul>
          </div>
        ) : null}
        {ai.education?.length ? (
          <div className="mt-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Education</h2>
            {ai.education.map((ed, i) => (
              <div key={i} className="mt-2 text-xs">
                <p className="font-semibold text-slate-100">{ed.degree}</p>
                {ed.school && <p className="text-slate-300">{ed.school}</p>}
                {ed.period && <p className="text-slate-400">{ed.period}</p>}
              </div>
            ))}
          </div>
        ) : null}
      </aside>
      <main className="py-2">
        {(ai.summary || p.summary) && (
          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Profile</h2>
            <p className="mt-2">{ai.summary || p.summary}</p>
          </section>
        )}
        {ai.experience?.length ? (
          <section className="mt-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Experience</h2>
            {ai.experience.map((e, i) => (
              <div key={i} className="mt-3">
                <p className="font-semibold">{e.role}{e.company ? ` · ${e.company}` : ""}</p>
                {e.period && <p className="text-xs text-slate-500">{e.period}</p>}
                {e.bullets && <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">{e.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>}
              </div>
            ))}
          </section>
        ) : null}
        {ai.projects?.length ? (
          <section className="mt-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Projects</h2>
            {ai.projects.map((pr, i) => (
              <div key={i} className="mt-3">
                <p className="font-semibold">{pr.name}</p>
                {pr.description && <p className="text-slate-700">{pr.description}</p>}
                {pr.bullets && <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">{pr.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>}
              </div>
            ))}
          </section>
        ) : null}
      </main>
    </div>
  );
}

/* ---------- Compact ---------- */
export function CompactTemplate({ ai, input }: Props) {
  const p = input.personal;
  return (
    <div className="text-[12px] leading-snug text-slate-900">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-300 pb-2">
        <div>
          <h1 className="text-xl font-bold">{p.fullName || "Your Name"}</h1>
          {p.title && <span className="ml-2 text-xs text-slate-600">— {p.title}</span>}
        </div>
        {contactStr(p) && <p className="text-[11px] text-slate-600">{contactStr(p)}</p>}
      </header>
      {(ai.summary || p.summary) && <p className="mt-2 text-[11.5px]">{ai.summary || p.summary}</p>}
      {ai.skills?.length ? (
        <p className="mt-2 text-[11.5px]"><span className="font-semibold">Skills:</span> {ai.skills.join(", ")}</p>
      ) : null}
      {ai.experience?.length ? (
        <Block title="Experience">
          {ai.experience.map((e, i) => (
            <div key={i} className="mt-1.5">
              <p className="font-semibold">{e.role}{e.company ? `, ${e.company}` : ""}{e.period ? ` — ${e.period}` : ""}</p>
              {e.bullets && <ul className="list-disc pl-4">{e.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>}
            </div>
          ))}
        </Block>
      ) : null}
      {ai.projects?.length ? (
        <Block title="Projects">
          {ai.projects.map((pr, i) => (
            <div key={i} className="mt-1.5">
              <p className="font-semibold">{pr.name}{pr.description ? ` — ${pr.description}` : ""}</p>
              {pr.bullets && <ul className="list-disc pl-4">{pr.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>}
            </div>
          ))}
        </Block>
      ) : null}
      {ai.education?.length ? (
        <Block title="Education">
          {ai.education.map((ed, i) => (
            <p key={i} className="mt-1"><span className="font-semibold">{ed.degree}</span>{ed.school ? `, ${ed.school}` : ""}{ed.period ? ` (${ed.period})` : ""}{ed.details ? ` — ${ed.details}` : ""}</p>
          ))}
        </Block>
      ) : null}
    </div>
  );

  function Block({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <section className="mt-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">{title}</h2>
        {children}
      </section>
    );
  }
}

/* ---------- Elegant ---------- */
export function ElegantTemplate({ ai, input }: Props) {
  const p = input.personal;
  return (
    <div className="text-[13px] leading-relaxed text-slate-800">
      <header className="text-center">
        <h1 className="font-display text-4xl tracking-tight text-slate-900">{p.fullName || "Your Name"}</h1>
        {p.title && <p className="mt-1 text-sm uppercase tracking-[0.25em] text-slate-500">{p.title}</p>}
        {contactStr(p) && <p className="mt-3 text-xs text-slate-500">{contactStr(p)}</p>}
        <div className="mx-auto mt-4 h-px w-16 bg-slate-400" />
      </header>
      {(ai.summary || p.summary) && (
        <p className="mt-5 text-center italic text-slate-700">{ai.summary || p.summary}</p>
      )}
      {ai.skills?.length ? (
        <Section title="Expertise"><p className="text-center">{ai.skills.join("  ·  ")}</p></Section>
      ) : null}
      {ai.experience?.length ? (
        <Section title="Experience">
          {ai.experience.map((e, i) => (
            <div key={i} className="mt-3 first:mt-0">
              <p className="font-display text-base text-slate-900">{e.role}{e.company ? ` · ${e.company}` : ""}</p>
              {e.period && <p className="text-xs uppercase tracking-widest text-slate-500">{e.period}</p>}
              {e.bullets && <ul className="mt-1 list-disc space-y-1 pl-5">{e.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>}
            </div>
          ))}
        </Section>
      ) : null}
      {ai.projects?.length ? (
        <Section title="Projects">
          {ai.projects.map((pr, i) => (
            <div key={i} className="mt-3 first:mt-0">
              <p className="font-display text-base text-slate-900">{pr.name}</p>
              {pr.description && <p>{pr.description}</p>}
              {pr.bullets && <ul className="mt-1 list-disc space-y-1 pl-5">{pr.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>}
            </div>
          ))}
        </Section>
      ) : null}
      {ai.education?.length ? (
        <Section title="Education">
          {ai.education.map((ed, i) => (
            <div key={i} className="mt-2 first:mt-0 text-center">
              <p className="font-display text-base text-slate-900">{ed.degree}{ed.school ? ` · ${ed.school}` : ""}</p>
              {ed.period && <p className="text-xs uppercase tracking-widest text-slate-500">{ed.period}</p>}
              {ed.details && <p>{ed.details}</p>}
            </div>
          ))}
        </Section>
      ) : null}
    </div>
  );

  function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <section className="mt-6">
        <h2 className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">{title}</h2>
        <div className="mx-auto mt-1 mb-3 h-px w-8 bg-slate-300" />
        <div>{children}</div>
      </section>
    );
  }
}

/* ---------- ATS-Friendly ---------- */
export function AtsTemplate({ ai, input }: Props) {
  const p = input.personal;
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className="mt-4 text-[12px] font-bold uppercase tracking-wide text-black">{children}</h2>
  );
  return (
    <div className="font-sans text-[12.5px] leading-relaxed text-black">
      <header>
        <h1 className="text-2xl font-bold">{p.fullName || "Your Name"}</h1>
        {p.title && <p>{p.title}</p>}
        <p className="mt-1">{[p.email, p.phone, p.location, p.website].filter(Boolean).join(" | ")}</p>
      </header>
      {(ai.summary || p.summary) && (
        <>
          <H>Professional Summary</H>
          <p>{ai.summary || p.summary}</p>
        </>
      )}
      {ai.skills?.length ? (
        <>
          <H>Skills</H>
          <p>{ai.skills.join(", ")}</p>
        </>
      ) : null}
      {ai.experience?.length ? (
        <>
          <H>Professional Experience</H>
          {ai.experience.map((e, i) => (
            <div key={i} className="mt-2">
              <p className="font-bold">{e.role}</p>
              <p>{[e.company, e.period].filter(Boolean).join(" | ")}</p>
              {e.bullets && (
                <ul className="mt-1 list-disc pl-5">
                  {e.bullets.map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </>
      ) : null}
      {ai.projects?.length ? (
        <>
          <H>Projects</H>
          {ai.projects.map((pr, i) => (
            <div key={i} className="mt-2">
              <p className="font-bold">{pr.name}</p>
              {pr.description && <p>{pr.description}</p>}
              {pr.bullets && (
                <ul className="mt-1 list-disc pl-5">
                  {pr.bullets.map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </>
      ) : null}
      {ai.education?.length ? (
        <>
          <H>Education</H>
          {ai.education.map((ed, i) => (
            <div key={i} className="mt-2">
              <p className="font-bold">{ed.degree}</p>
              <p>{[ed.school, ed.period].filter(Boolean).join(" | ")}</p>
              {ed.details && <p>{ed.details}</p>}
            </div>
          ))}
        </>
      ) : null}
    </div>
  );
}

export function renderTemplate(id: TemplateId, props: Props) {
  switch (id) {
    case "modern": return <ModernTemplate {...props} />;
    case "minimal": return <CompactTemplate {...props} />;
    case "creative": return <ElegantTemplate {...props} />;
    case "ats": return <AtsTemplate {...props} />;
    case "professional":
    default: return <ClassicTemplate {...props} />;
  }
}
