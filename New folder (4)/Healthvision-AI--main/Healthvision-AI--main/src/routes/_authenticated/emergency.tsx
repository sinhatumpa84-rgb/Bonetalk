import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Phone, Search, ShieldAlert, MapPin } from "lucide-react";
import { NATIONAL, STATES } from "@/lib/emergency-data";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency — HealthVision AI" },
      { name: "description", content: "India statewise emergency helplines." },
    ],
  }),
  component: EmergencyPage,
});

function EmergencyPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return STATES;
    return STATES.filter((s) => s.name.toLowerCase().includes(t));
  }, [q]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-destructive" />
            Emergency
          </h1>
          <p className="mt-1 text-muted-foreground">
            Tap any number to call instantly. Stay calm and describe your location clearly.
          </p>
        </div>
        <Link to="/nearby">
          <Button variant="outline" className="gap-2">
            <MapPin className="h-4 w-4" /> Find nearby services
          </Button>
        </Link>
      </div>

      {/* PAN-INDIA */}
      <a
        href="tel:112"
        className="mt-6 flex items-center justify-between rounded-xl bg-destructive/10 border border-destructive/30 px-5 py-4 hover:bg-destructive/15 transition"
      >
        <div>
          <div className="text-xs font-semibold text-destructive">PAN-INDIA EMERGENCY</div>
          <div className="text-foreground font-bold text-lg">
            All Services · Police · Fire · Medical
          </div>
        </div>
        <Badge className="bg-destructive text-destructive-foreground text-lg px-4 py-1.5">
          112
        </Badge>
      </a>

      {/* National */}
      <h2 className="mt-8 text-lg font-semibold text-foreground">National helplines</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {NATIONAL.map((h) => (
          <a
            key={h.label}
            href={`tel:${h.number}`}
            className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 hover:border-primary/40 hover:bg-primary/5 transition"
          >
            <span className="text-sm text-muted-foreground truncate pr-2">{h.label}</span>
            <span className="text-sm font-bold text-primary inline-flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {h.number}
            </span>
          </a>
        ))}
      </div>

      {/* States */}
      <div className="mt-10 flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold text-foreground">By state / UT</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search state…"
            className="pl-8"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <Card key={s.name} className="p-4 bg-card/60 border-border">
            <h3 className="font-semibold text-foreground">{s.name}</h3>
            <div className="mt-3 space-y-1.5">
              {s.lines.map((h) => (
                <a
                  key={h.label + h.number}
                  href={`tel:${h.number}`}
                  className="flex items-center justify-between rounded-md bg-muted/30 px-2.5 py-1.5 hover:bg-primary/10"
                >
                  <span className="text-xs text-muted-foreground truncate pr-2">{h.label}</span>
                  <span className="text-xs font-semibold text-primary">{h.number}</span>
                </a>
              ))}
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full p-8 text-center text-sm text-muted-foreground">
            No matches.
          </div>
        )}
      </div>
    </div>
  );
}
