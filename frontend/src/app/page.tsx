"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  type LucideIcon,
  MessageSquare,
  Upload,
  Hash,
  GitMerge,
  RotateCw,
  Database,
  Zap,
  Target,
  Brain,
  Layers,
  CheckCircle2,
  Activity,
  Globe,
  Shield,
  RefreshCw as RefreshIcon,
} from "lucide-react"
import { AnimatedBackground } from "../components/ui/animated-background"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

function HybridMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="5" cy="5" r="1.7" fill="#3FC9B5" />
      <circle cx="11" cy="5" r="1.7" fill="#3FC9B5" />
      <circle cx="5" cy="11" r="1.7" fill="#3FC9B5" />
      <circle cx="11" cy="11" r="1.7" fill="#3FC9B5" />
      <line x1="11" y1="11" x2="17" y2="17" stroke="#9D7CFF" strokeWidth="1.4" />
      <circle cx="17" cy="17" r="2" fill="#9D7CFF" />
      <rect x="19" y="16.2" width="7" height="1.6" rx="0.8" fill="#E8A33D" />
      <rect x="15" y="20.4" width="11" height="1.6" rx="0.8" fill="#E8A33D" />
      <rect x="19" y="24.6" width="7" height="1.6" rx="0.8" fill="#E8A33D" />
    </svg>
  )
}

function SemanticIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="5" cy="12" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="19" cy="19" r="2" />
      <line x1="7" y1="11" x2="17" y2="6" />
      <line x1="7" y1="13" x2="17" y2="18" />
    </svg>
  )
}

function StageCardWide({
  icon: Icon,
  title,
  desc,
  accent,
}: {
  icon: LucideIcon
  title: string
  desc: string
  accent: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card glow-violet flex w-full max-w-[500px] items-center gap-4 rounded-xl px-5 py-4 transition-shadow duration-300 hover:-translate-y-0.5"
    >
      <Icon className="h-5 w-5 shrink-0" style={{ color: accent }} />
      <div>
        <p className="font-mono-jb text-[10px] font-medium uppercase tracking-[0.14em]" style={{ color: accent }}>
          {title}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-[#4A5568]">{desc}</p>
      </div>
    </motion.div>
  )
}

/** GSAP-driven connector: the vertical line draws itself in as it scrolls into view. */
function Connector({ index }: { index: number }) {
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!lineRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: "top",
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: lineRef.current,
            start: "top 90%",
          },
        }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="relative flex flex-col items-center" style={{ height: 22 }}>
      <div
        ref={lineRef}
        className="w-px flex-1"
        style={{ background: "linear-gradient(to bottom, #232A35, #3A4455)" }}
        data-connector-index={index}
      />
      <div
        className="absolute bottom-0 h-[6px] w-[6px] border-b border-r border-[#3A4455]"
        style={{ transform: "translateX(-50%) rotate(45deg)", left: "50%", bottom: -3 }}
      />
    </div>
  )
}

const COMPARISON = [
  {
    key: "traditional",
    badge: "Traditional RAG",
    icon: SemanticIcon as unknown as LucideIcon,
    accent: "#3FC9B5",
    tint: "rgba(63,201,181,0.08)",
    border: "rgba(63,201,181,0.2)",
    headline: "Dense vector search",
    blurb:
      "Embeds your query and documents into a shared vector space, then retrieves by cosine similarity — capturing meaning, paraphrase, and context.",
    points: ["Understands synonyms & intent", "Strong on conceptual questions", "Needs an embedding model + vector store"],
    weakness: "Can miss exact terms, codes, and rare tokens.",
  },
  {
    key: "vectorless",
    badge: "Vectorless RAG",
    icon: Hash,
    accent: "#E8A33D",
    tint: "rgba(232,163,61,0.08)",
    border: "rgba(232,163,61,0.22)",
    headline: "Lexical BM25 scoring",
    blurb:
      "Ranks documents by exact term frequency and rarity — no embeddings required. Fast, transparent, and precise for keyword-heavy queries.",
    points: ["Pinpoints exact keywords & IDs", "Zero embedding cost or latency", "Fully explainable ranking"],
    weakness: "Blind to synonyms and semantic paraphrase.",
  },
] as const

