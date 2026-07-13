import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAI, extractToolJSON } from "./ai.server";

const InputSchema = z.object({
  symptoms: z.array(z.string().min(1).max(80)).min(1).max(40),
  otherSymptoms: z.string().max(1000).optional(),
  age: z.number().int().min(0).max(120),
  sex: z.enum(["male", "female", "other"]),
  durationDays: z.number().int().min(0).max(365),
  severity: z.number().int().min(1).max(10),
});

const tool = {
  type: "function",
  function: {
    name: "report_assessment",
    description: "Return a structured symptom assessment.",
    parameters: {
      type: "object",
      properties: {
        risk_level: { type: "string", enum: ["low", "moderate", "high", "emergency"] },
        summary: { type: "string" },
        possible_conditions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              likelihood: { type: "number" },
              description: { type: "string" },
            },
            required: ["name", "likelihood", "description"],
            additionalProperties: false,
          },
        },
        recommended_next_steps: { type: "array", items: { type: "string" } },
        red_flags: { type: "array", items: { type: "string" } },
        disclaimer: { type: "string" },
      },
      required: [
        "risk_level",
        "summary",
        "possible_conditions",
        "recommended_next_steps",
        "red_flags",
        "disclaimer",
      ],
      additionalProperties: false,
    },
  },
};

export const assessSymptoms = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const prompt = `Patient context:
- Age: ${data.age}
- Sex: ${data.sex}
- Duration: ${data.durationDays} days
- Severity (1-10): ${data.severity}
- Symptoms: ${data.symptoms.join(", ")}
${data.otherSymptoms ? `- Additional notes: ${data.otherSymptoms}` : ""}

Assess. Return up to 5 possible conditions ranked by likelihood (0-100).
Always include a disclaimer that this is informational only and not a medical diagnosis.`;

    const res = await callAI({
      messages: [
        {
          role: "system",
          content:
            "You are a careful health information assistant. You are not a doctor. Provide structured triage information. For emergency symptoms (chest pain, stroke signs, severe bleeding, trouble breathing) always set risk_level to 'emergency'.",
        },
        { role: "user", content: prompt },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: "report_assessment" } },
    });

    const parsed = extractToolJSON(res);
    if (!parsed) throw new Error("AI did not return structured output");

    await supabase.from("diagnoses").insert({
      user_id: userId,
      type: "symptom_check",
      title: data.symptoms.slice(0, 3).join(", "),
      input_text: prompt,
      result_json: parsed,
      confidence: parsed.possible_conditions?.[0]?.likelihood ?? null,
    });

    return parsed;
  });
