import { jsPDF } from "jspdf";

export function generateSymptomPDF(opts: {
  title?: string;
  summary?: string;
  riskLevel?: string;
  redFlags?: string[];
  possibleConditions?: { name: string; likelihood?: number; description?: string }[];
  nextSteps?: string[];
  disclaimer?: string;
  createdAt?: Date;
}) {
  const doc = new jsPDF();
  const margin = 16;
  let y = margin;
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(45, 212, 191);
  doc.rect(0, 0, pageWidth, 24, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("HealthVision AI — Symptom Check", margin, 15);

  y = 36;
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(13);
  doc.text(opts.title || "Symptom assessment", margin, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`Generated: ${(opts.createdAt ?? new Date()).toLocaleString()}`, margin, y);
  y += 5;
  if (opts.riskLevel) {
    doc.text(`Risk level: ${opts.riskLevel.toUpperCase()}`, margin, y);
    y += 5;
  }
  y += 5;

  const section = (label: string) => {
    if (y > 260) {
      doc.addPage();
      y = margin;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(label, margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
  };

  const writeWrapped = (text: string) => {
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    for (const line of lines) {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 5;
    }
  };

  if (opts.summary) {
    section("Summary");
    writeWrapped(opts.summary);
    y += 4;
  }

  if (opts.redFlags && opts.redFlags.length > 0) {
    section("Red flags");
    opts.redFlags.forEach((r) => writeWrapped(`• ${r}`));
    y += 4;
  }

  if (opts.possibleConditions && opts.possibleConditions.length > 0) {
    section("Possible conditions");
    opts.possibleConditions.forEach((c, i) => {
      writeWrapped(
        `${i + 1}. ${c.name}${c.likelihood != null ? ` — ${c.likelihood}%` : ""}`,
      );
      if (c.description) writeWrapped(`   ${c.description}`);
    });
    y += 4;
  }

  if (opts.nextSteps && opts.nextSteps.length > 0) {
    section("Recommended next steps");
    opts.nextSteps.forEach((s) => writeWrapped(`• ${s}`));
    y += 6;
  }

  if (opts.disclaimer) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    writeWrapped(opts.disclaimer);
  }

  doc.save(`healthvision-symptom-${Date.now()}.pdf`);
}
