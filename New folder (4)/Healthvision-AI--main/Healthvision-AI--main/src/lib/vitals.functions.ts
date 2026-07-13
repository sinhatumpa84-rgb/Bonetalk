import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAI, extractToolJSON } from "./ai.server";

const VitalsSchema = z.object({
  heart_rate: z.number().min(20).max(250).optional().nullable(),
  blood_pressure: z
    .string()
    .max(20)
    .regex(/^\d{2,3}\/\d{2,3}$/)
    .optional()
    .nullable(),
  oxygen: z.number().min(40).max(100).optional().nullable(),
  temperature: z.number().min(80).max(115).optional().nullable(),
});

export const addVitals = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => VitalsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error, data: row } = await supabase
      .from("vitals")
      .insert({
        user_id: userId,
        heart_rate: data.heart_rate ?? null,
        blood_pressure: data.blood_pressure ?? null,
        oxygen: data.oxygen ?? null,
        temperature: data.temperature ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listVitals = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("vitals")
      .select("id, heart_rate, blood_pressure, oxygen, temperature, recorded_at")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message);
    return (data ?? []).reverse();
  });

const summaryTool = {
  type: "function",
  function: {
    name: "vitals_summary",
    description: "Assess vitals and overall health status.",
    parameters: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["ok", "watch", "concern", "urgent"] },
        headline: { type: "string" },
        summary: { type: "string" },
        recommendations: { type: "array", items: { type: "string" } },
        flagged: { type: "array", items: { type: "string" } },
      },
      required: ["status", "headline", "summary", "recommendations", "flagged"],
      additionalProperties: false,
    },
  },
};

export const summarizeVitals = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("vitals")
      .select("heart_rate, blood_pressure, oxygen, temperature, recorded_at")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0)
      return {
        status: "ok",
        headline: "No readings yet",
        summary: "Add at least one vitals reading to receive an AI assessment.",
        recommendations: ["Log heart rate, blood pressure, oxygen, and temperature."],
        flagged: [],
      };

    const lines = data
      .reverse()
      .map(
        (r) =>
          `${new Date(r.recorded_at).toLocaleString()} | HR ${r.heart_rate ?? "-"} bpm | BP ${r.blood_pressure ?? "-"} | SpO₂ ${r.oxygen ?? "-"}% | Temp ${r.temperature ?? "-"} °F`,
      )
      .join("\n");

    const res = await callAI({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You are a triage assistant. Given recent vitals, classify overall status as ok/watch/concern/urgent. Be conservative and recommend seeing a doctor when readings are abnormal. Not a substitute for medical advice.",
        },
        {
          role: "user",
          content: `Recent vitals (oldest → newest):\n${lines}\n\nAssess trend and current status.`,
        },
      ],
      tools: [summaryTool],
      tool_choice: { type: "function", function: { name: "vitals_summary" } },
    });
    const parsed = extractToolJSON(res);
    if (!parsed) throw new Error("AI did not return a summary");
    return parsed;
  });
