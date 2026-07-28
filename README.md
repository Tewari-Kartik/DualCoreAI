<div align="center">
  <a href="https://dual-core-kqz2zzobs-tewarikartik007-9205s-projects.vercel.app/">
    <img src="https://img.shields.io/badge/🟢_Live_Demo-10B981?style=for-the-badge" alt="Live Demo" />
  </a>
  <a href="https://fastapi.tiangolo.com/">
    <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  </a>
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  </a>
  <a href="https://huggingface.co/">
    <img src="https://img.shields.io/badge/HuggingFace-F9AB00?style=for-the-badge&logo=huggingface&logoColor=white" alt="HuggingFace" />
  </a>
  <a href="https://groq.com/">
    <img src="https://img.shields.io/badge/Groq-f55036?style=for-the-badge" alt="Groq" />
  </a>
  <a href="https://railway.app/">
    <img src="https://img.shields.io/badge/Railway-131415?style=for-the-badge&logo=railway&logoColor=white" alt="Railway" />
  </a>
  <a href="https://vercel.com/">
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  </a>
</div>

<br/>

# 🚀 Multi-Agent Hybrid RAG Pipeline

A production-ready, full-stack **Hybrid Retrieval-Augmented Generation (RAG)** application powered by a sophisticated multi-agent orchestration engine. This architecture dynamically fuses dense vector retrieval with sparse keyword searching (BM25), managed by a self-reflecting, multi-stage autonomous AI system.

The system is built to eliminate AI hallucinations, optimize search precision via continuous evaluation, and stream real-time insights back to a high-performance Next.js frontend UI.

🔗 **Live Application UI:** [Hybrid RAG on Vercel](https://dual-core-kqz2zzobs-tewarikartik007-9205s-projects.vercel.app/)

---

## 🧠 The 6-Agent AI Architecture

Our system steps away from standard linear RAG pipelines. Instead, it utilizes six specialized, collaborative AI agents orchestrated through a central coordinator.

1. 🧠 **Orchestrator Agent:** The central brain. It classifies user intent, builds the step-by-step execution plan, coordinates all other agents, and handles dynamic re-routing when validation fails.
2. 🔍 **Query Analyst:** Rather than directly searching what the user typed, this agent analyzes conversation history and rewrites ambiguous queries into standalone, highly-optimized search vectors.
3. 🗄️ **Retrieval Strategist:** Executes the data fetching. It merges Dense Vector Search (via FAISS/HuggingFace Embeddings) and Sparse Lexical Search (BM25), combining them intelligently using Reciprocal Rank Fusion (RRF).
4. ✨ **Synthesis Agent:** Driven by Llama 3.1 via Groq. It reads through the context provided by the retrieval layer and constructs a fluent, grounded answer that natively sites its sources.
5. 🛡️ **Critic Agent:** The hallucination guardrail. It evaluates the generated answer strictly against the source context. If the answer fails its quality thresholds (CRAG validation), it blocks the response and triggers fallback measures.
6. 🌐 **Web Researcher:** The ultimate fallback. If the local documents lack sufficient information (and the Critic Agent flags the response), this agent autonomously reaches out to the live web via Tavily to synthesize a fresh, accurate answer.

---

## 💻 The Frontend Experience

We provide a beautiful, responsive, and intuitive interface to watch the AI think.

* **Real-time SSE Streaming:** As the orchestrator passes data between agents, Server-Sent Events (SSE) immediately push timeline updates directly to your screen before a single word of the answer is generated.
* **Agent Reasoning Timeline:** Watch the AI's "thought process" unfold. A dynamic UI timeline logs every task, showing you exactly how long each agent took, which models they used, and the decisions they made.
* **Source Transparency:** See exactly where the AI got its answer. Dynamic source cards visually break down which documents were referenced, along with retrieval confidence scores.
* **Premium Glassmorphism:** Designed with Framer Motion, modern Tailwind CSS tokens, and deep aesthetic polish for a truly next-generation feel.

---

## 📁 Repository Structure

```text
hybrid_rag/
├── backend/                       ── FastAPI Multi-Agent Engine
│   ├── main.py                    ── Entry Point & CORS Setup
│   ├── requirements.txt           ── Python Dependencies
│   ├── api/                       ── REST Endpoints
│   │   └── routes/
│   │       ├── chat.py            ── SSE Generator for Agent Pipeline
│   │       └── upload.py          ── Document Ingestion
│   ├── agents/                    ── The AI Brains
│   │   ├── orchestrator.py        ── Multi-Agent Coordinator
│   │   ├── query_rewriter.py      ── The Query Analyst
│   │   ├── retrieval_strategist.py── RRF Executor
│   │   ├── synthesis.py           ── Answer Generator
│   │   ├── self_reflection.py     ── The Critic (CRAG)
│   │   └── web_researcher.py      ── Tavily Fallback Search
│   └── retrieval/                 ── Vector Store Logic
│       ├── embeddings.py          ── HuggingFace FastEmbed (BGE)
│       └── vector_store.py        ── FAISS
│
└── frontend/                      ── Next.js 14 App Router UI
    ├── package.json               
    ├── tailwind.config.ts         ── Design System
    └── src/
        ├── app/                   
        │   ├── chat/              ── Real-time SSE Chat Interface
        │   ├── agents/            ── Agent Identity Showcase
        │   └── upload/            ── Drag-and-drop document ingestion
        ├── components/
        │   ├── chat/              
        │   │   ├── AgentTimeline.tsx ── Visualizes Agent Execution
        │   │   └── SourceCards.tsx   ── Displays RRF Confidence
        │   └── ui/                   ── Navbar, Buttons, Animations
        └── lib/
            └── api.ts             ── Fetch & SSE Handlers
```

---

## ⚡ Quick Start & Installation

### Backend Setup (FastAPI)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a Python virtual environment:
```bash
# Recommended to use uv for faster dependency resolution
uv venv .venv
# Activate on Windows:
.venv\Scripts\activate
# Activate on Mac/Linux:
source .venv/bin/activate
```

3. Install dependencies:
```bash
uv pip install -r requirements.txt
```

4. Configure environment variables in a `.env` file within the `backend/` root:
```env
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
```

5. Spin up the development server:
```bash
python main.py
# Runs on http://0.0.0.0:8080
```

### Frontend Setup (Next.js 14)

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install the necessary node packages:
```bash
npm install
```

3. Configure the local environment values inside `.env.local`:
```env
# Point to your local backend port
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

4. Start the localized Next.js development build:
```bash
npm run dev
# Runs on http://localhost:3000
```

---

## 🌐 Cloud Deployment Infrastructure

* **Frontend Hosting:** [Vercel](https://vercel.com) — Configured with automated deployment webhooks synchronized with repository pushes.
* **Backend Hosting:** [Railway](https://railway.app) — Packaged and run via optimized configurations using dynamic host-port binding mapping to production gateways.

---

<div align="center">
  <b>Built with ❤️ by Kartik Tewari</b><br><br>
  FastAPI • Next.js 14 • Groq • Llama 3.1 • Tavily • Framer Motion
</div>
