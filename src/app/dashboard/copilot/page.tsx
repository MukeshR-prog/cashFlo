"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AnomalyAlert } from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BrainCircuit, Send, Sparkles, TrendingDown, AlertTriangle, Database } from "lucide-react";

type DashboardMetrics = {
  monthlyBurn: number;
  predictedRunwayMonths: number;
};

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

async function getDashboardData<T>(userId: string, type: string): Promise<T> {
  const response = await fetch(
    `/api/dashboard-data?userId=${encodeURIComponent(userId)}&type=${encodeURIComponent(type)}`,
    { cache: "no-store" }
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load dashboard data");
  }

  return payload.data as T;
}

const suggestedQuestions = [
  "Why did marketing expenses increase last month?",
  "How much runway do we have right now and what threatens it most?",
  "Summarize our financial performance this quarter in plain language.",
];

export default function CopilotPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      try {
        const [a, m] = await Promise.all([
          getDashboardData<AnomalyAlert[]>(user.id, "alerts"),
          getDashboardData<DashboardMetrics>(user.id, "metrics"),
        ]);
        setAlerts(a);
        setMetrics(m);
      } catch (error) {
        console.error("Error loading Copilot Data:", error);
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [user]);

  useEffect(() => {
    if (!metrics) return;

    setChat([
      {
        role: "assistant",
        content:
          `Hi founder. I am tracking ${alerts.length} active anomaly signals and your current runway is ${metrics.predictedRunwayMonths} months. Ask anything about burn, collections, runway, or compliance risk.`,
      },
    ]);
  }, [metrics, alerts.length]);

  const canSend = useMemo(() => {
    return Boolean(user?.id && prompt.trim().length > 0 && !sending);
  }, [user?.id, prompt, sending]);

  const sendPrompt = async (messageToSend?: string) => {
    if (!user?.id) return;

    const question = (messageToSend ?? prompt).trim();
    if (!question) return;

    const nextUserMessage: ChatMessage = { role: "user", content: question };

    setChat((prev) => [...prev, nextUserMessage]);
    setPrompt("");
    setSending(true);

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          message: question,
          history: chat.slice(-6),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to get AI response");
      }

      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          content: payload.answer ?? "I could not generate a response right now.",
        },
      ]);
    } catch (error) {
      const fallback = error instanceof Error ? error.message : "Unable to fetch response";
      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I could not complete this analysis right now. ${fallback}`,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await sendPrompt();
  };

  if (loading) {
    return <CopilotSkeleton />;
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <Database size={48} className="text-muted-foreground mb-4" />
        <h2 className="text-2xl font-display font-medium">No Financial Data Found</h2>
        <p className="text-muted-foreground">Head back to the Command Center and click Seed Data first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-2xl font-display font-bold mb-1">Financial AI Assistant</h2>
        <p className="text-sm text-muted-foreground">Ask finance questions in plain English and get guided, data-backed answers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="space-y-4 overflow-y-auto pr-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-400" />
                Suggested Queries
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => sendPrompt(question)}
                  className="w-full text-left p-3 rounded-md bg-muted/35 border border-border text-sm hover:border-indigo-500/50 hover:bg-muted transition-colors"
                  disabled={sending}
                >
                  {question}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingDown size={16} className="text-red-400" />
                Active Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Current Runway</span>
                <span className="text-red-400 font-medium">{metrics.predictedRunwayMonths} Months</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500">Burn Rate</span>
                <span className="text-white">{formatINR(metrics.monthlyBurn)}/mo</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Active Anomalies</span>
                <span className="text-amber-400">{alerts.length} Detected</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="md:col-span-2 flex flex-col h-full">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="text-indigo-400" size={20} />
              Financial Intelligence
            </CardTitle>
            <CardDescription>Context-aware analysis across runway, collections, cap table, and compliance.</CardDescription>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {chat.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                    <BrainCircuit size={16} className="text-indigo-400" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3 text-sm leading-relaxed rounded-2xl ${
                    message.role === "assistant"
                      ? "rounded-tl-sm bg-muted border border-border"
                      : "rounded-tr-sm bg-primary text-primary-foreground"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {alerts.length > 0 && alerts[0].severity === "critical" && (
              <div className="pl-11">
                <div className="p-3 rounded-lg border border-red-900/50 bg-red-500/10 max-w-[85%]">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} className="text-red-400" />
                    <span className="text-xs font-semibold text-red-400">System Alert</span>
                  </div>
                  <p className="text-xs text-red-300">{alerts[0].description}</p>
                </div>
              </div>
            )}

            {sending && <TypingSkeletonBubble />}
          </CardContent>

          <form className="p-4 border-t border-border bg-muted/30 rounded-b-xl" onSubmit={handleSubmit}>
            <div className="relative">
              <Input
                placeholder="Ask about runway, burn, costs, collections, or compliance..."
                className="w-full pl-4 pr-12 py-6 rounded-xl focus-visible:ring-indigo-500/50"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={sending}
              />
              <Button
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-500 hover:bg-indigo-600 h-9 w-9 rounded-lg"
                type="submit"
                disabled={!canSend}
              >
                <Send size={16} />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

function TypingSkeletonBubble() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
        <BrainCircuit size={16} className="text-indigo-400" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-border bg-muted p-3 space-y-2">
        <Skeleton className="h-3 w-56" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  );
}

function CopilotSkeleton() {
  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="space-y-2">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-4 w-[34rem]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        </div>

        <Card className="md:col-span-2 flex flex-col h-full">
          <CardHeader>
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <TypingSkeletonBubble />
            <div className="flex justify-end">
              <Skeleton className="h-14 w-64 rounded-2xl" />
            </div>
            <TypingSkeletonBubble />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
