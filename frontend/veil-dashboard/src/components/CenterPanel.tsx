'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, CheckCircle, AlertTriangle, XCircle, Loader2, Activity } from 'lucide-react'
import type { AnalyzeResponse } from '@/lib/api'

interface AgentUpdate {
  agent: string
  status: string
  score?: number
}

interface Props {
  agentUpdates: AgentUpdate[]
  analysis: AnalyzeResponse | null
  loading: boolean
}

const AGENT_LABELS: Record<string, string> = {
  behavioral_agent: 'Behavioral Analysis',
  device_agent: 'Device Trust',
  fraud_agent: 'Fraud Detection',
  intent_agent: 'Intent Analysis',
  compliance_agent: 'Compliance Check',
  behavioral_agent_gemini: 'Behavioral (Gemini)',
  fraud_agent_gemini: 'Fraud (Gemini)',
  fraud_agent_featherless: 'Fraud (Featherless)',
}

function getAgentIcon(status: string) {
  switch (status) {
    case 'complete': return CheckCircle
    case 'error': return XCircle
    case 'running': return Loader2
    default: return Activity
  }
}

function getAgentColor(status: string) {
  switch (status) {
    case 'complete': return 'text-veil-success'
    case 'error': return 'text-veil-danger'
    case 'running': return 'text-veil-cyan'
    default: return 'text-veil-muted'
  }
}

export default function CenterPanel({ agentUpdates, analysis, loading }: Props) {
  const feedRef = useRef<HTMLDivElement>(null)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    if (loading) {
      setLogs(prev => [...prev, '🚀 VEIL orchestrator initializing swarm analysis...'])
    }
  }, [loading])

  useEffect(() => {
    if (agentUpdates.length > 0) {
      const newLogs = agentUpdates.map(u => {
        const label = AGENT_LABELS[u.agent] || u.agent
        if (u.status === 'complete') {
          return `✓ ${label} — score: ${u.score?.toFixed(1) ?? 'N/A'}`
        }
        return `⋯ ${label} — analyzing...`
      })
      setLogs(prev => [...prev, ...newLogs])
    }
  }, [agentUpdates])

  useEffect(() => {
    if (analysis) {
      setLogs(prev => [
        ...prev,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `📊 Final Decision: ${analysis.decision}`,
        `📈 Risk Score: ${analysis.risk_score.toFixed(1)}`,
        `🎯 Confidence: ${(analysis.confidence * 100).toFixed(1)}%`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ])
    }
  }, [analysis])

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="glass-panel h-full p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-veil-cyan" />
          <h2 className="text-xs font-semibold text-veil-muted uppercase tracking-wider">Agent Activity Feed</h2>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-veil-cyan text-xs">
            <Loader2 size={12} className="animate-spin" />
            <span>Swarm analyzing...</span>
          </div>
        )}
      </div>

      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto font-mono text-xs space-y-1.5"
        style={{ maxHeight: '100%' }}
      >
        <AnimatePresence>
          {logs.length === 0 && !loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-veil-muted/50 text-center pt-8"
            >
              Awaiting transaction analysis...
            </motion.p>
          )}
          {logs.map((log, i) => (
            <motion.div
              key={`${log}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-2 rounded ${
                log.includes('Decision')
                  ? 'bg-veil-cyan/10 text-veil-cyan'
                  : log.includes('Final')
                  ? 'bg-white/5 text-veil-text'
                  : 'text-veil-muted'
              }`}
            >
              {log}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-veil-cyan p-2"
          >
            <span className="animate-pulse">●</span>
            <span>Processing...</span>
          </motion.div>
        )}
      </div>

      {analysis && (
        <motion.div
          className="mt-4 p-3 rounded-xl bg-gradient-to-r from-veil-blue/10 to-veil-cyan/5 border border-veil-border"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-[10px] text-veil-muted uppercase tracking-wider mb-1">Orchestrator Summary</p>
          <p className="text-xs text-veil-text/80 leading-relaxed line-clamp-3">
            {analysis.explanation}
          </p>
        </motion.div>
      )}
    </div>
  )
}
