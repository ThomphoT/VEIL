'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { Transaction, AnalyzeResponse } from '@/lib/api'

interface Props {
  transaction: Transaction | null
  analysis: AnalyzeResponse | null
}

interface Node {
  id: string
  label: string
  x: number
  y: number
  color: string
  pulse: boolean
}

interface Edge {
  from: string
  to: string
  color: string
  active: boolean
}

export default function IntentGraph({ transaction, analysis }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)

  const nodes: Node[] = [
    { id: 'customer', label: 'Customer', x: 100, y: 60, color: '#22D3EE', pulse: false },
    { id: 'device', label: 'Device', x: 40, y: 30, color: '#2563EB', pulse: false },
    { id: 'recipient', label: 'Merchant', x: 160, y: 30, color: '#F59E0B', pulse: false },
    { id: 'transaction', label: 'Transaction', x: 100, y: 10, color: '#10B981', pulse: !!analysis },
    { id: 'agents', label: 'Agents', x: 100, y: 85, color: '#8B5CF6', pulse: !!analysis },
  ]

  const edges: Edge[] = [
    { from: 'customer', to: 'device', color: '#1E293B', active: true },
    { from: 'customer', to: 'recipient', color: '#1E293B', active: true },
    { from: 'customer', to: 'transaction', color: '#1E293B', active: true },
    { from: 'device', to: 'transaction', color: '#1E293B', active: true },
    { from: 'recipient', to: 'transaction', color: '#1E293B', active: true },
    { from: 'agents', to: 'transaction', color: '#1E293B', active: true },
    { from: 'agents', to: 'customer', color: '#1E293B', active: true },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.parentElement!.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height

    const drawNode = (node: Node) => {
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 20)
      gradient.addColorStop(0, node.color)
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.pulse ? 25 : 20, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = node.color
      ctx.beginPath()
      ctx.arc(node.x, node.y, 6, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#F8FAFC'
      ctx.font = '8px JetBrains Mono, monospace'
      ctx.textAlign = 'center'
      ctx.fillText(node.label, node.x, node.y + 16)
    }

    const drawEdge = (edge: Edge, time: number) => {
      const fromNode = nodes.find(n => n.id === edge.from)
      const toNode = nodes.find(n => n.id === edge.to)
      if (!fromNode || !toNode) return

      ctx.strokeStyle = edge.color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(fromNode.x, fromNode.y)
      ctx.lineTo(toNode.x, toNode.y)
      ctx.stroke()

      if (edge.active && analysis) {
        const t = (time / 2000) % 1
        const x = fromNode.x + (toNode.x - fromNode.x) * t
        const y = fromNode.y + (toNode.y - fromNode.y) * t

        ctx.fillStyle = '#22D3EE'
        ctx.shadowColor = '#22D3EE'
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    let animTime = 0

    const animate = () => {
      animTime += 16
      ctx.clearRect(0, 0, width, height)

      edges.forEach(edge => drawEdge(edge, animTime))
      nodes.forEach(node => drawNode(node))

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [analysis, transaction])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ minHeight: '100px' }}
    />
  )
}
