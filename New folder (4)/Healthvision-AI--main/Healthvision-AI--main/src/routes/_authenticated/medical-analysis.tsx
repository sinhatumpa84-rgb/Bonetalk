import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScanLine, Upload, Download, AlertTriangle, FileSearch } from "lucide-react";
import {
  createScanUpload,
  analyzeMedicalImage,
} from "@/lib/medical-analysis.functions";
import { supabase } from "@/integrations/supabase/client";
import { generateReportPDF } from "@/lib/pdf-report";

export const Route = createFileRoute("/_authenticated/medical-analysis")({
  head: () => ({ meta: [{ title: "Medical Image Analysis — HealthVision AI" }] }),
  component: MedicalAnalysisPage,
});

const TYPES = [
  { v: "xray", l: "X-Ray" },
  { v: "ct", l: "CT Scan" },
  { v: "mri", l: "MRI Scan" },
  { v: "skin", l: "Skin Photo / Plate" },
  { v: "other", l: "Other" },
];

type Result = {
  findings: string[];
  impressions: string;
  cautions: string[];
  confidence: number;
  disclaimer: string;
};

function MedicalAnalysisPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanType, setScanType] = useState("xray");
  const [ctx, setCtx] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const createUpload = useServerFn(createScanUpload);
  const analyze = useServerFn(analyzeMedicalImage);

  const onFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 15 * 1024 * 1024) {
      toast.error("Max file size is 15 MB");
      return;
    }
    const ok = ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(f.type);
    if (!ok) {
      toast.error("Use JPG, PNG, WebP, or PDF");
      return;
    }
    setFile(f);
    setPreview(f.type === "application/pdf" ? null : URL.createObjectURL(f));
    setResult(null);
  };

  const mut = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file");
      const { path, token } = await createUpload({
        data: { fileName: file.name, contentType: file.type || "application/octet-stream" },
      });
      const { error: upErr } = await supabase.storage
        .from("medical-scans")
        .uploadToSignedUrl(path, token, file);
      if (upErr) throw new Error(upErr.message);
      return analyze({
        data: { path, scanType: scanType as any, context: ctx || undefined },
      });
    },
    onSuccess: (r) => setResult(r as Result),
    onError: (e: any) => {
      const msg = String(e?.message ?? "");
      if (msg.includes("RATE_LIMIT")) toast.error("Rate limit hit. Try again shortly.");
      else if (msg.includes("PAYMENT_REQUIRED")) toast.error("AI credits exhausted.");
      else toast.error("Analysis failed: " + msg);
    },
  });

  const download = () => {
    if (!result) return;
    const label = TYPES.find((t) => t.v === scanType)?.l ?? scanType;
    generateReportPDF({
      title: `${label} AI Analysis`,
      scanType: label,
      ...result,
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-brand flex items-center justify-center">
          <ScanLine className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Medical Image Analysis</h1>
          <p className="text-muted-foreground text-sm">
            Upload an X-ray, CT, MRI, or skin photo and get an AI-powered analysis.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6 bg-card/60 border-border">
          <div className="grid gap-4">
            <div>
              <Label>Scan type</Label>
              <Select value={scanType} onValueChange={setScanType}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t.v} value={t.v}>
                      {t.l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onFile(e.dataTransfer.files?.[0] ?? null);
              }}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="scan preview"
                  className="max-h-72 mx-auto rounded-lg object-contain"
                />
              ) : file && file.type === "application/pdf" ? (
                <div className="text-foreground py-6">
                  <FileSearch className="h-10 w-10 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF report ready — {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm">Drop scan or PDF report here, or click to browse</p>
                  <p className="text-xs mt-1">JPG, PNG, WebP, PDF — max 15 MB</p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div>
              <Label>Clinical context (optional)</Label>
              <Textarea
                value={ctx}
                onChange={(e) => setCtx(e.target.value)}
                placeholder="Patient age, symptoms, body region…"
                className="mt-2"
              />
            </div>

            <Button
              onClick={() => mut.mutate()}
              disabled={!file || mut.isPending}
              className="bg-gradient-brand text-primary-foreground hover:opacity-90"
            >
              {mut.isPending ? "Analyzing…" : "Run AI Analysis"}
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-card/60 border-border min-h-[400px]">
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <FileSearch className="h-12 w-12 text-primary/60 mb-3" />
              <p className="text-sm">Upload a scan and click "Run AI Analysis" to see results here.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-foreground">Analysis Result</h2>
                <span className="text-xs font-semibold rounded-full px-3 py-1 bg-primary/10 text-primary border border-primary/30">
                  Confidence {result.confidence}%
                </span>
              </div>

              <h3 className="mt-5 font-semibold text-foreground">Findings</h3>
              <ul className="mt-2 ml-5 list-disc text-sm space-y-1 text-foreground/90">
                {result.findings.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>

              <h3 className="mt-5 font-semibold text-foreground">Impressions</h3>
              <p className="mt-2 text-sm text-foreground/90">{result.impressions}</p>

              {result.cautions?.length > 0 && (
                <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                  <div className="flex items-center gap-2 text-amber-300 font-semibold">
                    <AlertTriangle className="h-4 w-4" /> Cautions
                  </div>
                  <ul className="mt-2 ml-5 list-disc text-sm text-amber-100/90 space-y-1">
                    {result.cautions.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="mt-5 text-xs italic text-muted-foreground">{result.disclaimer}</p>

              <Button
                onClick={download}
                variant="outline"
                className="mt-5 w-full border-primary/40 text-primary hover:bg-primary/10"
              >
                <Download className="h-4 w-4 mr-2" /> Download PDF Report
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
