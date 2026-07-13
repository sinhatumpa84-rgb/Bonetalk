import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScanLine, Download, ImageIcon, AlertTriangle, ExternalLink, Eye } from "lucide-react";
import { listDiagnoses, getScanSignedUrl } from "@/lib/diagnoses.functions";
import { generateReportPDF } from "@/lib/pdf-report";
import { useI18n } from "@/contexts/i18n";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/scans")({
  head: () => ({ meta: [{ title: "Scans Gallery — HealthVision AI" }] }),
  component: ScansGalleryPage,
});

const SCAN_LABEL: Record<string, string> = {
  xray: "X-Ray",
  ct: "CT Scan",
  mri: "MRI Scan",
  skin: "Skin Photo",
  other: "Other",
};

function ScansGalleryPage() {
  const { t } = useI18n();
  const list = useServerFn(listDiagnoses);
  const getUrl = useServerFn(getScanSignedUrl);
  const { data, isLoading } = useQuery({
    queryKey: ["diagnoses", "image_analysis"],
    queryFn: () => list({ data: { type: "image_analysis" } }),
  });

  const [urls, setUrls] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<any | null>(null);

  useEffect(() => {
    if (!data) return;
    const missing = data.filter((d: any) => d.result_json?.path && !urls[d.id]);
    if (missing.length === 0) return;
    Promise.all(
      missing.map(async (d: any) => {
        try {
          const { url } = await getUrl({ data: { path: d.result_json.path } });
          return [d.id, url] as const;
        } catch {
          return [d.id, ""] as const;
        }
      }),
    ).then((pairs) => {
      setUrls((prev) => {
        const next = { ...prev };
        for (const [id, url] of pairs) if (url) next[id] = url;
        return next;
      });
    });
  }, [data]);

  const download = (d: any) => {
    const r = d.result_json;
    const label = SCAN_LABEL[r?.scanType] ?? "Medical scan";
    generateReportPDF({
      title: `${label} AI Analysis`,
      scanType: label,
      findings: r.findings ?? [],
      impressions: r.impressions ?? "",
      cautions: r.cautions ?? [],
      confidence: r.confidence ?? 0,
      disclaimer: r.disclaimer ?? "",
      createdAt: new Date(d.created_at),
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-brand flex items-center justify-center">
          <ScanLine className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("scans.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("scans.subtitle")}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-10 text-center text-muted-foreground">{t("common.loading")}</div>
      ) : !data || data.length === 0 ? (
        <Card className="mt-10 p-10 text-center bg-card/60 border-border">
          <ImageIcon className="h-10 w-10 mx-auto text-primary/60" />
          <p className="mt-3 text-muted-foreground">{t("scans.empty")}</p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((d: any) => {
            const r = d.result_json ?? {};
            const label = SCAN_LABEL[r.scanType] ?? "Scan";
            const url = urls[d.id];
            return (
              <Card key={d.id} className="overflow-hidden bg-card/60 border-border flex flex-col">
                <button
                  type="button"
                  onClick={() => setOpen({ ...d, _url: url })}
                  className="aspect-video bg-muted flex items-center justify-center overflow-hidden cursor-pointer"
                >
                  {url ? (
                    <img src={url} alt={label} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  )}
                </button>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs uppercase tracking-wide text-primary font-semibold">
                      {label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(d.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                  {r.impressions && (
                    <p className="mt-2 text-sm text-foreground/90 line-clamp-3">{r.impressions}</p>
                  )}
                  {r.cautions?.length > 0 && (
                    <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-300">
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{r.cautions[0]}</span>
                    </div>
                  )}
                  <div className="mt-3 text-xs text-muted-foreground">
                    {t("common.confidence")}: {r.confidence ?? 0}%
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={() => setOpen({ ...d, _url: url })}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-primary/40 text-primary hover:bg-primary/10"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {t("scans.view")}
                    </Button>
                    <Button
                      onClick={() => download(d)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-primary/40 text-primary hover:bg-primary/10"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {t("scans.download")}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {open && (() => {
            const r = open.result_json ?? {};
            const label = SCAN_LABEL[r.scanType] ?? "Scan";
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 flex-wrap">
                    <span>{label} — AI Analysis</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {format(new Date(open.created_at), "PPpp")}
                    </span>
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-2 grid gap-6 md:grid-cols-2">
                  <div>
                    {open._url ? (
                      <a href={open._url} target="_blank" rel="noreferrer" className="block group">
                        <img
                          src={open._url}
                          alt={label}
                          className="w-full rounded-lg border border-border"
                        />
                        <span className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
                          <ExternalLink className="h-3 w-3" /> {t("scans.fullImage")}
                        </span>
                      </a>
                    ) : (
                      <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    <div className="mt-3 text-xs text-muted-foreground">
                      {t("common.confidence")}: {r.confidence ?? 0}%
                    </div>
                  </div>
                  <div className="space-y-4">
                    {r.findings?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground">{t("scans.findings")}</h3>
                        <ul className="mt-2 ml-5 list-disc text-sm text-foreground/90 space-y-1">
                          {r.findings.map((f: string, i: number) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {r.impressions && (
                      <div>
                        <h3 className="font-semibold text-foreground">{t("scans.impressions")}</h3>
                        <p className="mt-2 text-sm text-foreground/90">{r.impressions}</p>
                      </div>
                    )}
                    {r.cautions?.length > 0 && (
                      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                        <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
                          <AlertTriangle className="h-4 w-4" /> {t("scans.cautions")}
                        </div>
                        <ul className="mt-2 ml-5 list-disc text-sm text-amber-200/90 space-y-1">
                          {r.cautions.map((c: string, i: number) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {r.disclaimer && (
                      <p className="text-xs italic text-muted-foreground">{r.disclaimer}</p>
                    )}
                    <Button
                      onClick={() => download(open)}
                      className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t("scans.download")}
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
