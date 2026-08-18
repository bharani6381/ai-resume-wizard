import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TEMPLATES,
  SAMPLE_AI,
  SAMPLE_INPUT,
  renderTemplate,
  type AIContent,
  type TemplateId,
} from "@/lib/resume-templates";
import type { ResumeInput } from "@/lib/resume.functions";
import { Check } from "lucide-react";

type Props = {
  selected?: TemplateId;
  onSelect?: (id: TemplateId) => void;
  /** Use the user's own resume data in the thumbnails when available. */
  ai?: AIContent | null;
  input?: ResumeInput | null;
  className?: string;
  heading?: string;
  subheading?: string;
};

/** Scaled, non-interactive thumbnail of a template. */
function Thumb({ id, ai, input }: { id: TemplateId; ai: AIContent; input: ResumeInput }) {
  return (
    <div className="pointer-events-none relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-white">
      <div
        aria-hidden
        className="absolute left-0 top-0 origin-top-left p-8"
        style={{ width: 794, transform: "scale(0.32)" }}
      >
        {renderTemplate(id, { ai, input })}
      </div>
    </div>
  );
}

export function TemplateGallery({
  selected,
  onSelect,
  ai,
  input,
  className,
  heading = "Resume Templates",
  subheading = "Switch designs any time — your content stays exactly as you wrote it.",
}: Props) {
  const previewInput = input && input.personal.fullName ? input : SAMPLE_INPUT;
  const previewAi: AIContent =
    ai && (ai.experience?.length || ai.skills?.length || ai.summary) ? ai : SAMPLE_AI;

  return (
    <section
      id="templates"
      className={cn("rounded-xl border border-border bg-surface p-6 shadow-soft print:hidden", className)}
    >
      <header>
        <h2 className="text-lg font-semibold tracking-tight">{heading}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subheading}</p>
      </header>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {TEMPLATES.map((t) => {
          const active = t.id === selected;
          return (
            <article
              key={t.id}
              className={cn(
                "flex flex-col overflow-hidden rounded-xl border bg-background transition",
                active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50",
              )}
            >
              <div className={cn("h-1.5 w-full bg-gradient-to-r", t.accent)} />
              <div className="p-3">
                <Thumb id={t.id} ai={previewAi} input={previewInput} />
              </div>
              <div className="flex flex-1 flex-col px-4 pb-4">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                  {t.name}
                  {active && <Check className="h-3.5 w-3.5 text-primary" />}
                </h3>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">{t.description}</p>
                <Button
                  size="sm"
                  variant={active ? "secondary" : "default"}
                  className="mt-3 w-full"
                  onClick={() => onSelect?.(t.id)}
                  disabled={!onSelect}
                >
                  {active ? "Selected" : "Use Template"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
