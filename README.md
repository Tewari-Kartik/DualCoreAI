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
  <a href="https://github.com/langchain-ai/langgraph">
    <img src="https://img.shields.io/badge/LangGraph-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" alt="LangGraph" />
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

# 🚀 Hybrid RAG Agentic Pipeline

A production-ready, full-stack **Hybrid Retrieval-Augmented Generation (RAG)** application. This architecture fuses dense vector retrieval with sparse keyword searching (BM25), managed dynamically via an autonomous routing and self-reflection system to deliver precise, context-grounded AI responses with live web-search failovers.

🔗 **Live Application UI:** [Hybrid RAG on Vercel](https://dual-core-kqz2zzobs-tewarikartik007-9205s-projects.vercel.app/)

---

## 🧠 System Architecture & Workflow

The platform leverages an advanced orchestration engine designed to optimize retrieval accuracy and eliminate model hallucinations.

```text
┌─────────────────────────────────────────────────────────────┐
│                   Guardrails + LLM Gateway                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                Query Enhancement Layer                │  │
│  │   HyDE · Step-back · Multi-query · Decomposition      │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │                                 │
│              ┌────────────▼────────────┐                    │
│              │    ReAct Agent Router   │                    │
│              └──────┬──────────┬───────┘                    │
│                     │          │                            │
│         ┌───────────▼──┐  ┌────▼─────────────┐              │
│         │ Traditional  │  │   Vectorless RAG │              │
│         │     RAG      │  │  (Groq in-ctx)   │              │
│         │              │  │                  │              │
│         │ HF Embeddings│  │ Token-size guard │              │
│         │ FAISS/Chroma │  │ Auto-route back  │              │
│         │ BM25 + RRF   │  │ if too large     │              │
│         └──────┬───────┘  └────────┬─────────┘              │
│                └─────────┬─────────┘                        │
│                          │                                  │
│         ┌────────────────▼──────────────────────┐           │
│         │        LangGraph Orchestration        │           │
│         │  Self-reflection · CoT · Re-rank      │           │
│         │  Multi-source synthesis · Grading     │           │
│         └────────────────┬──────────────────────┘           │
│                          │                                  │
│              ┌───────────▼───────────┐                      │
│              │    Answer Synthesis   │                      │
│              │  Groq · Citations     │                      │
│              │  Confidence scoring   │                      │
│              └───────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

1. **Query Optimization:** Raw user messages are intercepted by a LangChain-powered rewriter that factors in context history to generate optimized search terms.
2. **Hybrid & Vectorless Routing:** Queries are dynamically executed via custom dense (FAISS/ChromaDB via HuggingFace BGE) and sparse (BM25) search indices, merged using Reciprocal Rank Fusion (RRF).
3. **Self-Reflection Pipeline:** Generated outputs pass through an automated Corrective RAG (CRAG) grader. If the response reveals missing context or down-stream hallucinations, the engine bypasses local documents and triggers an autonomous live search fallback via **Tavily**.

---

## 📁 Repository Structure

```text
hybrid_rag/                        ── Monorepo Root
├── .env                           ── Main Environment Configuration
├── .gitignore                     ── Git Exclusions
├── README.md                      ── Project Documentation
│
├── backend/                       ── FastAPI Backend (Port 8000)
│   ├── main.py                    ── Entry Point & Routes
│   ├── config.py                  ── Pydantic BaseSettings
│   ├── requirements.txt           ── Python Requirements
│   │
│   ├── api/                       ── App Interface
│   │   ├── schemas.py             ── Pydantic Models
│   │   └── routes/                ── API Endpoints
│   │
│   ├── core/                      ── Orchestration Engine
│   │   ├── traditional_rag.py     ── Dense + Sparse Index
│   │   ├── vectorless_rag.py      ── In-Context Groq
│   │   └── hybrid_router.py       ── Pipeline Decision
│   │
│   ├── retrieval/                 ── Vector & Keyword Indexes
│   │   ├── embeddings.py          ── HuggingFace BGE Setup
│   │   ├── vector_store.py        ── FAISS / ChromaDB
│   │   ├── bm25_retriever.py      ── Sparse Retrieval
│   │   └── hybrid_search.py       ── RRF Combination
│   │
│   ├── agents/                    ── Logic & Evaluation
│   │   ├── react_agent.py         ── ReAct Tool Execution
│   │   ├── langgraph_flow.py      ── State-Machine Graph
│   │   └── self_reflection.py     ── CRAG Validation
│   │
│   └── data/                      ── Local Persistence Storage
│       ├── uploads/               ── Source Document Files
│       └── vector_store/          ── FAISS / Chroma DB
│
└── frontend/                      ── Next.js 14 UI (Port 3000)
    ├── package.json               ── Node Configuration
    └── src/
        ├── app/                   ── Next.js App Router
        ├── components/            ── UI Components
        ├── lib/                   ── API Service Handler
        └── hooks/                 ── Chat State Hooks
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
python -m venv venv
source venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Configure environment variables in a `.env` file within the `backend/` root:

```env
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
PORT=8000
```

5. Spin up the development server:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
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
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

4. Start the localized Next.js development build:

```bash
npm run dev
```

---

## 🌐 Cloud Deployment Infrastructure

* **Frontend Hosting:** [Vercel](https://vercel.com) — Configured with automated deployment webhooks synchronized with repository pushes.
* **Backend Hosting:** [Railway](https://railway.app) — Packaged and run via optimized `railway.json` configurations using dynamic host-port binding mapping to production gateways.

---

<div align="center">
  <b>Built with ❤️ by Kartik Tewari</b><br><br>
  FastAPI • Next.js 14 • LangChain • HuggingFace • Groq • Tavily
</div>
