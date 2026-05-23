import type { AnalysisResult, StreamEvent, Transaction } from "./types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export async function getMockTransaction(): Promise<Transaction> {
  const response = await fetch(`${API_URL}/api/transaction/mock`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load mock transaction");
  return response.json();
}

export async function askVeil(question: string, transactionId: string): Promise<string> {
  const response = await fetch(`${API_URL}/api/voice-query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, transaction_id: transactionId })
  });
  if (!response.ok) throw new Error("VEIL voice agent failed");
  const payload = await response.json();
  return payload.answer;
}

export async function streamDemo(onEvent: (event: StreamEvent) => void): Promise<AnalysisResult | null> {
  const response = await fetch(`${API_URL}/api/demo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });

  if (!response.ok || !response.body) {
    throw new Error("SSE stream failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalAnalysis: AnalysisResult | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const line = frame.split("\n").find((item) => item.startsWith("data: "));
      if (!line) continue;
      const event = JSON.parse(line.slice(6)) as StreamEvent;
      onEvent(event);
      if (event.type === "complete") finalAnalysis = event.analysis;
    }
  }

  return finalAnalysis;
}
