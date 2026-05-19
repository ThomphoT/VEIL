"use client";

import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, ShieldQuestion, ShieldX } from "lucide-react";
import type { Decision } from "@/lib/types";

const styles: Record<Decision, { color: string; glow: string; Icon: typeof ShieldAlert }> = {
  APPROVE: { color: "text-veil-success border-veil-success/50", glow: "shadow-[0_0_36px_rgba(16,185,129,0.24)]", Icon: ShieldCheck },
  HOLD: { color: "text-veil-warning border-veil-warning/50", glow: "shadow-[0_0_36px_rgba(245,158,11,0.24)]", Icon: ShieldQuestion },
  ESCALATE: { color: "text-veil-danger border-veil-danger/60", glow: "shadow-danger animate-pulse", Icon: ShieldX },
  VERIFY: { color: "text-veil-cyan border-veil-cyan/60", glow: "shadow-cyan animate-edgePulse", Icon: ShieldAlert }
};

export function DecisionBanner({ decision, confidence }: { decision: Decision; confidence: number }) {
  const state = styles[decision];
  const Icon = state.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`rounded-[24px] border bg-veil-panel/80 p-5 ${state.color} ${state.glow}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-7 w-7" />
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-veil-muted">Orchestrator decision</p>
          <h2 className="text-4xl font-semibold tracking-normal">{decision}</h2>
        </div>
      </div>
      <div className="mt-4 h-2 rounded-full bg-slate-900">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-current"
        />
      </div>
      <p className="mt-2 text-sm text-veil-muted">{confidence}% orchestration confidence</p>
    </motion.div>
  );
}
