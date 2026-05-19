'use client'

import { motion } from 'framer-motion'
import { MapPin, Globe, Monitor, CreditCard, User, Building2 } from 'lucide-react'
import type { Transaction } from '@/lib/api'

interface Props {
  transaction: Transaction | null
}

export default function LeftPanel({ transaction }: Props) {
  if (!transaction) {
    return (
      <div className="glass-panel h-full p-5 flex items-center justify-center">
        <p className="text-veil-muted text-sm">Awaiting transaction data...</p>
      </div>
    )
  }

  const details = [
    { icon: CreditCard, label: 'Transaction ID', value: transaction.transaction_id },
    { icon: Building2, label: 'Merchant', value: transaction.merchant },
    { icon: User, label: 'Customer', value: transaction.customer_id },
    { icon: Monitor, label: 'Device ID', value: transaction.device_id || 'N/A' },
    { icon: Globe, label: 'IP Address', value: transaction.ip_address || 'N/A' },
    { icon: MapPin, label: 'Geolocation', value: transaction.geolocation || 'N/A' },
  ]

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
  }

  return (
    <div className="glass-panel h-full p-5 flex flex-col gap-4">
      <h2 className="text-xs font-semibold text-veil-muted uppercase tracking-wider">Transaction Details</h2>

      <motion.div
        className="p-4 rounded-xl bg-gradient-to-br from-veil-blue/10 to-veil-cyan/5 border border-veil-border"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-2xl font-bold font-mono text-gradient">
          {formatAmount(transaction.amount, transaction.currency)}
        </p>
        <p className="text-xs text-veil-muted mt-1">{transaction.merchant_category || 'General'}</p>
      </motion.div>

      <div className="flex flex-col gap-2 flex-1">
        {details.map((item, i) => (
          <motion.div
            key={item.label}
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <item.icon size={14} className="text-veil-cyan" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-veil-muted uppercase tracking-wider">{item.label}</p>
              <p className="text-sm font-mono truncate">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-3 rounded-lg bg-white/5 border border-veil-border">
        <p className="text-[10px] text-veil-muted uppercase tracking-wider mb-1">Timestamp</p>
        <p className="text-xs font-mono text-veil-text/70">
          {new Date(transaction.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
