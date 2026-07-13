import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { History, AlertTriangle, Activity, ListChecks, Download } from "lucide-react";
import { listDiagnoses } from "@/lib/diagnoses.functions";
import { RiskBadge } from "@/components/RiskBadge";
import { useI18n } from "@/contexts/i18n";
import { generateSymptomPDF } from "@/lib/symptom-pdf";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — HealthVision AI" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { t } = useI18n();
  const list = useServerFn(listDiagnoses);
  const { data, isLoading } = useQuery({
    queryKey: ["diagnoses", "symptom_check"],
    queryFn: () => list({ data: { type: "symptom_check" } }),
  });
  const [open, setOpen] = useState<any | null>(null);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-brand flex items-center justify-center">
          <History className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("history.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("history.subtitle")}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-10 text-center text-muted-foreground">{t("common.loading")}</div>
      ) : !data || data.length === 0 ? (
        <Card className="mt-10 p-10 text-center bg-card/60 border-border">
          <p className="text-muted-foreground">{t("history.empty")}</p>
        </Card>
      ) : (
        <div className="mt-8 space-y-3">
          {data.map((d: any) => {
            const r = d.result_json ?? {};
            const downloadPdf = () =>
              generateSymptomPDF({
                title: d.title || "Symptom check",
                summary: r.summary,
                riskLevel: r.risk_level,
                redFlags: r.red_flags ?? [],
                possibleConditions: r.possible_conditions ?? [],
                nextSteps: r.recommended_next_steps ?? [],
                disclaimer: r.disclaimer,
                createdAt: new Date(d.created_at),
              });
            return (
              <Card key={d.id} className="p-4 bg-card/60 border-border flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-foreground truncate">
                      {d.title || "Symptom check"}
                    </h3>
                    {r.risk_level && <RiskBadge level={r.risk_level} />}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {format(new Date(d.created_at), "MMM d, yyyy · h:mm a")}
                  </p>
                  {r.summary && (
                    <p className="mt-2 text-sm text-foreground/80 line-clamp-2">{r.summary}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadPdf}
                    className="border-primary/40 text-primary hover:bg-primary/10"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    {t("history.downloadPdf")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOpen(d)}
                    className="border-primary/40 text-primary hover:bg-primary/10"
                  >
                    {t("history.reopen")}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 flex-wrap">
                  <span>{open.title || "Symptom check"}</span>
                  {open.result_json?.risk_level && (
                    <RiskBadge level={open.result_json.risk_level} />
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">
                  {format(new Date(open.created_at), "PPpp")}
                </p>
                {open.result_json?.summary && (
                  <p className="mt-3 text-sm text-foreground/90">{open.result_json.summary}</p>
                )}

                {open.result_json?.red_flags?.length > 0 && (
                  <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                    <div className="flex items-center gap-2 text-red-300 font-semibold">
                      <AlertTriangle className="h-4 w-4" /> Red flags
                    </div>
                    <ul className="mt-2 ml-6 list-disc text-sm text-red-200/90 space-y-1">
                      {open.result_json.red_flags.map((r: string, i: number) => (
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
                      {(open.result_json?.possible_conditions ?? []).map((c: any, i: number) => (
                        <li key={i} className="rounded-lg border border-border bg-card/40 p-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-foreground">{c.name}</span>
                            <span className="text-xs text-primary font-semibold">
                              {c.likelihood}%
                            </span>
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
                      {(open.result_json?.recommended_next_steps ?? []).map(
                        (s: string, i: number) => (
                          <li
                            key={i}
                            className="rounded-lg border border-border bg-card/40 p-3 text-sm text-foreground"
                          >
                            {s}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>

                {open.result_json?.disclaimer && (
                  <p className="mt-6 text-xs italic text-muted-foreground">
                    {open.result_json.disclaimer}
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
