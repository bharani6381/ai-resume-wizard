import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Check, Columns } from "lucide-react";

type Props = {
  selected: TemplateId;
  onSelect: (id: TemplateId) => void;
  ai?: AIContent | null;
  input?: ResumeInput | null;
};

/**
 * Read-only side-by-side comparison of every template.
 * Rendering is purely presentational — resume content is never mutated.
 */
export function TemplateCompare({ selected, onSelect, ai, input }: Props) {
  const [open, setOpen] = useState(false);
  const previewInput = input && input.personal.fullName ? input : SAMPLE_INPUT;
  const previewAi: AIContent =
    ai && (ai.experience?.length || ai.skills?.length || ai.summary) ? ai : SAMPLE_AI;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="print:hidden">
          <Columns className="mr-1.5 h-4 w-4" /> Compare
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Compare templates</DialogTitle>
          <DialogDescription>
            Side-by-side preview of your content in every design. Nothing changes until you pick one.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-auto pr-1">
          <div className="flex gap-4 pb-2">
            {TEMPLATES.map((t) => {
              const active = t.id === selected;
              return (
                <div
                  key={t.id}
                  className={cn(
                    "w-[260px] shrink-0 overflow-hidden rounded-xl border bg-background",
                    active ? "border-primary ring-2 ring-primary/30" : "border-border",
                  )}
                >
                  <div className={cn("h-1.5 w-full bg-gradient-to-r", t.accent)} />
                  <div className="p-3">
                    <div className="pointer-events-none relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-white">
                      <div
                        aria-hidden
                        className="absolute left-0 top-0 origin-top-left p-8"
                        style={{ width: 794, transform: "scale(0.295)" }}
                      >
                        {renderTemplate(t.id, { ai: previewAi, input: previewInput })}
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                      {t.name}
                      {active && <Check className="h-3.5 w-3.5 text-primary" />}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.description}</p>
                    <Button
                      size="sm"
                      variant={active ? "secondary" : "default"}
                      className="mt-3 w-full"
                      onClick={() => {
                        onSelect(t.id);
                        setOpen(false);
                      }}
                    >
                      {active ? "Current" : "Use Template"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
