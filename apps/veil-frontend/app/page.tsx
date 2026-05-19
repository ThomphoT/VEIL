"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Fingerprint, Globe2, Play, UserRound, WalletCards } from "lucide-react";
import { ActivityFeed } from "@/components/ActivityFeed";
import { AskVeil } from "@/components/AskVeil";
import { DecisionBanner } from "@/components/DecisionBanner";
import { IntentGraph } from "@/components/IntentGraph";
import { RiskGauge } from "@/components/RiskGauge";
import { getMockTransaction, streamDemo } from "@/lib/api";
import type { AgentResult, AnalysisResult, Decision, Transaction } from "@/lib/types";

const fallbackDecision: Decision = "VERIFY";

export default function Home() {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [agents, setAgents] = useState<AgentResult[]>([]);
  const [activeAgent, setActiveAgent] = useState<string>();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    getMockTransaction().then(setTransaction).catch(() => undefined);
  }, []);

  const risk = useMemo(() => analysis?.risk_score ?? (agents.length ? agents.reduce((sum, agent) => sum + agent.score, 0) / agents.length : 18), [agents, analysis]);
  const decision = analysis?.decision ?? fallbackDecision;

  async function runDemo() {
    setAgents([]);
    setAnalysis(null);
    setRunning(true);
    try {
      await streamDemo((event) => {
        if (event.type === "transaction") setTransaction(event.transaction);
        if (event.type === "agent_start") setActiveAgent(event.agent);
        if (event.type === "agent_result") setAgents((current) => [event.result, ...current]);
        if (event.type === "orchestrator") setActiveAgent("orchestrator_agent");
        if (event.type === "complete") {
          setAnalysis(event.analysis);
          setActiveAgent(undefined);
        }
      });
    } finally {
      setRunning(false);
      setActiveAgent(undefined);
    }
  }

  return (
    <main className="min-h-screen px-4 py-5 text-veil-text md:px-6">
      <header className="mb-5 flex flex-col gap-4 rounded-[26px] border border-veil-border bg-[#050816]/70 px-5 py-4 shadow-cyan md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Image src="/veil.png" alt="VEIL mark" width={62} height={62} className="rounded-2xl" priority />
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-veil-cyan">Trust, before settlement.</p>
            <h1 className="text-3xl font-semibold tracking-normal">VEIL</h1>
            <p className="text-sm text-veil-muted">AI-native financial governance infrastructure for global finance.</p>
          </div>
        </div>
        <button
          onClick={runDemo}
          disabled={running}
          className="inline-flex items-center justify-center gap-2 rounded-[20px] bg-veil-cyan px-5 py-3 text-sm font-semibold text-[#04111b] shadow-cyan transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-70"
        >
          <Play className="h-4 w-4" />
          {running ? "Reasoning live" : "Run governance demo"}
        </button>
      </header>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.35fr_0.95fr]">
        <motion.aside initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="panel p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-veil-cyan">Settlement context</p>
          <h2 className="mt-1 text-2xl font-semibold">Transaction Intelligence</h2>
          {transaction && (
            <div className="mt-5 space-y-4">
              <Info icon={WalletCards} label="Transfer" value={`${transaction.currency} ${transaction.amount.toLocaleString()} to ${transaction.recipient}`} />
              <Info icon={UserRound} label="Customer" value={`${transaction.customer.name} | ${transaction.customer.segment}`} />
              <Info icon={Fingerprint} label="Device" value={`${transaction.device.trustLevel} | ${transaction.device.fingerprint}`} />
              <Info icon={Globe2} label="Geo" value={`${transaction.geo.originCountry} request via ${transaction.geo.ipCountry}`} />
              <div className="rounded-[20px] border border-veil-border bg-[#070d1a] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-veil-muted">Human baseline</p>
                <p className="mt-2 text-sm leading-6 text-veil-text">{transaction.customer.normalTransactionWindow}. Current channel: {transaction.channel}. Jurisdiction risk: {transaction.geo.jurisdictionRisk}.</p>
              </div>
            </div>
          )}
        </motion.aside>

        <ActivityFeed events={agents} activeAgent={activeAgent} />

        <motion.aside initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <div className="panel p-5">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.22em] text-veil-cyan">Risk computation</p>
              <p className="text-sm text-veil-muted">{agents.length}/8 signals</p>
            </div>
            <RiskGauge value={risk} />
          </div>
          <DecisionBanner decision={decision} confidence={analysis?.confidence ?? 64} />
          <div className="panel p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-veil-cyan">Explainability summary</p>
            <p className="mt-3 text-sm leading-6 text-veil-muted">{analysis?.narrative ?? "VEIL is awaiting the full swarm analysis before producing regulator-ready reasoning."}</p>
          </div>
        </motion.aside>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.95fr]">
        <IntentGraph agents={agents} decision={decision} />
        <AskVeil transactionId={transaction?.id ?? "mock-transaction"} disabled={!analysis} />
      </section>
    </main>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof WalletCards; label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-veil-border bg-[#070d1a] p-4">
      <div className="mb-2 flex items-center gap-2 text-veil-cyan">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className="text-sm leading-6 text-veil-text">{value}</p>
    </div>
  );
}
