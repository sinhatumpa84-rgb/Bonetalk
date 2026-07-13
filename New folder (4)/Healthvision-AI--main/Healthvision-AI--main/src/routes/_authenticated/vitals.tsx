import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Activity,
  Heart,
  Droplet,
  Thermometer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Siren,
} from "lucide-react";
import { addVitals, listVitals, summarizeVitals } from "@/lib/vitals.functions";

export const Route = createFileRoute("/_authenticated/vitals")({
  head: () => ({
    meta: [
      { title: "Vitals Tracker — HealthVision AI" },
      { name: "description", content: "Track vitals and get an AI health summary." },
    ],
  }),
  component: VitalsPage,
});

type Vital = {
  id: string;
  heart_rate: number | null;
  blood_pressure: string | null;
  oxygen: number | null;
  temperature: number | null;
  recorded_at: string;
};

type Summary = {
  status: "ok" | "watch" | "concern" | "urgent";
  headline: string;
  summary: string;
  recommendations: string[];
  flagged: string[];
};

const STATUS_STYLES: Record<Summary["status"], { color: string; bg: string; icon: any; label: string }> = {
  ok: { color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle2, label: "Healthy" },
  watch: { color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30", icon: AlertTriangle, label: "Monitor" },
  concern: { color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/30", icon: AlertTriangle, label: "Concern" },
  urgent: { color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", icon: Siren, label: "Urgent" },
};

function VitalsPage() {
  const qc = useQueryClient();
  const addFn = useServerFn(addVitals);
  const listFn = useServerFn(listVitals);
  const summarizeFn = useServerFn(summarizeVitals);

  const [hr, setHr] = useState("");
  const [bp, setBp] = useState("");
  const [spo2, setSpo2] = useState("");
  const [temp, setTemp] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);

  const list = useQuery({
    queryKey: ["vitals"],
    queryFn: () => listFn(),
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = {};
      if (hr) payload.heart_rate = Number(hr);
      if (bp) payload.blood_pressure = bp;
      if (spo2) payload.oxygen = Number(spo2);
      if (temp) payload.temperature = Number(temp);
      if (Object.keys(payload).length === 0) throw new Error("Enter at least one value");
      return addFn({ data: payload });
    },
    onSuccess: () => {
      toast.success("Reading saved");
      setHr(""); setBp(""); setSpo2(""); setTemp("");
      qc.invalidateQueries({ queryKey: ["vitals"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Could not save"),
  });

  const aiMut = useMutation({
    mutationFn: () => summarizeFn(),
    onSuccess: (r) => setSummary(r as Summary),
    onError: (e: any) => toast.error(e.message ?? "AI failed"),
  });

  const rows = (list.data as Vital[] | undefined) ?? [];
  const chartData = rows.map((r) => {
    const sys = r.blood_pressure?.split("/")[0];
    return {
      t: new Date(r.recorded_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      HR: r.heart_rate ?? null,
      SpO2: r.oxygen ?? null,
      "Temp °F": r.temperature ?? null,
      "BP (sys)": sys ? Number(sys) : null,
    };
  });

  const StatusIcon = summary ? STATUS_STYLES[summary.status].icon : Sparkles;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-brand flex items-center justify-center">
          <Activity className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vitals Tracker</h1>
          <p className="text-muted-foreground text-sm">
            Log heart rate, blood pressure, oxygen, and temperature. AI will summarise your trend.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Input card */}
        <Card className="p-6 bg-card/60 border-border h-fit">
          <h2 className="font-semibold text-foreground">Add a reading</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                <Heart className="h-3 w-3 text-rose-500" /> Heart rate (bpm)
              </Label>
              <Input
                inputMode="numeric"
                value={hr}
                onChange={(e) => setHr(e.target.value)}
                placeholder="72"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                <Activity className="h-3 w-3 text-primary" /> Blood pressure
              </Label>
              <Input
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                placeholder="120/80"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                <Droplet className="h-3 w-3 text-sky-500" /> SpO₂ (%)
              </Label>
              <Input
                inputMode="numeric"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                placeholder="98"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                <Thermometer className="h-3 w-3 text-amber-500" /> Temp (°F)
              </Label>
              <Input
                inputMode="decimal"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                placeholder="98.6"
                className="mt-1"
              />
            </div>
          </div>

          <Button
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="w-full mt-4 bg-gradient-brand text-primary-foreground hover:opacity-90"
          >
            {save.isPending ? "Saving…" : "Save reading"}
          </Button>

          <Button
            onClick={() => aiMut.mutate()}
            disabled={aiMut.isPending || rows.length === 0}
            variant="outline"
            className="w-full mt-2 border-primary/40 text-primary hover:bg-primary/10"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {aiMut.isPending ? "Analysing…" : "Generate AI health summary"}
          </Button>
        </Card>

        {/* Chart + summary */}
        <div className="space-y-6">
          <Card className="p-5 bg-card/60 border-border">
            <h2 className="font-semibold text-foreground">Trend</h2>
            {rows.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
                Add a reading to see your curve.
              </div>
            ) : (
              <div className="h-[280px] mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="t" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="HR" stroke="#f43f5e" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="BP (sys)" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="SpO2" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Temp °F" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {summary && (
            <Card className={`p-5 border ${STATUS_STYLES[summary.status].bg}`}>
              <div className="flex items-start gap-3">
                <StatusIcon className={`h-6 w-6 mt-0.5 ${STATUS_STYLES[summary.status].color}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-foreground">{summary.headline}</h3>
                    <Badge variant="outline" className={STATUS_STYLES[summary.status].color}>
                      {STATUS_STYLES[summary.status].label}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-foreground/90">{summary.summary}</p>
                  {summary.flagged.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-semibold text-foreground">Flagged</div>
                      <ul className="mt-1 ml-5 list-disc text-sm text-foreground/90">
                        {summary.flagged.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                  <div className="mt-3">
                    <div className="text-xs font-semibold text-foreground">Recommendations</div>
                    <ul className="mt-1 ml-5 list-disc text-sm text-foreground/90">
                      {summary.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
