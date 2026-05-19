'use client'

import { useState, useEffect } from 'react'

export default function LoadingScreen() {
  const [phase, setPhase] = useState<'veil' | 'tagline' | 'exiting' | 'done'>('veil')

  useEffect(() => {
    // Phase 1: Show VEIL (0–1600ms)
    // Phase 2: Transition to tagline (1600ms)
    // Phase 3: Begin exit (3200ms)
    // Phase 4: Done (4000ms)

    const t1 = setTimeout(() => setPhase('tagline'), 1600)
    const t2 = setTimeout(() => setPhase('exiting'), 3200)
    const t3 = setTimeout(() => setPhase('done'), 4200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  if (phase === 'done') return null

  return (
    <div
      className={`veil-loader ${phase === 'exiting' ? 'exiting' : ''}`}
      aria-label="Loading VEIL"
      role="status"
    >
      {/* Scan line */}
      <div className="loader-scan-line" aria-hidden="true" />

      {/* Corner brackets */}
      <div className="loader-corner tl" aria-hidden="true" />
      <div className="loader-corner tr" aria-hidden="true" />
      <div className="loader-corner bl" aria-hidden="true" />
      <div className="loader-corner br" aria-hidden="true" />

      {/* Center content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* VEIL wordmark */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div
            className="loader-veil-text"
            style={{
              transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.76,0,0.24,1)',
              opacity: phase === 'tagline' || phase === 'exiting' ? 0 : undefined,
              transform: phase === 'tagline' || phase === 'exiting' ? 'translateY(-12px) scale(0.98)' : undefined,
            }}
          >
            VEIL
          </div>

          {/* Tagline appears in same space */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(18px, 3vw, 32px)',
              fontWeight: 300,
              letterSpacing: '0.1em',
              color: 'var(--veil-secondary)',
              opacity: phase === 'tagline' || phase === 'exiting' ? 1 : 0,
              transform: phase === 'tagline' || phase === 'exiting' ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.7s ease 0.1s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s',
              whiteSpace: 'nowrap',
            }}
          >
            Trust, before settlement.
          </div>
        </div>

        {/* Vertical rule */}
        <div className="loader-line" aria-hidden="true" />

        {/* Status text */}
        <div className="loader-status">
          Initializing governance layer
        </div>

        {/* Progress bar */}
        <div
          aria-hidden="true"
          style={{
            marginTop: '24px',
            width: '120px',
            height: '1px',
            background: 'var(--veil-border)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              background: 'var(--veil-border-bright)',
              width: phase === 'tagline' || phase === 'exiting' ? '100%' : '0%',
              transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1) 0.2s',
            }}
          />
        </div>
      </div>

      {/* Bottom metadata */}
      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '32px',
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--veil-border-bright)',
          opacity: 0,
          animation: 'fadeIn 0.6s ease 1s forwards',
        }}
      >
        <span>v1.0.0</span>
        <span style={{ color: 'var(--veil-border-mid)' }}>—</span>
        <span>AI Governance</span>
        <span style={{ color: 'var(--veil-border-mid)' }}>—</span>
        <span>Financial Layer</span>
      </div>
    </div>
  )
}
