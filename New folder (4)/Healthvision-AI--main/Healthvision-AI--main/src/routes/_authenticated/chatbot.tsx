import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Trash2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  listChatMessages,
  saveChatExchange,
  clearChatHistory,
} from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/chatbot")({
  head: () => ({ meta: [{ title: "Health Chat — HealthVision AI" }] }),
  component: ChatbotPage,
});

const QUICK_PROMPTS = [
  "What causes migraines?",
  "Is a BP of 130/85 normal?",
  "Symptoms of dehydration",
  "When should I see a doctor for fever?",
];

type Msg = { role: "user" | "assistant"; content: string };

function ChatbotPage() {
  const qc = useQueryClient();
  const list = useServerFn(listChatMessages);
  const save = useServerFn(saveChatExchange);
  const clear = useServerFn(clearChatHistory);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [live, setLive] = useState<Msg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const history = useQuery({
    queryKey: ["chat-messages"],
    queryFn: () => list(),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [live, history.data]);

  const messages: Msg[] = [
    ...((history.data ?? []).map((m: any) => ({ role: m.role, content: m.content })) as Msg[]),
    ...live,
  ];

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || streaming) return;
    setDraft("");
    setStreaming(true);

    const userMsg: Msg = { role: "user", content };
    const ctxBefore: Msg[] = [...messages, userMsg];
    setLive((p) => [...p, userMsg, { role: "assistant", content: "" }]);

    let assistantSoFar = "";
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const resp = await fetch("/api/chat-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: ctxBefore }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Rate limit. Try again shortly.");
        else if (resp.status === 402) toast.error("AI credits exhausted.");
        else toast.error("Chat failed.");
        setLive((p) => p.slice(0, -2));
        return;
      }

      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += dec.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const p = JSON.parse(json);
            const delta = p?.choices?.[0]?.delta?.content;
            if (delta) {
              assistantSoFar += delta;
              setLive((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: assistantSoFar };
                return copy;
              });
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }

      if (assistantSoFar) {
        await save({ data: { user: content, assistant: assistantSoFar } });
        setLive([]);
        qc.invalidateQueries({ queryKey: ["chat-messages"] });
      }
    } catch (e: any) {
      toast.error("Chat failed: " + (e?.message ?? "unknown"));
      setLive((p) => p.slice(0, -2));
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-brand flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Health Chat</h1>
            <p className="text-xs text-muted-foreground">Ask anything about health, symptoms, or wellness.</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await clear();
              qc.invalidateQueries({ queryKey: ["chat-messages"] });
              toast.success("Chat cleared");
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      <Card className="bg-card/60 border-border flex flex-col h-[68vh]">
        <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <Sparkles className="h-10 w-10 text-primary mb-3" />
              <h3 className="text-lg font-semibold text-foreground">Ask a health question</h3>
              <p className="text-sm text-muted-foreground mt-1">Try one of the suggestions below to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      m.role === "user"
                        ? "bg-gradient-brand text-primary-foreground"
                        : "bg-card border border-border text-foreground"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none [&>*]:my-2">
                        <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border p-3 space-y-2">
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                disabled={streaming}
                className="text-xs rounded-full border border-border bg-card px-3 py-1 text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(draft);
                }
              }}
              placeholder="Ask about symptoms, medication, wellness…"
              className="min-h-[44px] resize-none"
            />
            <Button
              onClick={() => send(draft)}
              disabled={!draft.trim() || streaming}
              className="bg-gradient-brand text-primary-foreground hover:opacity-90 h-11"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
