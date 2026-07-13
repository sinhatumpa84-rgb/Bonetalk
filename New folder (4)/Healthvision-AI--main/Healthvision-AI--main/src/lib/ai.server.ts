const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
};

export async function callAI(opts: {
  model?: string;
  messages: ChatMessage[];
  tools?: any[];
  tool_choice?: any;
}) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model ?? "google/gemini-3-flash-preview",
      messages: opts.messages,
      ...(opts.tools ? { tools: opts.tools, tool_choice: opts.tool_choice } : {}),
    }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("RATE_LIMIT");
    if (res.status === 402) throw new Error("PAYMENT_REQUIRED");
    throw new Error(`AI gateway error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export function extractToolJSON(response: any): any | null {
  const call = response?.choices?.[0]?.message?.tool_calls?.[0];
  if (!call?.function?.arguments) return null;
  try {
    return JSON.parse(call.function.arguments);
  } catch {
    return null;
  }
}
