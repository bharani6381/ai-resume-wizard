import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Download, Save, Sparkles, Loader2, Check, RotateCcw } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { generateResume, type ResumeInput } from "@/lib/resume.functions";
import { renderTemplate, TEMPLATES, type AIContent, type TemplateId } from "@/lib/resume-templates";
import { ATSPanel } from "@/components/ATSPanel";
import { TemplateGallery } from "@/components/TemplateGallery";
import { TemplateCompare } from "@/components/TemplateCompare";
import type { ATSTab } from "@/lib/ats-score";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/builder/$id")({
  component: Builder,
  head: () => ({ meta: [{ title: "Resume builder · Resumly" }, { name: "robots", content: "noindex" }] }),
});

const DEFAULT_TEMPLATE: TemplateId = "modern";

const emptyInput: ResumeInput = {
  personal: { fullName: "", title: "", email: "", phone: "", location: "", website: "", summary: "" },
  education: "",
  skills: "",
  experience: "",
  projects: "",
};

function Builder() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const runAI = useServerFn(generateResume);

  const [title, setTitle] = useState("Untitled resume");
  const [input, setInput] = useState<ResumeInput>(emptyInput);
  const [ai, setAi] = useState<AIContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [template, setTemplate] = useState<TemplateId>(DEFAULT_TEMPLATE);
  const [tab, setTab] = useState<ATSTab>("personal");

  const focusField = (nextTab: ATSTab, fieldId?: string) => {
    setTab(nextTab);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (fieldId) {
          const el = document.getElementById(fieldId) as HTMLElement | null;
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            if ("focus" in el && typeof (el as HTMLInputElement).focus === "function") {
              (el as HTMLInputElement).focus({ preventScroll: true });
            }
            return;
          }
        }
        document.getElementById("form-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("resumes").select("*").eq("id", id).maybeSingle();
      if (error) { toast.error(error.message); setLoading(false); return; }
      if (!data) { toast.error("Resume not found"); navigate({ to: "/dashboard" }); return; }
      setTitle(data.title ?? "Untitled resume");
      if (data.data && typeof data.data === "object") {
        setInput({ ...emptyInput, ...(data.data as Partial<ResumeInput>) });
      }
      if (data.ai_content) setAi(data.ai_content as AIContent);
      if (data.template) setTemplate(data.template as TemplateId);
      setLoading(false);
    })();
  }, [id, navigate]);

  const selectTemplate = async (next: TemplateId) => {
    setTemplate(next);
    const { error } = await supabase.from("resumes").update({ template: next }).eq("id", id);
    if (error) toast.error(error.message);
  };

  const resetTemplate = async () => {
    await selectTemplate(DEFAULT_TEMPLATE);
    toast.success("Template reset to default — your content is unchanged");
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("resumes")
      .update({ title, data: input, ai_content: ai ?? undefined, template })
      .eq("id", id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const result = (await runAI({ data: input })) as AIContent;
      setAi(result);
      await supabase.from("resumes").update({ title, data: input, ai_content: result, template }).eq("id", id);
      toast.success("Resume generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI generation failed");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="h-96 animate-pulse rounded-xl bg-muted/40" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard" })}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> All resumes
          </Button>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-9 w-64 border-transparent bg-transparent px-2 text-lg font-semibold hover:border-border focus-visible:border-border"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={save} disabled={saving}>
            <Save className="mr-1.5 h-4 w-4" /> Save
          </Button>
          <Button size="sm" onClick={generate} disabled={generating}>
            {generating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
            {ai ? "Regenerate" : "Generate with AI"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} disabled={!ai}>
            <Download className="mr-1.5 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <ATSPanel input={input} ai={ai} onFocusField={focusField} onGenerate={generate} generating={generating} />
          <FormPanel input={input} setInput={setInput} tab={tab} setTab={setTab} />
        </div>
        <PreviewPanel
          ai={ai}
          input={input}
          generating={generating}
          template={template}
          setTemplate={selectTemplate}
          onResetTemplate={resetTemplate}
        />
      </div>

      <TemplateGallery
        className="mt-6"
        selected={template}
        onSelect={selectTemplate}
        ai={ai}
        input={input}
      />
    </main>
  );
}

function FormPanel({
  input,
  setInput,
  tab,
  setTab,
}: {
  input: ResumeInput;
  setInput: (v: ResumeInput) => void;
  tab: ATSTab;
  setTab: (t: ATSTab) => void;
}) {
  const p = input.personal;
  const set = <K extends keyof ResumeInput>(k: K, v: ResumeInput[K]) => setInput({ ...input, [k]: v });
  const setP = <K extends keyof ResumeInput["personal"]>(k: K, v: string) =>
    setInput({ ...input, personal: { ...p, [k]: v } });

  return (
    <div id="form-panel" className="rounded-xl border border-border bg-surface p-6 shadow-soft print:hidden">
      <Tabs value={tab} onValueChange={(v) => setTab(v as ATSTab)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">You</TabsTrigger>
          <TabsTrigger value="education">Edu</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="experience">Work</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name"><Input id="field-personal-fullName" value={p.fullName} onChange={(e) => setP("fullName", e.target.value)} /></Field>
            <Field label="Headline / title"><Input id="field-personal-title" placeholder="Frontend Engineer" value={p.title} onChange={(e) => setP("title", e.target.value)} /></Field>
            <Field label="Email"><Input id="field-personal-email" type="email" value={p.email} onChange={(e) => setP("email", e.target.value)} /></Field>
            <Field label="Phone"><Input id="field-personal-phone" value={p.phone} onChange={(e) => setP("phone", e.target.value)} /></Field>
            <Field label="Location"><Input id="field-personal-location" value={p.location} onChange={(e) => setP("location", e.target.value)} /></Field>
            <Field label="Website / LinkedIn"><Input id="field-personal-website" value={p.website} onChange={(e) => setP("website", e.target.value)} /></Field>
          </div>
          <Field label="Short summary (optional)">
            <Textarea id="field-personal-summary" rows={3} placeholder="A sentence or two about yourself" value={p.summary} onChange={(e) => setP("summary", e.target.value)} />
          </Field>
        </TabsContent>

        <TabsContent value="education" className="mt-6">
          <Field label="Education" hint="Schools, degrees, years, GPA. Free-form.">
            <Textarea id="field-education" rows={10} value={input.education} onChange={(e) => set("education", e.target.value)}
              placeholder="B.Tech Computer Science, XYZ University, 2021–2025, GPA 8.4/10&#10;Coursework: Data Structures, Databases, ML" />
          </Field>
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <Field label="Skills" hint="Comma-separated or bullets — AI will organize.">
            <Textarea id="field-skills" rows={8} value={input.skills} onChange={(e) => set("skills", e.target.value)}
              placeholder="JavaScript, TypeScript, React, Node, Python, SQL, Figma, Git" />
          </Field>
        </TabsContent>

        <TabsContent value="experience" className="mt-6">
          <Field label="Work experience" hint="Role, company, dates, and rough notes on what you did.">
            <Textarea id="field-experience" rows={12} value={input.experience} onChange={(e) => set("experience", e.target.value)}
              placeholder="Software Intern at Acme (Jun–Aug 2024)&#10;- built internal dashboard, improved report time&#10;- shipped 2 features to prod" />
          </Field>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <Field label="Projects" hint="Name, one-line description, and any results.">
            <Textarea id="field-projects" rows={12} value={input.projects} onChange={(e) => set("projects", e.target.value)}
              placeholder="FestApp — React event platform, 2k users during college fest&#10;Chatbot — Python + OpenAI, helped 500 students find courses" />
          </Field>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function PreviewPanel({
  ai, input, generating, template, setTemplate, onResetTemplate,
}: {
  ai: AIContent | null;
  input: ResumeInput;
  generating: boolean;
  template: TemplateId;
  setTemplate: (t: TemplateId) => void;
  onResetTemplate: () => void;
}) {
  const effectiveAi: AIContent = ai ?? {
    summary: input.personal.summary || undefined,
  };
  const showPlaceholder = !ai;

  return (
    <div className="lg:sticky lg:top-24 lg:h-fit">
      <div className="mb-3 flex flex-wrap items-center gap-2 print:hidden">
        <span className="mr-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Template</span>
        {TEMPLATES.map((t) => {
          const active = t.id === template;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplate(t.id)}
              title={t.description}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-foreground hover:border-primary/50",
              )}
            >
              {active && <Check className="h-3 w-3" />}
              {t.name}
            </button>
          );
        })}
        <TemplateCompare selected={template} onSelect={setTemplate} ai={ai} input={input} />
        <Button variant="ghost" size="sm" onClick={onResetTemplate} disabled={template === DEFAULT_TEMPLATE}>
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset template
        </Button>
      </div>

      <div id="resume-print" className="overflow-hidden rounded-xl border border-border bg-white p-10 shadow-soft">
        {generating && (
          <div className="mb-4 rounded-md bg-accent/40 px-3 py-2 text-xs text-accent-foreground">
            <Loader2 className="mr-1.5 inline h-3 w-3 animate-spin" /> Generating with AI…
          </div>
        )}

        {renderTemplate(template, { ai: effectiveAi, input })}

        {showPlaceholder && (
          <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            <Sparkles className="mx-auto h-5 w-5 text-slate-400" />
            <p className="mt-2">Fill in your details and click <strong>Generate with AI</strong> to see your resume here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

