'use client'

import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, Ban, Eye } from 'lucide-react'

interface Props {
  decision: string
}

const DECISION_CONFIG: Record<string, {
  label: string
  color: string
  bg: string
  glow: string
  icon: typeof CheckCircle
  description: string
}> = {
  APPROVE: {
    label: 'APPROVED',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.1)',
    glow: '0 0 30px rgba(16, 185, 129, 0.3)',
    icon: CheckCircle,
    description: 'Transaction passes all governance checks',
  },
  HOLD: {
    label: 'HOLD',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.1)',
    glow: '0 0 30px rgba(245, 158, 11, 0.3)',
    icon: AlertTriangle,
    description: 'Transaction requires further review',
  },
  ESCALATE: {
    label: 'ESCALATE',
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    glow: '0 0 30px rgba(239, 68, 68, 0.3)',
    icon: Ban,
    description: 'High-risk flags triggered — immediate attention',
  },
  VERIFY: {
    label: 'VERIFY',
    color: '#22D3EE',
    bg: 'rgba(34, 211, 238, 0.1)',
    glow: '0 0 30px rgba(34, 211, 238, 0.3)',
    icon: Eye,
    description: 'Additional identity verification required',
  },
}

export default function DecisionBanner({ decision }: Props) {
  const config = DECISION_CONFIG[decision] || DECISION_CONFIG.HOLD
  const Icon = config.icon

  return (
    <motion.div
      className="w-full rounded-xl p-4 text-center"
      style={{
        backgroundColor: config.bg,
        boxShadow: config.glow,
        borderColor: config.color,
        borderWidth: 1,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: [
          config.glow,
          `0 0 40px ${config.color}33`,
          config.glow,
        ],
      }}
      transition={{
        y: { duration: 0.5 },
        opacity: { duration: 0.5 },
        boxShadow: { duration: 2, repeat: Infinity },
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
      >
        <Icon size={32} style={{ color: config.color }} className="mx-auto mb-1" />
      </motion.div>
      <motion.p
        className="text-xl font-bold font-mono"
        style={{ color: config.color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {config.label}
      </motion.p>
      <p className="text-[10px] text-veil-muted mt-1">{config.description}</p>
    </motion.div>
  )
}
