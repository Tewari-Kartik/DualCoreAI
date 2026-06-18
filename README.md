# 🚀 Hybrid RAG Agentic Pipeline

A production-ready, full-stack **Hybrid Retrieval-Augmented Generation (RAG)** application. This architecture fuses dense vector retrieval with sparse keyword searching (BM25), managed dynamically via an autonomous routing and self-reflection system to deliver precise, context-grounded AI responses with live web-search failovers.

🔗 **Live Application UI:** [Hybrid RAG on Vercel](https://dual-core-kqz2zzobs-tewarikartik007-9205s-projects.vercel.app/)

---

## 🏗️ System Architecture & Workflow

The platform leverages an advanced orchestration engine designed to optimize retrieval accuracy and eliminate model hallucinations.

```text
[User Query] ──> [Query Rewriter] ──> [Hybrid Router]
                                             │
             ┌───────────────────────────────┴───────────────────────────────┐
             ▼                                                               ▼
   [Traditional RAG]                                                 [Vectorless RAG]
  ├── Dense: HuggingFace BGE Embeddings                            └── In-Context Groq Pipeline
  └── Sparse: BM25 Keyword Search
             │
             ▼
   [Reciprocal Rank Fusion (RRF)] ──> [Self-Reflection Loop] ──> [Success] ──> [Response]
                                             │
                                      (If Hallucination / Missing Data)
                                             │
                                             ▼
                               [Autonomous Tavily Web Search] ───────────────> [Response]
```

1. **Query Optimization:** Raw user messages are intercepted by a LangChain-powered rewriter that factors in context history to generate optimized search terms.
2. **Hybrid & Vectorless Routing:** Queries are dynamically executed via custom dense (FAISS/ChromaDB via HuggingFace BGE) and sparse (BM25) search indices, merged using Reciprocal Rank Fusion (RRF).
3. **Self-Reflection Pipeline:** Generated outputs pass through an automated Corrective RAG (CRAG) grader. If the response reveals missing context or down-stream hallucinations, the engine bypasses local documents and triggers an autonomous live search fallback via **Tavily**.

---

## 📁 Repository Structure

```text
hybrid_rag/                        ── Monorepo Root
├── .env                           ── Main Environment Configuration
├── .gitignore                     ── Git Exclusions (.env, data directories)
├── README.md                      ── Project Documentation
│
├── backend/                       ── FastAPI Application Backend (Port 8000)
│   ├── main.py                    ── Entry Point & Core Route Registration
│   ├── config.py                  ── Pydantic BaseSettings Interface
│   ├── requirements.txt           ── Python Requirements Matrix
│   │
│   ├── api/                       ── App Interface Layers
│   │   ├── schemas.py             ── Pydantic Validation Schemas
│   │   └── routes/                ── API Endpoint Route Handlers (Chat, Upload, Memory)
│   │
│   ├── core/                      ── Orchestration Engine
│   │   ├── traditional_rag.py     ── Dense + Sparse Index Pipelines
│   │   ├── vectorless_rag.py      ── In-Context Groq Pipeline
│   │   └── hybrid_router.py       ── Pipeline Decision Router
│   │
│   ├── retrieval/                 ── Vector & Keyword Indexes
│   │   ├── embeddings.py          ── HuggingFace BGE Setup
│   │   ├── vector_store.py        ── FAISS / ChromaDB Wrappers
│   │   ├── bm25_retriever.py      ── Sparse Retrieval Core
│   │   └── hybrid_search.py       ── RRF Combination Logic
│   │
│   ├── agents/                    ── Logic & Evaluation Layers
│   │   ├── react_agent.py         ── ReAct Tool Execution Logic
│   │   ├── langgraph_flow.py      ── State-Machine Graph Processing
│   │   └── self_reflection.py     ── CRAG Validation & Grading Loops
│   │
│   └── data/                      ── Local Persistence Storage (Generated at Runtime)
│       ├── uploads/               ── Source Document Files
│       └── vector_store/          ── FAISS / Chroma DB Serializations
│
└── frontend/                      ── Next.js 14 Web UI App (Port 3000)
    ├── package.json               ── Node Module Configuration
    ├── src/
        ├── app/                   ── Next.js App Router Structure (/, /chat, /upload)
        ├── components/            ── UI & Chat Presentation Layer Components
        ├── lib/                   ── Typed Fetch API Service Handler
        └── hooks/                 ── Specialized Chat State & Management Hooks
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
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in a `.env` file within the `backend/` root directory:
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
  <b>Built with ❤️ by Kartik Tewari </b><br>
  FastAPI • Next.js 14 • LangChain • HuggingFace • Groq • Tavily
</div>
