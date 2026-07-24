"use client";

import { motion } from "framer-motion";
import { Brain, Search, Database, Sparkles, ShieldCheck, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";

const agents = [
  {
    name: "Orchestrator",
    role: "Central Coordinator",
    color: "#9D7CFF",
    icon: Brain,
    desc: "The central brain that coordinates all agents. Classifies query intent, builds execution plans, delegates tasks, and handles dynamic re-routing when validation fails.",
    special: true
  },
  {
    name: "Query Analyst",
    role: "Query Optimization",
    color: "#3FC9B5",
    icon: Search,
    desc: "Analyzes conversation context and rewrites ambiguous queries into optimized, standalone search terms for maximum retrieval accuracy."
  },
  {
    name: "Retrieval Strategist",
    role: "Document Fetching",
    color: "#60a5fa",
    icon: Database,
    desc: "Executes the retrieval strategy — dense vector search, BM25 lexical search, or hybrid Reciprocal Rank Fusion — to fetch the most relevant document chunks."
  },
  {
    name: "Synthesis Agent",
    role: "Answer Generation",
    color: "#E8A33D",
    icon: Sparkles,
    desc: "Crafts the final answer by reasoning over retrieved context using the LLM. Handles multi-turn conversations and context window management."
  },
  {
    name: "Critic Agent",
    role: "Quality Control",
    color: "#ef4444",
    icon: ShieldCheck,
    desc: "Evaluates generated answers for hallucination, relevance, and factual grounding. Can trigger re-generation when quality standards aren't met."
  },
  {
    name: "Web Researcher",
    role: "Live Web Search",
    color: "#f97316",
    icon: Globe,
    desc: "Fallback agent that searches the live web via Tavily when local documents lack coverage. Synthesizes answers from web results."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  }
};

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-[#080B11] pt-28 pb-20 selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-zinc-400">System Online</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 font-[family-name:var(--font-inter)]">
            Meet the <span className="bg-gradient-to-r from-[#3FC9B5] to-[#9D7CFF] bg-clip-text text-transparent">Agents</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl text-lg">
            Six specialized AI agents working in concert, orchestrated by a central brain to deliver highly accurate, grounded, and verified answers.
          </p>
        </motion.div>

        {/* Grid Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-24"
        >
          {agents.map((agent, i) => {
            const Icon = agent.icon;
            return (
              <motion.div
                key={agent.name}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className={`relative group rounded-2xl bg-[#0D1117] border border-[#1C2230] p-6 backdrop-blur-xl overflow-hidden ${
                  agent.special ? "lg:col-span-3 md:col-span-2 shadow-[0_0_40px_rgba(157,124,255,0.1)] border-[#9D7CFF]/30" : ""
                }`}
              >
                {/* Background Glow */}
                <div 
                  className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                  style={{ backgroundColor: agent.color }}
                />

                <div className="flex items-start gap-4">
                  <div 
                    className="p-3 rounded-xl flex-shrink-0 relative overflow-hidden"
                    style={{ backgroundColor: `${agent.color}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: agent.color }} />
                    <div className="absolute inset-0 rounded-xl opacity-20" style={{ boxShadow: `inset 0 0 0 1px ${agent.color}` }} />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{agent.name}</h3>
                    <p className="text-xs font-mono mb-3" style={{ color: agent.color }}>{agent.role}</p>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {agent.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Architecture Flow */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="w-full max-w-5xl mb-24"
        >
          <h2 className="text-2xl font-semibold text-center text-white mb-12">Orchestration Pipeline</h2>
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700 text-sm text-zinc-300">User Query</div>
            
            <ArrowRight className="w-4 h-4 text-zinc-600 hidden lg:block" />
            <div className="h-4 w-[1px] bg-zinc-600 lg:hidden" />
            
            <div className="px-4 py-2 rounded-full border bg-[#9D7CFF]/10 border-[#9D7CFF]/30 text-[#9D7CFF] text-sm flex items-center gap-2">
              <Brain className="w-3.5 h-3.5" /> Orchestrator
            </div>
            
            <ArrowRight className="w-4 h-4 text-zinc-600 hidden lg:block" />
            <div className="h-4 w-[1px] bg-zinc-600 lg:hidden" />

            <div className="px-4 py-2 rounded-full border bg-[#3FC9B5]/10 border-[#3FC9B5]/30 text-[#3FC9B5] text-sm flex items-center gap-2">
              <Search className="w-3.5 h-3.5" /> Analyst
            </div>

            <ArrowRight className="w-4 h-4 text-zinc-600 hidden lg:block" />
            <div className="h-4 w-[1px] bg-zinc-600 lg:hidden" />

            <div className="px-4 py-2 rounded-full border bg-[#60a5fa]/10 border-[#60a5fa]/30 text-[#60a5fa] text-sm flex items-center gap-2">
              <Database className="w-3.5 h-3.5" /> Retrieval
            </div>

            <ArrowRight className="w-4 h-4 text-zinc-600 hidden lg:block" />
            <div className="h-4 w-[1px] bg-zinc-600 lg:hidden" />

            <div className="px-4 py-2 rounded-full border bg-[#E8A33D]/10 border-[#E8A33D]/30 text-[#E8A33D] text-sm flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Synthesis
            </div>

            <ArrowRight className="w-4 h-4 text-zinc-600 hidden lg:block" />
            <div className="h-4 w-[1px] bg-zinc-600 lg:hidden" />

            <div className="px-4 py-2 rounded-full border bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444] text-sm flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Critic
            </div>

            <ArrowRight className="w-4 h-4 text-zinc-600 hidden lg:block" />
            <div className="h-4 w-[1px] bg-zinc-600 lg:hidden" />

            <div className="px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700 text-sm text-zinc-300">Response</div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pb-10"
        >
          <Link href="/chat">
            <button className="px-8 py-4 rounded-xl font-medium text-white bg-gradient-to-r from-[#3FC9B5] to-[#9D7CFF] hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(157,124,255,0.4)] flex items-center gap-2">
              Try the Agents <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
