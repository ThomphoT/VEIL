'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Shield, CheckCircle, AlertTriangle, Ban, Eye } from 'lucide-react'
import type { AnalyzeResponse } from '@/lib/api'
import RiskGauge from './RiskGauge'
import DecisionBanner from './DecisionBanner'

interface Props {
  analysis: AnalyzeResponse | null
  loading: boolean
}

export default function RightPanel({ analysis, loading }: Props) {
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="glass-panel flex-1 p-5 flex flex-col items-center justify-center gap-4">
        <h2 className="text-xs font-semibold text-veil-muted uppercase tracking-wider self-start">Risk Assessment</h2>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-40 h-40 rounded-full border-4 border-veil-border border-t-veil-cyan animate-spin" />
              <p className="text-xs text-veil-muted animate-pulse">Analyzing...</p>
            </motion.div>
          ) : analysis ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 w-full"
            >
              <RiskGauge score={analysis.risk_score} />
              <DecisionBanner decision={analysis.decision} />
              <div className="w-full p-3 rounded-lg bg-white/5 border border-veil-border">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-veil-muted">Confidence</span>
                  <span className="text-sm font-mono text-veil-cyan">
                    {(analysis.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 w-full bg-veil-border rounded-full h-1.5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-veil-cyan to-veil-blue"
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.confidence * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <Shield size={40} className="text-veil-muted/30" />
              <p className="text-xs text-veil-muted/50 text-center">Awaiting analysis to display risk assessment</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {analysis && (
        <motion.div
          className="glass-panel p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-[10px] text-veil-muted uppercase tracking-wider mb-2">Agent Scores</h3>
          <div className="space-y-2">
            {analysis.agent_results.map((r, i) => (
              <motion.div
                key={r.agent}
                className="flex items-center justify-between"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="text-xs text-veil-muted truncate mr-2 max-w-[120px]">
                  {r.agent.replace(/_/g, ' ')}
                </span>
                <span className={`text-xs font-mono ${
                  r.score >= 70 ? 'risk-high' : r.score >= 40 ? 'risk-medium' : 'risk-low'
                }`}>
                  {r.score.toFixed(0)}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
