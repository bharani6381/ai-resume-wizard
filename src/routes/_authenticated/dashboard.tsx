import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type ResumeRow = {
  id: string;
  title: string;
  updated_at: string;
};

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Your resumes · Resumly" }, { name: "robots", content: "noindex" }] }),
});

function Dashboard() {
  const [resumes, setResumes] = useState<ResumeRow[] | null>(null);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    const { data, error } = await supabase
      .from("resumes")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setResumes(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const createNew = async () => {
    setCreating(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setCreating(false); toast.error("Not signed in"); return; }
    const { data, error } = await supabase
      .from("resumes")
      .insert({ title: "Untitled resume", data: {}, user_id: userData.user.id })
      .select("id")
      .single();
    setCreating(false);
    if (error || !data) { toast.error(error?.message ?? "Failed to create"); return; }
    navigate({ to: "/builder/$id", params: { id: data.id } });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("resumes").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setResumes((r) => r?.filter((x) => x.id !== id) ?? null);
    toast.success("Resume deleted");
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Your resumes</h1>
          <p className="mt-1 text-muted-foreground">Create, edit, and download professional resumes.</p>
        </div>
        <Button onClick={createNew} disabled={creating}>
          <Plus className="mr-2 h-4 w-4" /> New resume
        </Button>
      </div>

      <div className="mt-10">
        {resumes === null ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl border border-border bg-muted/40" />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <EmptyState onCreate={createNew} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((r) => (
              <div key={r.id} className="group rounded-xl border border-border bg-surface p-5 shadow-soft transition hover:shadow-lift">
                <div className="flex items-start justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                    <FileText className="h-5 w-5" />
                  </div>
                  <button onClick={() => remove(r.id)} className="rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="mt-4 font-semibold">{r.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Updated {formatDistanceToNow(new Date(r.updated_at), { addSuffix: true })}
                </p>
                <Link to="/builder/$id" params={{ id: r.id }} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-foreground">
        <FileText className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-2xl">Start your first resume</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Enter your details, let AI write the content, and download a polished PDF.
      </p>
      <Button className="mt-6" onClick={onCreate}>
        <Plus className="mr-2 h-4 w-4" /> Create resume
      </Button>
    </div>
  );
}
