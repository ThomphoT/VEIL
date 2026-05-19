'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User } from 'lucide-react'
import { voiceQuery } from '@/lib/api'
import type { Transaction, AnalyzeResponse } from '@/lib/api'

interface Props {
  transaction: Transaction | null
  analysis: AnalyzeResponse | null
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  displayContent?: string
}

export default function AskVeil({ transaction, analysis }: Props) {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "I'm VEIL's conversational interface. Ask me anything about this transaction's risk analysis, governance check, or what each agent found.",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [typingIndex, setTypingIndex] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const typewriter = async (text: string, messageIndex: number) => {
    setTypingIndex(messageIndex)
    const newMessages = [...messages]
    let displayed = ''
    for (let i = 0; i < text.length; i++) {
      displayed += text[i]
      newMessages[messageIndex] = { ...newMessages[messageIndex], displayContent: displayed }
      setMessages([...newMessages])
      await new Promise(r => setTimeout(r, 10))
    }
    setTypingIndex(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || loading) return

    const userMessage: Message = { role: 'user', content: query }
    setMessages(prev => [...prev, userMessage])
    setQuery('')
    setLoading(true)

    const assistantMessage: Message = {
      role: 'assistant',
      content: '...',
      displayContent: '',
    }
    const msgIndex = messages.length + 1
    setMessages(prev => [...prev, assistantMessage])

    try {
      const response = await voiceQuery(
        query,
        analysis?.transaction_id
      )
      setMessages(prev => {
        const updated = [...prev]
        updated[msgIndex] = { ...updated[msgIndex], content: response }
        return updated
      })
      typewriter(response, msgIndex)
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[msgIndex] = { ...updated[msgIndex], content: 'Sorry, I encountered an error processing your query.' }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex-1 overflow-y-auto space-y-3 pr-2" style={{ maxHeight: '180px' }}>
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={`${msg.role}-${i}`}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-veil-cyan to-veil-blue flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={12} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] p-2.5 rounded-xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-veil-blue/20 border border-veil-blue/30 text-veil-text'
                    : 'bg-white/5 border border-veil-border text-veil-text/80'
                }`}
              >
                {msg.role === 'assistant' && typingIndex === i
                  ? msg.displayContent
                  : msg.content}
                {msg.role === 'assistant' && typingIndex === i && (
                  <span className="inline-block w-1.5 h-3 bg-veil-cyan ml-0.5 animate-pulse" />
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-veil-blue flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={12} className="text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask VEIL about this transaction..."
          className="flex-1 bg-white/5 border border-veil-border rounded-lg px-3 py-2 text-xs text-veil-text placeholder-veil-muted/50 outline-none focus:border-veil-cyan/50 transition-colors"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-3 py-2 bg-gradient-to-r from-veil-cyan to-veil-blue rounded-lg disabled:opacity-30 transition-all"
        >
          <Send size={14} className="text-white" />
        </button>
      </form>
    </div>
  )
}
