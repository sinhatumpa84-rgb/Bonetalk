import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAI, extractToolJSON } from "./ai.server";

const UploadSchema = z.object({
  fileName: z.string().min(1).max(200),
  contentType: z.string().min(1).max(100),
});

export const createScanUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UploadSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const safe = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${userId}/${Date.now()}_${safe}`;
    const { data: signed, error } = await supabase.storage
      .from("medical-scans")
      .createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    return { path, token: signed.token, signedUrl: signed.signedUrl };
  });

const AnalyzeSchema = z.object({
  path: z.string().min(1),
  scanType: z.enum(["xray", "ct", "mri", "skin", "other"]),
  context: z.string().max(2000).optional(),
});

const tool = {
  type: "function",
  function: {
    name: "report_analysis",
    description: "Structured medical image analysis result.",
    parameters: {
      type: "object",
      properties: {
        findings: { type: "array", items: { type: "string" } },
        impressions: { type: "string" },
        cautions: { type: "array", items: { type: "string" } },
        confidence: { type: "number" },
        disclaimer: { type: "string" },
      },
      required: ["findings", "impressions", "cautions", "confidence", "disclaimer"],
      additionalProperties: false,
    },
  },
};

const SCAN_LABEL: Record<string, string> = {
  xray: "X-Ray",
  ct: "CT Scan",
  mri: "MRI Scan",
  skin: "Skin / Dermatology image",
  other: "Medical image",
};

export const analyzeMedicalImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AnalyzeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Download bytes server-side so we can inline PDFs as data URIs (gateway-friendly)
    const { data: blob, error: dErr } = await supabase.storage
      .from("medical-scans")
      .download(data.path);
    if (dErr || !blob) throw new Error(dErr?.message ?? "Cannot read scan");
    const buf = Buffer.from(await blob.arrayBuffer());
    const mime = blob.type || "application/octet-stream";
    const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;

    const res = await callAI({
      model: "google/gemini-2.5-pro",
      messages: [
        {
          role: "system",
          content:
            "You are an AI medical imaging assistant. You are not a radiologist. Provide preliminary observations only. Always include a strong disclaimer to consult a qualified physician.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${SCAN_LABEL[data.scanType]} analysis request.${data.context ? "\nClinical context: " + data.context : ""}\n\nList findings, give an overall impression, list cautions, and rate confidence 0-100.`,
            },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: "report_analysis" } },
    });

    const parsed = extractToolJSON(res);
    if (!parsed) throw new Error("AI did not return structured output");

    await supabase.from("diagnoses").insert({
      user_id: userId,
      type: "image_analysis",
      title: `${SCAN_LABEL[data.scanType]} analysis`,
      input_text: data.context ?? null,
      result_json: { ...parsed, scanType: data.scanType, path: data.path },
      confidence: parsed.confidence ?? null,
    });

    return parsed;
  });
