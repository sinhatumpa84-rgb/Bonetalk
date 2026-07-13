import { jsPDF } from "jspdf";

type Opts = {
  title: string;
  scanType: string;
  findings: string[];
  impressions: string;
  cautions: string[];
  confidence: number;
  disclaimer: string;
  createdAt?: Date;
  patientName?: string;
};

export function generateReportPDF(opts: Opts) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = margin;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(14, 165, 164);
  doc.text("HealthVision AI", margin, y);
  y += 8;
  doc.setDrawColor(14, 165, 164);
  doc.setLineWidth(1);
  doc.line(margin, y, pageW - margin, y);
  y += 24;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text(opts.title, margin, y);
  y += 18;

  // Meta
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  const date = (opts.createdAt ?? new Date()).toLocaleString();
  doc.text(`Scan type: ${opts.scanType}`, margin, y);
  doc.text(`Date: ${date}`, pageW - margin, y, { align: "right" });
  y += 14;
  if (opts.patientName) {
    doc.text(`Patient: ${opts.patientName}`, margin, y);
    y += 14;
  }
  doc.text(`Confidence: ${Math.round(opts.confidence)}%`, margin, y);
  y += 22;

  const writeSection = (label: string, body: () => void) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(14, 165, 164);
    doc.text(label, margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(40, 40, 40);
    body();
    y += 10;
  };

  const wrap = (text: string, indent = 0) => {
    const lines = doc.splitTextToSize(text, pageW - margin * 2 - indent);
    for (const line of lines) {
      if (y > 760) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin + indent, y);
      y += 14;
    }
  };

  writeSection("Findings", () => {
    opts.findings.forEach((f) => wrap("• " + f));
  });

  writeSection("Impressions", () => {
    wrap(opts.impressions);
  });

  if (opts.cautions?.length) {
    writeSection("Cautions", () => {
      doc.setTextColor(180, 83, 9);
      opts.cautions.forEach((c) => wrap("• " + c));
      doc.setTextColor(40, 40, 40);
    });
  }

  // Disclaimer
  y += 6;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageW - margin, y);
  y += 14;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  wrap(opts.disclaimer);

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("HealthVision AI — Informational only, not medical advice", margin, 820);

  doc.save(`healthvision-report-${Date.now()}.pdf`);
}
