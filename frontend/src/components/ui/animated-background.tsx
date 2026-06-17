"use client"

import { useEffect, useRef } from "react"

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let width = 0
    let height = 0
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

    type Particle = { x: number; y: number; vx: number; vy: number; r: number; a: number }
    let particles: Particle[] = []

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.min(70, Math.floor((width * height) / 22000))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.6 + 0.4,
        a: Math.random() * 0.5 + 0.15,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(168, 142, 250, ${p.a})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    setup()
    if (!prefersReduced) {
      raf = requestAnimationFrame(draw)
    } else {
      draw()
      cancelAnimationFrame(raf)
    }

    const onResize = () => {
      cancelAnimationFrame(raf)
      setup()
      if (!prefersReduced) raf = requestAnimationFrame(draw)
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      <div className="absolute -top-40 left-1/2 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.18),transparent_65%)] blur-3xl animate-[auroraA_14s_ease-in-out_infinite]" />
      <div className="absolute top-1/3 -left-32 h-[420px] w-[520px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.16),transparent_65%)] blur-3xl animate-[auroraB_18s_ease-in-out_infinite]" />
      <div className="absolute bottom-0 right-0 h-[420px] w-[520px] translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.10),transparent_65%)] blur-3xl animate-[auroraA_20s_ease-in-out_infinite]" />

      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-60" />
    </div>
  )
}