import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Stethoscope,
  ScanLine,
  MessageCircle,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import brainHero from "@/assets/brain-scan-hero.jpg";
import brainScan1 from "@/assets/brain-scan-1.jpg";
import brainScan2 from "@/assets/brain-scan-2.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HealthVision AI — AI-Powered Healthcare" },
      {
        name: "description",
        content:
          "Smarter, faster healthcare. Symptom checking, medical image analysis, and 24/7 chat — all powered by AI.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Stethoscope,
    title: "Symptom Checker",
    desc: "Describe how you feel — get an AI assessment with possible conditions and next steps.",
  },
  {
    icon: ScanLine,
    title: "Medical Analysis",
    desc: "Upload an X-ray, scan, or lab report and get plain-language insights in seconds.",
  },
  {
    icon: MessageCircle,
    title: "24/7 Health Chat",
    desc: "Ask anything about medicines, conditions, or wellness — bilingual EN/HI assistant.",
  },
  {
    icon: HeartPulse,
    title: "Vital Tracking",
    desc: "Log heart rate, blood pressure, oxygen and temperature — see trends over time.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy First",
    desc: "Your data is encrypted, RLS-protected, and never shared with third parties.",
  },
  {
    icon: Sparkles,
    title: "Personalized Tips",
    desc: "Daily, AI-curated wellness recommendations based on your profile and history.",
  },
];

const stats = [
  { value: "98%", label: "Diagnostic accuracy" },
  { value: "2.4s", label: "Avg analysis time" },
  { value: "12+", label: "Specialties covered" },
  { value: "24/7", label: "Always available" },
];

function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="container mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI-powered health insights, in seconds
        </div>
        <h1 className="mt-6 text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground">
          <span className="text-gradient-brand">HealthVision AI</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          HealthVision AI brings early disease detection, intelligent analysis, and personalized
          wellness guidance into one beautiful, accessible app.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-brand text-primary-foreground hover:opacity-90 shadow-glow">
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/symptom-checker">
            <Button size="lg" variant="outline">
              Try symptom checker
            </Button>
          </Link>
        </div>

        {/* Hero brain visual */}
        <div className="mt-16 relative max-w-4xl mx-auto rounded-2xl overflow-hidden border border-border shadow-glow">
          <img
            src={brainHero}
            alt="AI brain scan visualization"
            width={1536}
            height={1024}
            className="w-full h-auto"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl sm:text-4xl font-bold text-gradient-brand">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Brain imaging showcase */}
      <section className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          <Card className="overflow-hidden bg-card/60 border-border">
            <img
              src={brainScan1}
              alt="CT brain cross-section"
              loading="lazy"
              width={768}
              height={768}
              className="w-full h-64 object-cover"
            />
            <div className="p-5">
              <h3 className="font-semibold text-foreground">Neural imaging clarity</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                CT and MRI cross-sections analyzed in seconds for early signs of abnormalities.
              </p>
            </div>
          </Card>
          <Card className="overflow-hidden bg-card/60 border-border">
            <img
              src={brainScan2}
              alt="AI-detected brain regions"
              loading="lazy"
              width={768}
              height={768}
              className="w-full h-64 object-cover"
            />
            <div className="p-5">
              <h3 className="font-semibold text-foreground">AI-assisted detection</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Bounding-box highlights help radiologists focus on regions that matter most.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 sm:px-6 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Everything you need for smarter health
          </h2>
          <p className="mt-3 text-muted-foreground">
            From symptom to diagnosis to daily wellness — one app, AI-powered.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card
              key={f.title}
              className="p-6 bg-card/60 border-border hover:border-primary/40 hover:shadow-glow transition-all"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-brand flex items-center justify-center">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 py-20">
        <Card className="p-10 sm:p-16 text-center bg-card/60 border-primary/20 shadow-glow">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Your AI health companion — ready now.
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Sign up free and start getting personalized health insights in under a minute.
          </p>
          <Link to="/auth" className="inline-block mt-6">
            <Button size="lg" className="bg-gradient-brand text-primary-foreground hover:opacity-90">
              Create your account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </section>

      <Footer />
      
    </div>
  );
}