const STATS = [
  { value: "2×", label: "retrieval strategies", accent: "#9D7CFF" },
  { value: "RRF", label: "rank fusion", accent: "#3FC9B5" },
  { value: "∞", label: "session memory", accent: "#E8A33D" },
]

const FEATURES = [
  { icon: Target, title: "Precision + recall", desc: "Lexical exactness fused with semantic breadth in every answer.", accent: "#3FC9B5" },
  { icon: Brain, title: "Agentic reasoning", desc: "An agent reflects and re-queries until the answer is grounded.", accent: "#9D7CFF" },
  { icon: Layers, title: "Persistent memory", desc: "Context and prior answers carry across every session.", accent: "#E8A33D" },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

export default function Home() {
  return (
    <main
      className="relative min-h-screen overflow-hidden text-[#C8D0DC]"
      style={{ background: "#080B11", fontFamily: "'Inter', sans-serif" }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-mono-jb { font-family: 'JetBrains Mono', monospace; }
        .font-inter { font-family: 'Inter', sans-serif; }

        .glass-card {
          position: relative;
          background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%), #0D1117;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .glass-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(157,124,255,0.25), rgba(63,201,181,0.12) 50%, rgba(255,255,255,0.04));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .glow-teal:hover { box-shadow: 0 0 0 1px rgba(63,201,181,0.15), 0 8px 32px -8px rgba(63,201,181,0.25); }
        .glow-violet:hover { box-shadow: 0 0 0 1px rgba(157,124,255,0.18), 0 8px 32px -8px rgba(157,124,255,0.3); }
        .glow-amber:hover { box-shadow: 0 0 0 1px rgba(232,163,61,0.15), 0 8px 32px -8px rgba(232,163,61,0.25); }

        .noise-overlay {
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
          mix-blend-mode: overlay;
        }
      `,
        }}
      />

      {/* film grain texture — adds material weight instead of flat digital color */}
      <div className="noise-overlay pointer-events-none absolute inset-0 z-[1] opacity-[0.04]" />

      {/* layered gradient mesh — replaces the single flat glow with real depth */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 700, height: 700, borderRadius: "50%", top: -260, left: "8%",
          background: "radial-gradient(circle, rgba(63,201,181,0.10) 0%, transparent 65%)",
          animation: "auroraB 14s ease-in-out infinite", filter: "blur(10px)",
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          width: 640, height: 640, borderRadius: "50%", top: -160, right: "-10%",
          background: "radial-gradient(circle, rgba(232,163,61,0.08) 0%, transparent 65%)",
          animation: "auroraA 18s ease-in-out infinite", filter: "blur(10px)",
        }}
      />

      {/* grid texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(63,201,181,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(63,201,181,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* hero radial glow — layered for actual depth instead of one flat blob */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 780, height: 780, borderRadius: "50%", top: -280, left: "50%",
          transform: "translateX(-50%)",
          background: "radial-gradient(circle, rgba(157,124,255,0.10) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          width: 420, height: 420, borderRadius: "50%", top: -120, left: "50%",
          transform: "translateX(-50%)",
          background: "radial-gradient(circle, rgba(157,124,255,0.14) 0%, transparent 60%)",
          filter: "blur(4px)",
        }}
      />

      {/* three.js ambient particle field — depth behind the hero only */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[640px]">
        <AnimatedBackground />
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-14 px-6 py-8">
        {/* ── top bar ── */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <HybridMark />
            <span className="font-mono-jb text-[13px] tracking-[0.08em] text-[#5A6472]">hybrid-rag</span>
          </div>

          <div
            className="flex items-center gap-2 font-mono-jb text-[11px] text-[#5A6472]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "0.5px solid #1C2230",
              borderRadius: 20,
              padding: "5px 12px",
            }}
          >
            <span className="relative flex h-[7px] w-[7px]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3FC9B5] opacity-75" />
              <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-[#3FC9B5]" />
            </span>
            localhost:8000
          </div>
        </motion.header>

        {/* ── hero ── */}
        <motion.section
          initial="hidden"
          animate="show"
          variants={staggerContainer}
          className="flex flex-col items-center gap-4 text-center"
        >
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.45 }}
            className="font-mono-jb text-[11px] uppercase tracking-[0.16em] text-[#9D7CFF]"
            style={{
              background: "linear-gradient(180deg, rgba(157,124,255,0.12), rgba(157,124,255,0.04))",
              border: "0.5px solid rgba(157,124,255,0.25)",
              boxShadow: "0 0 24px -8px rgba(157,124,255,0.4)",
              borderRadius: 20,
              padding: "5px 14px",
            }}
          >
            Retrieval-Augmented Generation
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="font-inter font-semibold leading-[1.1] tracking-[-0.03em] text-[#EEF1F6]"
            style={{ fontSize: "clamp(36px, 6vw, 48px)" }}
          >
            Query with{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #9D7CFF 0%, #3FC9B5 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              precision &amp; depth
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="max-w-[500px] text-base leading-[1.75] text-[#6B7A8D]">
            Ask questions over your own documents. Every query runs two retrieval strategies in parallel, fused and
            reasoned over by an agent, and remembered across sessions.
          </motion.p>

          {/* stats strip */}
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mt-2 flex items-center gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <span className="font-inter text-2xl font-semibold" style={{ color: s.accent }}>
                  {s.value}
                </span>
                <span className="mt-0.5 font-mono-jb text-[10px] uppercase tracking-[0.12em] text-[#4A5568]">
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* ── traditional vs vectorless comparison ── */}
        <section className="flex flex-col gap-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-1.5 text-center"
          >
            <p className="font-mono-jb text-[10px] uppercase tracking-[0.18em] text-[#3A4455]">two engines, one answer</p>
            <h2 className="font-inter text-xl font-semibold tracking-[-0.02em] text-[#DEE4EE]">
              Traditional vs. Vectorless retrieval
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {COMPARISON.map((c) => {
              const Icon = c.icon
              return (
                <motion.div
                  key={c.key}
                  variants={fadeUp}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -3 }}
                  className={`glass-card ${c.key === "traditional" ? "glow-teal" : "glow-amber"} flex flex-col gap-4 rounded-2xl p-5 transition-shadow duration-300`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: c.tint, border: `0.5px solid ${c.border}` }}
                    >
                      <Icon className="h-[18px] w-[18px]" style={{ color: c.accent }} />
                    </span>
                    <span
                      className="font-mono-jb text-[10px] uppercase tracking-[0.12em]"
                      style={{
                        color: c.accent,
                        background: c.tint,
                        border: `0.5px solid ${c.border}`,
                        borderRadius: 20,
                        padding: "4px 10px",
                      }}
                    >
                      {c.badge}
                    </span>
                  </div>

                  <div>
                    <p className="font-inter text-[15px] font-medium text-[#DEE4EE]">{c.headline}</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[#6B7A8D]">{c.blurb}</p>
                  </div>

                  <ul className="flex flex-col gap-2">
                    {c.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-[12px] leading-snug text-[#8995A6]">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: c.accent }} />
                        {p}
                      </li>
                    ))}
                  </ul>

                  <p
                    className="mt-auto rounded-lg px-3 py-2 text-[11px] leading-relaxed text-[#5A6472]"
                    style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid #161C28" }}
                  >
                    <span className="font-mono-jb uppercase tracking-[0.1em] text-[#3A4455]">trade-off · </span>
                    {c.weakness}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>

          {/* fusion banner */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="glass-card flex items-center gap-3 rounded-xl px-5 py-4"
            style={{
              background:
                "linear-gradient(90deg, rgba(63,201,181,0.09), rgba(157,124,255,0.09)), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)), #0D1117",
            }}
          >
            <Zap className="h-5 w-5 shrink-0 text-[#9D7CFF]" />
            <p className="text-[13px] leading-relaxed text-[#8995A6]">
              <span className="font-medium text-[#DEE4EE]">Hybrid</span> runs both, then fuses results with{" "}
              <span className="font-mono-jb text-[#3FC9B5]">reciprocal rank fusion</span> — keeping lexical precision
              and semantic recall in a single ranked context.
            </p>
          </motion.div>
        </section>

        {/* ── architecture flow ── */}
        <div className="flex flex-col items-center gap-0">
          <p className="mb-2.5 font-mono-jb text-[10px] uppercase tracking-[0.18em] text-[#3A4455]">how a query flows</p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-2 font-mono-jb text-[12px] text-[#8995A6]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "0.5px solid #232A35",
              borderRadius: 10,
              padding: "8px 18px",
            }}
          >
            <span className="text-[#9D7CFF]">›_</span>
            your question
          </motion.div>

          <Connector index={0} />

          <p className="mb-2.5 font-mono-jb text-[10px] uppercase tracking-[0.18em] text-[#3A4455]">dual retrieval</p>

          {/* split grid */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="relative grid w-full max-w-[500px] grid-cols-2 gap-2.5"
            style={{ paddingTop: 22 }}
          >
            <div
              className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
              style={{
                width: "calc(50% + 1px)",
                height: 22,
                borderTop: "0.5px solid #232A35",
                borderLeft: "0.5px solid #232A35",
                borderRight: "0.5px solid #232A35",
                borderRadius: "4px 4px 0 0",
              }}
            />

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.35 }}
              className="glass-card glow-amber flex flex-col gap-2 rounded-xl p-4 transition-shadow duration-300"
            >
              <Hash className="h-[18px] w-[18px] text-[#E8A33D]" />
              <p className="font-mono-jb text-[10px] font-medium uppercase tracking-[0.14em] text-[#E8A33D]">Lexical</p>
              <p className="text-[11px] leading-relaxed text-[#4A5568]">Exact keyword match using BM25 scoring for precision</p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.35 }}
              className="glass-card glow-teal flex flex-col gap-2 rounded-xl p-4 transition-shadow duration-300"
            >
              <SemanticIcon className="h-[18px] w-[18px] text-[#3FC9B5]" />
              <p className="font-mono-jb text-[10px] font-medium uppercase tracking-[0.14em] text-[#3FC9B5]">Semantic</p>
              <p className="text-[11px] leading-relaxed text-[#4A5568]">Vector embedding search for contextual meaning</p>
            </motion.div>
          </motion.div>

          {/* bottom bracket + merge */}
          <div className="relative flex w-full max-w-[500px] flex-col items-center" style={{ paddingTop: 22 }}>
            <div
              className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
              style={{
                width: "calc(50% + 1px)",
                height: 22,
                borderBottom: "0.5px solid #232A35",
                borderLeft: "0.5px solid #232A35",
                borderRight: "0.5px solid #232A35",
                borderRadius: "0 0 4px 4px",
              }}
            />
            <StageCardWide icon={GitMerge} title="Merge & re-rank" desc="Reciprocal rank fusion — best of both, unified" accent="#8995A6" />
          </div>

          <Connector index={1} />
          <StageCardWide icon={RotateCw} title="Agent loop" desc="Reasons, reflects, and iterates until confident in the answer" accent="#9D7CFF" />

          <Connector index={2} />
          <StageCardWide icon={Database} title="Memory" desc="Answers and reasoning persist across all sessions" accent="#9D7CFF" />
        </div>

        {/* ── feature highlights ── */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -3 }}
                className="glass-card glow-violet flex flex-col gap-3 rounded-2xl p-5 transition-shadow duration-300"
              >
                <Icon className="h-5 w-5" style={{ color: f.accent }} />
                <p className="font-inter text-[14px] font-medium text-[#DEE4EE]">{f.title}</p>
                <p className="text-[12px] leading-relaxed text-[#4A5568]">{f.desc}</p>
              </motion.div>
            )
          })}
        </motion.section>

        {/* ── agentic ai capabilities ── */}
        <section className="flex flex-col gap-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-1.5 text-center"
          >
            <p className="font-mono-jb text-[10px] uppercase tracking-[0.18em] text-[#3A4455]">autonomous intelligence</p>
            <h2 className="font-inter text-xl font-semibold tracking-[-0.02em] text-[#DEE4EE]">
              Agentic AI Capabilities
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {[
              { icon: Brain, title: "Query Rewriting", desc: "Analyzes conversation history to craft optimized, standalone search queries that capture true intent.", accent: "#9D7CFF" },
              { icon: Shield, title: "Self-Reflection", desc: "An internal supervisor evaluates each answer for hallucinations and relevance, re-generating if needed.", accent: "#34d399" },
              { icon: Globe, title: "Web Search Fallback", desc: "When documents don't have the answer, the agent autonomously searches the web via Tavily.", accent: "#f97316" },
              { icon: RefreshIcon, title: "Auto-Improvement", desc: "Detects low-confidence answers and re-queries with rewritten prompts until quality passes.", accent: "#f59e0b" },
            ].map((item) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -3 }}
                  className="flex items-start gap-4 rounded-xl border border-[#1C2230] bg-[#0D1117] p-5 transition-colors hover:border-[#2C3545]"
                >
                  <div className="mt-0.5 rounded-lg p-2" style={{ background: `${item.accent}12`, border: `0.5px solid ${item.accent}30` }}>
                    <Icon className="h-4 w-4" style={{ color: item.accent }} />
                  </div>
                  <div>
                    <p className="font-inter text-[14px] font-medium text-[#DEE4EE]">{item.title}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-[#4A5568]">{item.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </section>

        {/* ── action cards ── */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
            <Link
              href="/chat"
              className="glass-card glow-violet group flex flex-col gap-3 rounded-2xl p-6 transition-all hover:-translate-y-0.5"
            >
              <span className="font-mono-jb text-[10px] tracking-[0.14em] text-[#9D7CFF]">$ chat</span>
              <MessageSquare className="h-6 w-6 text-[#9D7CFF] transition-transform group-hover:scale-110" />
              <div>
                <p className="font-inter text-[17px] font-medium text-[#DEE4EE]">Chat</p>
                <p className="mt-1 text-[13px] text-[#4A5568]">Ask questions over your documents</p>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
            <Link
              href="/upload"
              className="glass-card glow-teal group flex flex-col gap-3 rounded-2xl p-6 transition-all hover:-translate-y-0.5"
            >
              <span className="font-mono-jb text-[10px] tracking-[0.14em] text-[#3FC9B5]">$ upload</span>
              <Upload className="h-6 w-6 text-[#3FC9B5] transition-transform group-hover:scale-110" />
              <div>
                <p className="font-inter text-[17px] font-medium text-[#DEE4EE]">Upload</p>
                <p className="mt-1 text-[13px] text-[#4A5568]">Index PDFs, DOCX, or plain text</p>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
            <Link
              href="/dashboard"
              className="glass-card group flex flex-col gap-3 rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:border-[rgba(245,158,11,0.35)]"
            >
              <span className="font-mono-jb text-[10px] tracking-[0.14em] text-[#f59e0b]">$ dashboard</span>
              <Activity className="h-6 w-6 text-[#f59e0b] transition-transform group-hover:scale-110" />
              <div>
                <p className="font-inter text-[17px] font-medium text-[#DEE4EE]">Dashboard</p>
                <p className="mt-1 text-[13px] text-[#4A5568]">View agent reasoning traces</p>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* ── footer ── */}
        <footer
          className="text-center font-mono-jb text-[11px] tracking-[0.08em] text-[#2E3847]"
          style={{ borderTop: "0.5px solid #0F1520", paddingTop: 20 }}
        >
          hybrid retrieval engine · v0.1
        </footer>
      </div>
    </main>
  )
}
