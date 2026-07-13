import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Activity,
  Droplet,
  Thermometer,
  Stethoscope,
  ScanLine,
  MessageCircle,
  Calendar,
  ArrowRight,
  Video,
  LineChart as LineChartIcon,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — HealthVision AI" },
      { name: "description", content: "Your personal health dashboard." },
    ],
  }),
  component: Dashboard,
});

const vitals = [
  { icon: Heart, label: "Heart Rate", value: "72", unit: "bpm", color: "text-rose-400" },
  { icon: Activity, label: "Blood Pressure", value: "120/80", unit: "mmHg", color: "text-primary" },
  { icon: Droplet, label: "Oxygen", value: "98", unit: "%", color: "text-sky-400" },
  { icon: Thermometer, label: "Temperature", value: "98.6", unit: "°F", color: "text-amber-400" },
];

const quickActions = [
  { to: "/symptom-checker", icon: Stethoscope, label: "Symptom Checker", desc: "Describe symptoms" },
  { to: "/medical-analysis", icon: ScanLine, label: "Medical Analysis", desc: "Upload a scan or report" },
  { to: "/vitals", icon: LineChartIcon, label: "Vitals Tracker", desc: "Log & trend your vitals" },
  { to: "/consult", icon: Video, label: "Live Consult", desc: "Talk to a doctor" },
  { to: "/chatbot", icon: MessageCircle, label: "Ask Assistant", desc: "Chat 24/7" },
  { to: "/appointments", icon: Calendar, label: "Appointments", desc: "Upcoming visits" },
] as const;

function Dashboard() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Welcome back</h1>
          <p className="mt-1 text-muted-foreground">Here's a snapshot of your health today.</p>
        </div>
      </div>

      {/* Vitals */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {vitals.map((v) => (
          <Card key={v.label} className="p-5 bg-card/60 border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{v.label}</span>
              <v.icon className={`h-5 w-5 ${v.color}`} />
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">{v.value}</span>
              <span className="text-xs text-muted-foreground">{v.unit}</span>
            </div>
            <div className="mt-1 text-xs text-emerald-400">Normal</div>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="mt-12 text-xl font-semibold text-foreground">Quick actions</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((a) => (
          <Link key={a.to} to={a.to}>
            <Card className="p-5 bg-card/60 border-border hover:border-primary/40 hover:shadow-glow transition-all cursor-pointer h-full">
              <div className="h-10 w-10 rounded-lg bg-gradient-brand flex items-center justify-center">
                <a.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mt-3 font-semibold text-foreground">{a.label}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{a.desc}</p>
              <div className="mt-3 inline-flex items-center text-xs text-primary">
                Open <ArrowRight className="ml-1 h-3 w-3" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* History placeholder */}
      <Card className="mt-12 p-8 bg-card/60 border-border text-center">
        <h3 className="text-lg font-semibold text-foreground">No diagnoses yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Run a symptom check or upload a scan to see results here.
        </p>
        <Link to="/symptom-checker" className="inline-block mt-4">
          <Button className="bg-gradient-brand text-primary-foreground hover:opacity-90">
            Start a health check
          </Button>
        </Link>
      </Card>
    </div>
  );
}
