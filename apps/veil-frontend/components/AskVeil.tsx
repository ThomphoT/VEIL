"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { askVeil } from "@/lib/api";

export function AskVeil({ transactionId, disabled }: { transactionId: string; disabled: boolean }) {
  const [question, setQuestion] = useState("Why should settlement pause right now?");
  const [answer, setAnswer] = useState("");
  const [typed, setTyped] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTyped("");
    if (!answer) return;
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(answer.slice(0, index));
      if (index >= answer.length) window.clearInterval(timer);
    }, 16);
    return () => window.clearInterval(timer);
  }, [answer]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!question.trim() || disabled) return;
    setLoading(true);
    try {
      setAnswer(await askVeil(question, transactionId));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-veil-cyan" />
        <h2 className="text-xl font-semibold">Ask VEIL</h2>
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          disabled={disabled}
          className="min-w-0 flex-1 rounded-[18px] border border-veil-border bg-[#050816] px-4 py-3 text-sm text-veil-text outline-none transition focus:border-veil-cyan"
        />
        <button
          type="submit"
          disabled={disabled || loading}
          className="grid h-12 w-12 place-items-center rounded-[18px] bg-veil-cyan text-[#04111b] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send question"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
      <motion.div initial={false} animate={{ opacity: typed ? 1 : 0.72 }} className="mt-4 min-h-28 rounded-[20px] border border-veil-border bg-[#070d1a] p-4 text-sm leading-6 text-veil-muted">
        {typed || "The voice agent becomes active after VEIL completes the governance analysis."}
      </motion.div>
    </div>
  );
}
