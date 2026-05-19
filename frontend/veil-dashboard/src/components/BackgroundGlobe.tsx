'use client'

import { useEffect, useRef } from 'react'

export default function BackgroundGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let W = window.innerWidth
    let H = window.innerHeight

    const resize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W
      canvas.height = H
    }

    resize()
    window.addEventListener('resize', resize)

    // ── Globe config ──────────────────────────────────
    const cx = W * 0.5
    const cy = H * 0.5
    const R = Math.min(W, H) * 0.34

    // Particle counts
    const RING_PARTICLES   = 2800   // dense toroidal ring like Kimi
    const SPHERE_PARTICLES = 600    // sparse inner sphere
    const NODES            = 14     // bright network nodes

    // ── Ring particles (torus shape) ──────────────────
    interface RingParticle {
      theta: number   // angle around torus center
      phi: number     // angle in tube cross-section
      tubeR: number   // tube radius (varied for density)
      speed: number
      size: number
      brightness: number
    }

    const ring: RingParticle[] = Array.from({ length: RING_PARTICLES }, () => ({
      theta: Math.random() * Math.PI * 2,
      phi: Math.random() * Math.PI * 2,
      tubeR: R * (0.08 + Math.random() * 0.1),
      speed: (0.0002 + Math.random() * 0.0003) * (Math.random() < 0.5 ? 1 : -1),
      size: 0.3 + Math.random() * 0.9,
      brightness: 0.15 + Math.random() * 0.6,
    }))

    // ── Sphere particles (inner) ───────────────────────
    interface SphereParticle {
      lat: number
      lon: number
      r: number
      speed: number
      size: number
      opacity: number
    }

    const spherePoints: SphereParticle[] = Array.from({ length: SPHERE_PARTICLES }, () => ({
      lat: (Math.random() - 0.5) * Math.PI,
      lon: Math.random() * Math.PI * 2,
      r: R * (0.3 + Math.random() * 0.55),
      speed: 0.0001 + Math.random() * 0.0002,
      size: 0.4 + Math.random() * 1.0,
      opacity: 0.05 + Math.random() * 0.2,
    }))

    // ── Network nodes ──────────────────────────────────
    interface Node {
      lat: number
      lon: number
      r: number
      size: number
      pulsePhase: number
      connections: number[]
    }

    const nodes: Node[] = Array.from({ length: NODES }, (_, i) => ({
      lat: (Math.random() - 0.5) * Math.PI * 0.8,
      lon: Math.random() * Math.PI * 2,
      r: R * (0.5 + Math.random() * 0.4),
      size: 1.5 + Math.random() * 2,
      pulsePhase: Math.random() * Math.PI * 2,
      connections: Array.from({ length: 2 }, () => Math.floor(Math.random() * NODES)).filter(j => j !== i),
    }))

    // ── Rotation state ─────────────────────────────────
    let rotY = 0
    let rotX = 0.15   // slight tilt like Kimi

    const project = (x: number, y: number, z: number) => {
      // Rotate around Y
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY)
      const x1 = x * cosY - z * sinY
      const z1 = x * sinY + z * cosY
      // Rotate around X
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX)
      const y1 = y * cosX - z1 * sinX
      const z2 = y * sinX + z1 * cosX
      return { px: cx + x1, py: cy + y1, pz: z2 }
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      rotY += 0.0015

      // ── Sphere particles ─────────────────────────────
      for (const p of spherePoints) {
        p.lon += p.speed
        const x = p.r * Math.cos(p.lat) * Math.cos(p.lon)
        const y = p.r * Math.sin(p.lat)
        const z = p.r * Math.cos(p.lat) * Math.sin(p.lon)
        const { px, py, pz } = project(x, y, z)
        const depth = (pz + R) / (2 * R)
        const alpha = p.opacity * depth * 0.5
        if (alpha < 0.005) continue
        ctx.beginPath()
        ctx.arc(px, py, p.size * depth, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(180,180,180,${alpha})`
        ctx.fill()
      }

      // ── Ring torus ───────────────────────────────────
      const sortedRing = ring.map(p => {
        p.theta += p.speed
        const torusX = (R + p.tubeR * Math.cos(p.phi)) * Math.cos(p.theta)
        const torusY = p.tubeR * Math.sin(p.phi) * 0.4  // flatten torus vertically
        const torusZ = (R + p.tubeR * Math.cos(p.phi)) * Math.sin(p.theta)
        const { px, py, pz } = project(torusX, torusY, torusZ)
        const depth = (pz + R * 1.5) / (R * 3)
        return { px, py, depth, p }
      }).sort((a, b) => a.depth - b.depth)

      for (const { px, py, depth, p } of sortedRing) {
        const alpha = p.brightness * Math.max(0, depth) * 0.9
        if (alpha < 0.01) continue
        const size = p.size * (0.5 + depth * 0.6)
        ctx.beginPath()
        ctx.arc(px, py, size, 0, Math.PI * 2)
        // Vary from near-white to grey based on brightness
        const lum = Math.floor(160 + p.brightness * 80)
        ctx.fillStyle = `rgba(${lum},${lum},${lum},${alpha})`
        ctx.fill()
      }

      // ── Network connections ──────────────────────────
      const nodePositions = nodes.map(n => {
        const x = n.r * Math.cos(n.lat) * Math.cos(n.lon)
        const y = n.r * Math.sin(n.lat)
        const z = n.r * Math.cos(n.lat) * Math.sin(n.lon)
        return project(x, y, z)
      })

      for (let i = 0; i < nodes.length; i++) {
        const { px: ax, py: ay, pz: az } = nodePositions[i]
        for (const j of nodes[i].connections) {
          const { px: bx, py: by, pz: bz } = nodePositions[j]
          const depthA = (az + R) / (2 * R)
          const depthB = (bz + R) / (2 * R)
          if (depthA < 0.1 && depthB < 0.1) continue
          const alpha = Math.min(depthA, depthB) * 0.12
          ctx.beginPath()
          ctx.moveTo(ax, ay)
          ctx.lineTo(bx, by)
          ctx.strokeStyle = `rgba(200,200,200,${alpha})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }

      // ── Network nodes ────────────────────────────────
      const t = Date.now() * 0.001
      for (let i = 0; i < nodes.length; i++) {
        const { px, py, pz } = nodePositions[i]
        const depth = (pz + R) / (2 * R)
        if (depth < 0.05) continue
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.5 + nodes[i].pulsePhase)
        const alpha = depth * (0.5 + pulse * 0.3)
        const size = nodes[i].size * depth
        // Outer glow ring
        ctx.beginPath()
        ctx.arc(px, py, size + 2 + pulse * 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220,220,220,${alpha * 0.08})`
        ctx.fill()
        // Core dot
        ctx.beginPath()
        ctx.arc(px, py, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(240,240,240,${alpha * 0.85})`
        ctx.fill()
      }

      // ── Vignette ─────────────────────────────────────
      const vignette = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R * 1.5)
      vignette.addColorStop(0, 'rgba(0,0,0,0)')
      vignette.addColorStop(1, 'rgba(0,0,0,0.65)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, W, H)

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0,
        animation: 'fadeIn 2s ease 4s forwards',
      }}
      aria-hidden="true"
    />
  )
}
