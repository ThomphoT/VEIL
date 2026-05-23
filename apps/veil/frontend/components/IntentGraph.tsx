"use client";

import { useEffect, useRef } from "react";
import type { AgentResult, Decision } from "@/lib/types";

type Node = { id: string; x: number; y: number; r: number };

const nodes: Node[] = [
  { id: "Customer", x: 0.13, y: 0.5, r: 18 },
  { id: "Device", x: 0.32, y: 0.25, r: 15 },
  { id: "Transaction", x: 0.5, y: 0.5, r: 22 },
  { id: "Recipient", x: 0.82, y: 0.5, r: 18 },
  { id: "Behavior", x: 0.34, y: 0.75, r: 12 },
  { id: "Intent", x: 0.58, y: 0.22, r: 12 },
  { id: "Compliance", x: 0.66, y: 0.78, r: 12 }
];

const edges = [
  ["Customer", "Transaction"],
  ["Device", "Transaction"],
  ["Transaction", "Recipient"],
  ["Behavior", "Transaction"],
  ["Intent", "Customer"],
  ["Compliance", "Recipient"],
  ["Intent", "Recipient"]
];

export function IntentGraph({ agents, decision }: { agents: AgentResult[]; decision: Decision }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let animationId = 0;
    const risk = agents.length ? agents.reduce((sum, agent) => sum + agent.score, 0) / agents.length : 20;
    const riskColor = risk >= 75 ? "#EF4444" : risk >= 45 ? "#F59E0B" : "#22D3EE";

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const resolve = (id: string) => nodes.find((node) => node.id === id)!;
      ctx.lineWidth = 1.4;

      edges.forEach(([from, to], index) => {
        const a = resolve(from);
        const b = resolve(to);
        const pulse = Math.sin(frame / 24 + index) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.moveTo(a.x * rect.width, a.y * rect.height);
        ctx.lineTo(b.x * rect.width, b.y * rect.height);
        ctx.strokeStyle = `${riskColor}${Math.floor(70 + pulse * 120).toString(16).padStart(2, "0")}`;
        ctx.shadowColor = riskColor;
        ctx.shadowBlur = 10 + pulse * 14;
        ctx.stroke();
      });

      nodes.forEach((node, index) => {
        const isRecipientRisk = decision === "ESCALATE" && node.id === "Recipient";
        const pulse = Math.sin(frame / 18 + index) * 0.5 + 0.5;
        const x = node.x * rect.width;
        const y = node.y * rect.height;
        const radius = node.r + pulse * (isRecipientRisk ? 6 : 3);

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isRecipientRisk ? "rgba(239, 68, 68, 0.25)" : "rgba(34, 211, 238, 0.16)";
        ctx.strokeStyle = isRecipientRisk ? "#EF4444" : "#22D3EE";
        ctx.shadowColor = isRecipientRisk ? "#EF4444" : "#22D3EE";
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#F8FAFC";
        ctx.font = "12px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(node.id, x, y + radius + 17);
      });

      frame += 1;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [agents, decision]);

  return (
    <div className="panel p-5">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-veil-cyan">Intent graph</p>
          <h2 className="mt-1 text-2xl font-semibold">Human-Money Trust Topology</h2>
        </div>
        <p className="text-sm text-veil-muted">{agents.length}/8 agents active</p>
      </div>
      <canvas ref={ref} className="h-[290px] w-full rounded-[22px] border border-veil-border bg-[#060a15]" />
    </div>
  );
}
