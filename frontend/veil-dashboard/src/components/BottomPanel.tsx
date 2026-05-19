'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, MessageCircle, X } from 'lucide-react'
import type { Transaction, AnalyzeResponse } from '@/lib/api'
import IntentGraph from './IntentGraph'
import AskVeil from './AskVeil'

interface Props {
  transaction: Transaction | null
  analysis: AnalyzeResponse | null
}

export default function BottomPanel({ transaction, analysis }: Props) {
  const [showAskVeil, setShowAskVeil] = useState(false)

  return (
    <div className="glass-panel h-full p-4 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Share2 size={14} className="text-veil-cyan" />
          <h2 className="text-xs font-semibold text-veil-muted uppercase tracking-wider">
            Intent Graph
          </h2>
        </div>
        <button
          onClick={() => setShowAskVeil(!showAskVeil)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-veil-cyan/30 rounded-lg text-veil-cyan hover:bg-veil-cyan/10 transition-all"
        >
          {showAskVeil ? (
            <>
              <X size={12} />
              <span>Close</span>
            </>
          ) : (
            <>
              <MessageCircle size={12} />
              <span>Ask VEIL</span>
            </>
          )}
        </button>
      </div>

      <motion.div
        animate={{ height: showAskVeil ? 'auto' : '100%' }}
        className="overflow-hidden"
      >
        {showAskVeil ? (
          <AskVeil transaction={transaction} analysis={analysis} />
        ) : (
          <IntentGraph transaction={transaction} analysis={analysis} />
        )}
      </motion.div>
    </div>
  )
}
