'use client'

import { useEffect, useRef } from 'react'

const PHI = (1 + Math.sqrt(5)) / 2

function normalize(v: [number, number, number]): [number, number, number] {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
  return [v[0] / len, v[1] / len, v[2] / len]
}

function subdivide(
  vertices: [number, number, number][],
  faces: [number, number, number][]
): { vertices: [number, number, number][]; faces: [number, number, number][] } {
  const midCache = new Map<string, number>()
  const newFaces: [number, number, number][] = []

  function getMid(a: number, b: number): number {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`
    if (midCache.has(key)) return midCache.get(key)!
    const v1 = vertices[a]
    const v2 = vertices[b]
    const mid = normalize([(v1[0] + v2[0]) / 2, (v1[1] + v2[1]) / 2, (v1[2] + v2[2]) / 2])
    const idx = vertices.length
    vertices.push(mid)
    midCache.set(key, idx)
    return idx
  }

  for (const [a, b, c] of faces) {
    const ab = getMid(a, b)
    const bc = getMid(b, c)
    const ca = getMid(c, a)
    newFaces.push([a, ab, ca])
    newFaces.push([b, bc, ab])
    newFaces.push([c, ca, bc])
    newFaces.push([ab, bc, ca])
  }

  return { vertices, faces: newFaces }
}

function generateIcosahedron(subdivisions: number = 1) {
  const t = 0.5 / PHI
  const raw: [number, number, number][] = [
    [-0.5, t, 0], [0.5, t, 0], [-0.5, -t, 0], [0.5, -t, 0],
    [0, -0.5, t], [0, 0.5, t], [0, -0.5, -t], [0, 0.5, -t],
    [t, 0, -0.5], [t, 0, 0.5], [-t, 0, -0.5], [-t, 0, 0.5],
  ]
  const vertices: [number, number, number][] = raw.map(normalize)
  const faces: [number, number, number][] = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ]

  let result = { vertices, faces }
  for (let i = 0; i < subdivisions; i++) {
    result = subdivide(result.vertices, result.faces)
  }
  return result
}

function buildEdges(faces: [number, number, number][]): [number, number][] {
  const edgeSet = new Set<string>()
  const edges: [number, number][] = []
  for (const [a, b, c] of faces) {
    for (const pair of [[a, b], [b, c], [c, a]] as [number, number][]) {
      const key = pair[0] < pair[1] ? `${pair[0]}-${pair[1]}` : `${pair[1]}-${pair[0]}`
      if (!edgeSet.has(key)) {
        edgeSet.add(key)
        edges.push(pair)
      }
    }
  }
  return edges
}

export default function BackgroundGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { vertices, faces } = generateIcosahedron(2)
    const edges = buildEdges(faces)
    const vertexCount = vertices.length

    function resize() {
      canvas!.width = window.innerWidth * window.devicePixelRatio
      canvas!.height = window.innerHeight * window.devicePixelRatio
      canvas!.style.width = `${window.innerWidth}px`
      canvas!.style.height = `${window.innerHeight}px`
      ctx!.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0)
    }

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouse)

    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.22
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2

    let rotY = 0
    let rotX = 0

    function project(v: [number, number, number]): [number, number, number] {
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX)
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY)
      const x1 = v[0] * cosY - v[2] * sinY
      const z1 = v[0] * sinY + v[2] * cosY
      const y1 = v[1] * cosX - z1 * sinX
      const z2 = v[1] * sinX + z1 * cosX
      return [x1, y1, z2]
    }

    function draw(time: number) {
      const w = window.innerWidth
      const h = window.innerHeight
      ctx!.clearRect(0, 0, w, h)

      const mx = mouseRef.current.x * 0.3
      const my = mouseRef.current.y * 0.2
      rotY = time * 0.0002 + mx
      rotX = Math.sin(time * 0.0001) * 0.2 + my

      const projected = vertices.map(v => project(v))

      const screenVerts = projected.map(v => [
        cx + v[0] * radius,
        cy + v[1] * radius,
        v[2],
      ] as [number, number, number])

      const sortedEdges = edges
        .map(([a, b]) => ({ a, b, depth: (projected[a][2] + projected[b][2]) / 2 }))
        .sort((a, b) => a.depth - b.depth)

      for (const e of sortedEdges) {
        const p1 = screenVerts[e.a]
        const p2 = screenVerts[e.b]
        const depth = (e.depth + 1) / 2
        const alpha = 0.08 + depth * 0.25
        const lineWidth = 0.5 + depth * 1.5

        ctx!.beginPath()
        ctx!.moveTo(p1[0], p1[1])
        ctx!.lineTo(p2[0], p2[1])
        ctx!.strokeStyle = `rgba(37, 99, 235, ${alpha})`
        ctx!.lineWidth = lineWidth
        ctx!.stroke()

        const glowAlpha = 0.02 + depth * 0.08
        ctx!.beginPath()
        ctx!.moveTo(p1[0], p1[1])
        ctx!.lineTo(p2[0], p2[1])
        ctx!.strokeStyle = `rgba(34, 211, 238, ${glowAlpha})`
        ctx!.lineWidth = lineWidth + 4
        ctx!.stroke()
      }

      const sortedVerts = projected
        .map((v, i) => ({ i, depth: v[2] }))
        .sort((a, b) => a.depth - b.depth)

      const pulse = Math.sin(time * 0.002) * 0.3 + 0.7

      for (const { i, depth } of sortedVerts) {
        const p = screenVerts[i]
        const d = (depth + 1) / 2
        const baseSize = 1.5 + d * 2
        const size = baseSize * (0.8 + pulse * 0.2)

        const grad = ctx!.createRadialGradient(p[0], p[1], 0, p[0], p[1], size * 4)
        grad.addColorStop(0, `rgba(34, 211, 238, ${0.3 + d * 0.5})`)
        grad.addColorStop(0.3, `rgba(34, 211, 238, ${0.1 + d * 0.2})`)
        grad.addColorStop(1, 'rgba(34, 211, 238, 0)')
        ctx!.fillStyle = grad
        ctx!.beginPath()
        ctx!.arc(p[0], p[1], size * 4, 0, Math.PI * 2)
        ctx!.fill()

        ctx!.fillStyle = `rgba(34, 211, 238, ${0.5 + d * 0.5})`
        ctx!.beginPath()
        ctx!.arc(p[0], p[1], size * 0.5, 0, Math.PI * 2)
        ctx!.fill()

        ctx!.fillStyle = `rgba(248, 250, 252, ${0.2 + d * 0.4})`
        ctx!.beginPath()
        ctx!.arc(p[0], p[1], size * 0.2, 0, Math.PI * 2)
        ctx!.fill()
      }

      requestAnimationFrame(draw)
    }

    const animId = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  )
}
