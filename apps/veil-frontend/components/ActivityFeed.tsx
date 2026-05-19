"use client";

import { motion } from "framer-motion";
import { Activity, Cpu, RadioTower } from "lucide-react";
import type { AgentResult } from "@/lib/types";

function severity(score: number) {
  if (score >= 75) return "text-veil-danger border-veil-danger/40 bg-red-500/5";
  if (score >= 45) return "text-veil-warning border-veil-warning/40 bg-amber-500/5";
  return "text-veil-success border-veil-success/40 bg-emerald-500/5";
}

export function ActivityFeed({ events, activeAgent }: { events: AgentResult[]; activeAgent?: string }) {
  return (
    <div className="panel flex min-h-[560px] flex-col p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-veil-cyan">Swarm intelligence stream</p>
          <h2 className="mt-1 text-2xl font-semibold">Agent Reasoning</h2>
        </div>
        <RadioTower className="h-5 w-5 text-veil-cyan" />
      </div>

      <div className="thin-scrollbar flex-1 space-y-3 overflow-y-auto pr-1">
        {activeAgent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-[20px] border border-veil-cyan/40 bg-cyan-400/5 p-4 shadow-cyan">
            <div className="flex items-center gap-3 text-veil-cyan">
              <Cpu className="h-4 w-4 animate-pulse" />
              <span className="text-sm uppercase tracking-[0.18em]">{activeAgent}</span>
            </div>
            <p className="mt-2 text-sm text-veil-muted">Analyzing whether this transaction makes sense for this human, right now...</p>
          </motion.div>
        )}

        {events.map((event, index) => (
          <motion.div
            key={`${event.agent}-${index}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={`rounded-[20px] border p-4 ${severity(event.score)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 shrink-0" />
                  <p className="truncate text-sm font-semibold uppercase tracking-[0.14em]">{event.agent}</p>
                </div>
                <p className="mt-2 text-sm text-veil-text">{event.finding}</p>
                <p className="mt-1 text-xs text-veil-muted">{event.recommendation}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-2xl font-semibold">{event.score}</p>
                <p className="text-[11px] text-veil-muted">{event.confidence}% conf.</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
