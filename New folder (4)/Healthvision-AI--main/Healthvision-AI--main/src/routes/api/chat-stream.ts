import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const SYSTEM_PROMPT = `You are HealthVision AI, a friendly, careful health information assistant. Provide clear, well-formatted (Markdown) responses. Always remind users that your guidance is informational only and not a substitute for professional medical advice. For emergency symptoms recommend calling local emergency services immediately.`;

export const Route = createFileRoute("/api/chat-stream")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization");
        if (!auth?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = auth.slice(7);

        const SUPABASE_URL = process.env.SUPABASE_URL!;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
        const sb = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: claims, error } = await sb.auth.getClaims(token);
        if (error || !claims?.claims?.sub) {
          return new Response("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const messages = Array.isArray(body?.messages) ? body.messages : [];

        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            stream: true,
            messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
          }),
        });

        if (!upstream.ok) {
          if (upstream.status === 429) {
            return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
              status: 429,
              headers: { "Content-Type": "application/json" },
            });
          }
          if (upstream.status === 402) {
            return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }), {
              status: 402,
              headers: { "Content-Type": "application/json" },
            });
          }
          return new Response(JSON.stringify({ error: "AI gateway error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(upstream.body, {
          headers: { "Content-Type": "text/event-stream" },
        });
      },
    },
  },
});
