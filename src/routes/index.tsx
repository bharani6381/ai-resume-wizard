import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, Download, Zap, Shield, Wand2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Resumly — Build an ATS-friendly resume in minutes with AI" },
      { name: "description", content: "Students and job seekers use Resumly to turn rough notes into a polished, ATS-friendly resume. Enter your info, let AI write the content, and download a clean PDF." },
      { property: "og:title", content: "Resumly — AI Resume Builder" },
      { property: "og:description", content: "Turn rough notes into a polished, ATS-friendly resume in minutes." },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display text-xl">Resumly</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
          <Button asChild size="sm">
            <Link to="/auth">Get started</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero-bg">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground shadow-soft">
            <Sparkles className="h-3 w-3 text-primary" />
            Powered by AI · ATS-friendly
          </div>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-6xl">
            Your next resume,
            <span className="italic text-primary"> written for you</span>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Enter a few details about your background. Resumly turns them into a polished,
            recruiter-ready resume you can download as PDF in minutes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Build my resume — free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#how-it-works">How it works</a>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto mt-16 max-w-4xl">
          <div className="rounded-2xl border border-border bg-surface p-2 shadow-lift">
            <div className="rounded-xl bg-muted/50 p-6 md:p-10">
              <div className="grid gap-6 md:grid-cols-2">
                <MockNotes />
                <MockResume />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockNotes() {
  return (
    <div className="rounded-lg border border-border bg-background p-5 text-left">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <FileText className="h-3.5 w-3.5" /> Your notes
      </div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>• built react app for college fest, 2k users</li>
        <li>• intern at acme — helped with dashboards</li>
        <li>• know js, python, sql, figma</li>
        <li>• b.tech cs, 8.4 cgpa</li>
      </ul>
    </div>
  );
}

function MockResume() {
  return (
    <div className="rounded-lg border border-border bg-background p-5 text-left">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium text-primary">
        <Wand2 className="h-3.5 w-3.5" /> AI-generated resume
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Experience</p>
      <p className="mt-1 text-sm font-medium">Software Engineering Intern · Acme</p>
      <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
        <li>• Built React dashboards used by internal analysts, cutting report time 40%.</li>
        <li>• Shipped an event platform serving 2,000+ students across 3 days.</li>
      </ul>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skills</p>
      <p className="mt-1 text-sm">JavaScript · Python · SQL · Figma · React</p>
    </div>
  );
}

function Features() {
  const items = [
    { icon: Zap, title: "Fast", body: "Go from blank page to finished draft in under 5 minutes." },
    { icon: Shield, title: "ATS-friendly", body: "Clean structure and standard sections that applicant systems parse cleanly." },
    { icon: Wand2, title: "AI-written", body: "Strong action verbs, quantified impact, no fluff — from your rough notes." },
    { icon: Download, title: "PDF download", body: "Print-optimized layout ready to share with recruiters." },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="max-w-2xl">
        <h2 className="font-display text-4xl">Everything you need. Nothing you don't.</h2>
        <p className="mt-3 text-muted-foreground">Focused on the resume — no distractions, no upsells.</p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {items.map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-surface p-6 shadow-soft">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Sign in", body: "Continue with Google or email in one click." },
    { n: "02", title: "Add your details", body: "Personal info, education, skills, experience, projects." },
    { n: "03", title: "Generate & download", body: "AI writes your resume. Preview it, edit anything, download PDF." },
  ];
  return (
    <section id="how-it-works" className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="font-display text-4xl">How it works</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-xl border border-border bg-surface p-6 shadow-soft">
              <div className="font-display text-3xl text-primary">{s.n}</div>
              <h3 className="mt-2 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 text-center">
      <h2 className="font-display text-4xl md:text-5xl">Ready to build your resume?</h2>
      <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
        Join students and job seekers who ship a polished resume in one sitting.
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link to="/auth">Get started — free</Link>
      </Button>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} Resumly · Built with AI
    </footer>
  );
}
