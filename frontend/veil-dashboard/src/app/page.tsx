'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LeftPanel from '@/components/LeftPanel'
import CenterPanel from '@/components/CenterPanel'
import RightPanel from '@/components/RightPanel'
import BottomPanel from '@/components/BottomPanel'
import { getMockTransaction, analyzeTransaction, runDemo, type Transaction, type AnalyzeResponse } from '@/lib/api'

// ── Animation variants ───────────────────────────────────────────────────────
const STAGGER = {
  container: { animate: { transition: { staggerChildren: 0.08 } } },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
  },
}

const SLIDE_LEFT  = { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }
const SLIDE_RIGHT = { initial: { opacity: 0, x: 20  }, animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }
const SLIDE_UP    = { initial: { opacity: 0, y: 16  }, animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }

export default function Dashboard() {
  const [transaction, setTransaction]   = useState<Transaction | null>(null)
  const [analysis, setAnalysis]         = useState<AnalyzeResponse | null>(null)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [agentUpdates, setAgentUpdates] = useState<{ agent: string; status: string; score?: number }[]>([])
  const [ready, setReady]               = useState(false)

  // Delay dashboard reveal until after loading screen
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 4400)
    return () => clearTimeout(t)
  }, [])

  // ── Handlers (identical logic to original) ───────────────────────────────
  const fetchMockTransaction = useCallback(async () => {
    try {
      setError(null)
      setAnalysis(null)
      setAgentUpdates([])
      const txn = await getMockTransaction()
      setTransaction(txn)
      return txn
    } catch {
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
    } catch {
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
    } catch {
      setError('Demo failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMockTransaction()
  }, [fetchMockTransaction])

  if (!ready) return null

  return (
    <motion.div
      className="min-h-screen"
      style={{ background: 'transparent' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="veil-header px-6 py-0" style={{ height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left — Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="veil-logo-mark">
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--veil-pure)',
                letterSpacing: '-0.02em',
                position: 'relative',
                zIndex: 1,
              }}
            >
              V
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span className="veil-logo-text">VEIL</span>
          </div>

          <div
            style={{
              width: '1px',
              height: '20px',
              background: 'var(--veil-border)',
              margin: '0 4px',
            }}
            aria-hidden="true"
          />

          <span className="veil-tagline">Governance Infrastructure</span>
        </div>

        {/* Center — Status indicator */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            className="pulse-dot"
            style={{
              width: '5px',
              height: '5px',
              background: loading ? '#9b8a5a' : '#6b8f6b',
              boxShadow: loading ? '0 0 6px rgba(155,138,90,0.5)' : '0 0 6px rgba(107,143,107,0.5)',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--veil-muted)',
            }}
          >
            {loading ? 'Processing' : 'System nominal'}
          </span>
        </div>

        {/* Right — Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.14em',
              color: 'var(--veil-border-bright)',
              marginRight: '8px',
            }}
          >
            v1.0.0
          </span>

          <button
            className="btn-ghost"
            onClick={() => fetchMockTransaction()}
          >
            New Txn
          </button>

          <button
            className="btn-outline"
            onClick={handleRunDemo}
            disabled={loading}
          >
            Demo
          </button>

          <button
            className="btn-primary"
            onClick={() => handleAnalyze()}
            disabled={loading || !transaction}
          >
            {loading ? 'Running...' : 'Analyze →'}
          </button>
        </div>
      </header>

      {/* ── ERROR BANNER ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              margin: '0 24px',
              padding: '10px 16px',
              borderLeft: '2px solid rgba(143,90,90,0.6)',
              background: 'rgba(143,90,90,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '12px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(143,90,90,0.8)',
              }}
            >
              Error
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'rgba(143,90,90,0.7)',
              }}
            >
              {error}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN GRID ─────────────────────────────────────────────────────── */}
      <main
        style={{
          padding: '16px 20px 16px',
          display: 'grid',
          gridTemplateColumns: '280px 1fr 280px',
          gap: '12px',
          height: 'calc(100vh - 52px)',
        }}
      >
        {/* Left */}
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
          {...SLIDE_LEFT}
          transition={{ ...SLIDE_LEFT.animate.transition, delay: 0.1 }}
        >
          <LeftPanel transaction={transaction} />
        </motion.div>

        {/* Center */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
          <motion.div
            style={{ flex: 1, minHeight: 0 }}
            {...SLIDE_UP}
            transition={{ ...SLIDE_UP.animate.transition, delay: 0.15 }}
          >
            <CenterPanel
              agentUpdates={agentUpdates}
              analysis={analysis}
              loading={loading}
            />
          </motion.div>

          <motion.div
            style={{ height: '180px', flexShrink: 0 }}
            {...SLIDE_UP}
            transition={{ ...SLIDE_UP.animate.transition, delay: 0.25 }}
          >
            <BottomPanel transaction={transaction} analysis={analysis} />
          </motion.div>
        </div>

        {/* Right */}
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
          {...SLIDE_RIGHT}
          transition={{ ...SLIDE_RIGHT.animate.transition, delay: 0.2 }}
        >
          <RightPanel analysis={analysis} loading={loading} />
        </motion.div>
      </main>

      {/* ── BOTTOM META BAR ───────────────────────────────────────────────── */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '24px',
          background: 'rgba(0,0,0,0.9)',
          borderTop: '1px solid var(--veil-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', gap: '24px' }}>
          {[
            { label: 'Model', value: 'Gemini 1.5' },
            { label: 'Agents', value: analysis ? `${analysis.agent_results.length} active` : 'Standby' },
            { label: 'Storage', value: 'Supabase' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '8px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--veil-border-bright)',
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '8px',
                  color: 'var(--veil-muted)',
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '8px',
            letterSpacing: '0.12em',
            color: 'var(--veil-border-bright)',
          }}
        >
          Trust, before settlement.
        </span>
      </div>
    </motion.div>
  )
}
