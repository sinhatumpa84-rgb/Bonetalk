import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RiskBadge } from "@/components/RiskBadge";
import { Stethoscope, AlertTriangle, ListChecks, Activity } from "lucide-react";
import { assessSymptoms } from "@/lib/symptoms.functions";

export const Route = createFileRoute("/_authenticated/symptom-checker")({
  head: () => ({ meta: [{ title: "Symptom Checker — HealthVision AI" }] }),
  component: SymptomCheckerPage,
});

const SYMPTOM_GROUPS: Record<string, string[]> = {
  General: ["Fever", "Fatigue", "Chills", "Weight loss", "Loss of appetite", "Night sweats"],
  "Head & Neuro": ["Headache", "Dizziness", "Confusion", "Blurred vision", "Migraine"],
  Respiratory: ["Cough", "Shortness of breath", "Sore throat", "Runny nose", "Wheezing"],
  Cardiac: ["Chest pain", "Palpitations", "Swollen ankles"],
  Digestive: ["Nausea", "Vomiting", "Diarrhea", "Constipation", "Abdominal pain"],
  "Skin & Joints": ["Rash", "Itching", "Joint pain", "Muscle pain", "Back pain"],
};

type Result = {
  risk_level: string;
  summary: string;
  possible_conditions: { name: string; likelihood: number; description: string }[];
  recommended_next_steps: string[];
  red_flags: string[];
  disclaimer: string;
};

function SymptomCheckerPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [other, setOther] = useState("");
  const [age, setAge] = useState("30");
  const [sex, setSex] = useState<"male" | "female" | "other">("male");
  const [duration, setDuration] = useState("2");
  const [severity, setSeverity] = useState(5);
  const [result, setResult] = useState<Result | null>(null);

  const assess = useServerFn(assessSymptoms);
  const mut = useMutation({
    mutationFn: () =>
      assess({
        data: {
          symptoms: selected,
          otherSymptoms: other || undefined,
          age: parseInt(age, 10) || 0,
          sex,
          durationDays: parseInt(duration, 10) || 0,
          severity,
        },
      }),
    onSuccess: (r) => setResult(r as Result),
    onError: (e: any) => {
      const msg = String(e?.message ?? "");
      if (msg.includes("RATE_LIMIT")) toast.error("Rate limit hit. Please wait a moment.");
      else if (msg.includes("PAYMENT_REQUIRED")) toast.error("AI credits exhausted. Add credits in workspace settings.");
      else toast.error("Could not run assessment. Please try again.");
    },
  });

  const toggle = (s: string) =>
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-brand flex items-center justify-center">
          <Stethoscope className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Symptom Checker</h1>
          <p className="text-muted-foreground text-sm">
            Select your symptoms and get an instant AI-powered assessment.
          </p>
        </div>
      </div>

      <Card className="mt-8 p-6 bg-card/60 border-border">
        <h2 className="font-semibold text-foreground">Select your symptoms</h2>
        <div className="mt-4 space-y-4">
          {Object.entries(SYMPTOM_GROUPS).map(([group, items]) => (
            <div key={group}>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                {group}
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((s) => {
                  const active = selected.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggle(s)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        active
                          ? "bg-gradient-brand text-primary-foreground border-transparent"
                          : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Label htmlFor="other">Other symptoms (optional)</Label>
          <Textarea
            id="other"
            value={other}
            onChange={(e) => setOther(e.target.value)}
            placeholder="Describe anything else you're feeling…"
            className="mt-2"
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <div>
            <Label>Age</Label>
            <Input
              type="number"
              min={0}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Sex</Label>
            <Select value={sex} onValueChange={(v) => setSex(v as any)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Duration (days)</Label>
            <Input
              type="number"
              min={0}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Severity: {severity}/10</Label>
            <Slider
              value={[severity]}
              onValueChange={(v) => setSeverity(v[0])}
              min={1}
              max={10}
              step={1}
              className="mt-4"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            disabled={selected.length === 0 || mut.isPending}
            onClick={() => mut.mutate()}
            className="bg-gradient-brand text-primary-foreground hover:opacity-90"
          >
            {mut.isPending ? "Analyzing…" : "Run AI Assessment"}
          </Button>
        </div>
      </Card>

      {result && (
        <Card className="mt-6 p-6 bg-card/60 border-border">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-foreground">Assessment Result</h2>
              <p className="mt-1 text-sm text-muted-foreground">{result.summary}</p>
            </div>
            <RiskBadge level={result.risk_level} />
          </div>

          {result.red_flags?.length > 0 && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <div className="flex items-center gap-2 text-red-300 font-semibold">
                <AlertTriangle className="h-4 w-4" /> Red flags — seek urgent care
              </div>
              <ul className="mt-2 ml-6 list-disc text-sm text-red-200/90 space-y-1">
                {result.red_flags.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <Activity className="h-4 w-4 text-primary" /> Possible conditions
              </h3>
              <ul className="mt-3 space-y-2">
                {result.possible_conditions.map((c, i) => (
                  <li key={i} className="rounded-lg border border-border bg-card/40 p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">{c.name}</span>
                      <span className="text-xs text-primary font-semibold">{c.likelihood}%</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <ListChecks className="h-4 w-4 text-primary" /> Recommended next steps
              </h3>
              <ul className="mt-3 space-y-2">
                {result.recommended_next_steps.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-border bg-card/40 p-3 text-sm text-foreground"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-6 text-xs italic text-muted-foreground">{result.disclaimer}</p>
        </Card>
      )}
    </div>
  );
}
