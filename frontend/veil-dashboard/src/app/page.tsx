'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import LeftPanel from '@/components/LeftPanel'
import CenterPanel from '@/components/CenterPanel'
import RightPanel from '@/components/RightPanel'
import BottomPanel from '@/components/BottomPanel'
import { getMockTransaction, analyzeTransaction, runDemo, type Transaction, type AnalyzeResponse } from '@/lib/api'

export default function Dashboard() {
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agentUpdates, setAgentUpdates] = useState<{ agent: string; status: string; score?: number }[]>([])

  const fetchMockTransaction = useCallback(async () => {
    try {
      setError(null)
      setAnalysis(null)
      setAgentUpdates([])
      const txn = await getMockTransaction()
      setTransaction(txn)
      return txn
    } catch (e) {
      setError('Failed to fetch mock transaction')
      return null
    }
  }, [])

  const handleAnalyze = useCallback(async (txn?: Transaction) => {
    const target = txn || transaction
    if (!target) return
    setLoading(true)
    setAnalysis(null)
    setAgentUpdates([])
    try {
      const result = await analyzeTransaction(target)
      setAnalysis(result)
      const updates = result.agent_results.map(r => ({
        agent: r.agent,
        status: 'complete',
        score: r.score,
      }))
      setAgentUpdates(updates)
    } catch (e) {
      setError('Analysis failed')
    } finally {
      setLoading(false)
    }
  }, [transaction])

  const handleRunDemo = useCallback(async () => {
    setLoading(true)
    setError(null)
    setAnalysis(null)
    setAgentUpdates([])
    try {
      const result = await runDemo()
      setTransaction(result.transaction)
      setAnalysis({
        transaction_id: result.transaction.transaction_id,
        decision: result.decision,
        confidence: result.confidence,
        risk_score: result.risk_score,
        explanation: result.explanation,
        agent_results: result.agent_results,
      })
      const updates = result.agent_results.map(r => ({
        agent: r.agent,
        status: 'complete',
        score: r.score,
      }))
      setAgentUpdates(updates)
    } catch (e) {
      setError('Demo failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMockTransaction()
  }, [fetchMockTransaction])

  return (
    <div className="min-h-screen bg-veil-bg text-veil-text">
      <header className="border-b border-veil-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-veil-cyan to-veil-blue flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <h1 className="text-xl font-bold text-gradient">VEIL</h1>
          <span className="text-xs text-veil-muted ml-2">— governance infrastructure</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-veil-muted font-mono">v1.0.0</span>
          <div className="flex gap-2">
            <button
              onClick={() => fetchMockTransaction()}
              className="px-4 py-1.5 text-xs border border-veil-border rounded-lg text-veil-muted hover:border-veil-cyan hover:text-veil-cyan transition-all"
            >
              New Transaction
            </button>
            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !transaction}
              className="px-4 py-1.5 text-xs bg-gradient-to-r from-veil-cyan to-veil-blue rounded-lg text-white font-medium hover:opacity-90 transition-all disabled:opacity-30"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
            <button
              onClick={handleRunDemo}
              disabled={loading}
              className="px-4 py-1.5 text-xs border border-veil-cyan/30 rounded-lg text-veil-cyan hover:bg-veil-cyan/10 transition-all disabled:opacity-30"
            >
              Run Demo
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <main className="p-6 grid grid-cols-12 gap-4" style={{ height: 'calc(100vh - 73px)' }}>
        <motion.div
          className="col-span-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LeftPanel transaction={transaction} />
        </motion.div>

        <div className="col-span-6 flex flex-col gap-4">
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CenterPanel
              agentUpdates={agentUpdates}
              analysis={analysis}
              loading={loading}
            />
          </motion.div>
          <motion.div
            className="h-48"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <BottomPanel transaction={transaction} analysis={analysis} />
          </motion.div>
        </div>

        <motion.div
          className="col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <RightPanel analysis={analysis} loading={loading} />
        </motion.div>
      </main>
    </div>
  )
}
