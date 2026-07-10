import { useMemo, useState } from "react";
import { Check, X, ChevronDown, ChevronUp, ShieldCheck, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import type { ResumeInput } from "@/lib/resume.functions";
import type { AIContent } from "@/lib/resume-templates";
import { scoreResume, type ATSTab } from "@/lib/ats-score";
import { cn } from "@/lib/utils";

export function ATSPanel({
  input,
  ai,
  onFocusField,
  onGenerate,
  generating = false,
}: {
  input: ResumeInput;
  ai: AIContent | null;
  onFocusField?: (tab: ATSTab, fieldId?: string) => void;
  onGenerate?: () => void;
  generating?: boolean;
}) {
  const report = useMemo(() => scoreResume(input, ai), [input, ai]);
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const ring =
    report.score >= 85 ? "text-emerald-600" :
    report.score >= 70 ? "text-blue-600" :
    report.score >= 50 ? "text-amber-600" : "text-red-600";

  const failing = report.checks.filter((c) => !c.passed);
  const visible = showAll ? report.checks : failing.length > 0 ? failing : report.checks;

  return (
    <div className="rounded-xl border border-border bg-surface shadow-soft print:hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <div className="flex items-center gap-4">
          <ScoreRing score={report.score} className={ring} />
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              ATS Readiness
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", badgeClass(report.score))}>
                {report.grade}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {report.passed} of {report.total} checks passed
              {failing.length > 0 && ` · ${failing.length} to fix`}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4">
          <ul className="space-y-2.5">
            {visible.map((c) => (
              <li key={c.id} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                    c.passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700",
                  )}
                >
                  {c.passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm", c.passed ? "text-foreground" : "font-medium text-foreground")}>
                    {c.label}
                  </p>
                  {!c.passed && (
                    <>
                      <p className="mt-0.5 text-xs text-muted-foreground">{c.hint}</p>
                      {c.action && (
                        <div className="mt-1.5">
                          {c.action.kind === "focus" ? (
                            <button
                              type="button"
                              onClick={() => onFocusField?.(c.action!.kind === "focus" ? c.action!.tab : "personal", c.action!.kind === "focus" ? c.action!.fieldId : undefined)}
                              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground transition hover:border-primary/50 hover:text-primary"
                            >
                              {c.action.label}
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onGenerate?.()}
                              disabled={generating}
                              className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium text-primary transition hover:bg-primary/15 disabled:opacity-60"
                            >
                              {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                              {c.action.label}
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {failing.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-4 text-xs font-medium text-primary hover:underline"
            >
              {showAll ? "Show only issues" : `Show all ${report.total} checks`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function badgeClass(score: number) {
  if (score >= 85) return "bg-emerald-100 text-emerald-700";
  if (score >= 70) return "bg-blue-100 text-blue-700";
  if (score >= 50) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function ScoreRing({ score, className }: { score: number; className?: string }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className={cn("relative h-14 w-14", className)}>
      <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90">
        <circle cx="24" cy="24" r={r} stroke="currentColor" strokeOpacity="0.15" strokeWidth="4" fill="none" />
        <circle
          cx="24" cy="24" r={r}
          stroke="currentColor" strokeWidth="4" fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 400ms ease" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-foreground">
        {score}
      </span>
    </div>
  );
}
