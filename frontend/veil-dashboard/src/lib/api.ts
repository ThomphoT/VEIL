const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface AgentResult {
  agent: string
  score: number
  confidence: number
  finding: string
  recommendation: string
  latency_ms?: number
}

export interface Transaction {
  transaction_id: string
  amount: number
  currency: string
  merchant: string
  merchant_category?: string
  customer_id: string
  device_id?: string
  ip_address?: string
  geolocation?: string
  timestamp: string
}

export interface AnalyzeResponse {
  transaction_id: string
  decision: string
  confidence: number
  risk_score: number
  explanation: string
  agent_results: AgentResult[]
}

export interface HistoryRecord {
  transaction_id: string
  amount: number
  currency: string
  merchant: string
  customer_id: string
  decision: string
  risk_score: number
  confidence: number
  created_at: string
}

export async function getMockTransaction(): Promise<Transaction> {
  const res = await fetch(`${API_BASE}/api/transaction/mock`)
  if (!res.ok) throw new Error('Failed to fetch mock transaction')
  return res.json()
}

export async function analyzeTransaction(txn: Transaction): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(txn),
  })
  if (!res.ok) throw new Error('Analysis failed')
  return res.json()
}

export async function runDemo(): Promise<{ transaction: Transaction; decision: string; risk_score: number; confidence: number; agent_results: AgentResult[]; explanation: string }> {
  const res = await fetch(`${API_BASE}/api/demo`, { method: 'POST' })
  if (!res.ok) throw new Error('Demo failed')
  return res.json()
}

export async function voiceQuery(query: string, transactionId?: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/voice-query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, transaction_id: transactionId }),
  })
  if (!res.ok) throw new Error('Voice query failed')
  const data = await res.json()
  return data.response
}

export async function getHistory(limit = 50): Promise<HistoryRecord[]> {
  const res = await fetch(`${API_BASE}/api/history?limit=${limit}`)
  if (!res.ok) throw new Error('Failed to fetch history')
  const data = await res.json()
  return data.transactions
}

export function getEventStream(): EventSource {
  return new EventSource(`${API_BASE}/api/stream`)
}
