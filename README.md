<div align="center">

<br/>

# 🧠 Hybrid RAG

The world's smartest documents don't just sit there — they think back.

<br/>
![Live Demo](https://dual-core-7o7atvpgn-tewarikartik007-9205s-projects.vercel.app/)
![FastAPI](https://fastapi.tiangolo.com/)
![Next.js](https://nextjs.org/)
![LangGraph](https://github.com/langchain-ai/langgraph)
![Groq](https://groq.com/)
![HuggingFace](https://huggingface.co/)
<br/>
> \*\*Hybrid RAG\*\* is not just another chatbot over your documents.  
> It is a fully autonomous reasoning system that dynamically chooses \*how\* to retrieve,  
> \*reflects\* on whether it retrieved well enough, and \*synthesises\* answers from multiple sources —  
> all while remembering who you are and what you've asked before.
<br/>
</div>
---
✦ What makes this different
Most RAG systems retrieve → generate. Done.  
Hybrid RAG retrieves → grades → reflects → re-retrieves if needed → synthesises → responds.  
And it does this across two fundamentally different retrieval architectures at once.
Capability	Typical RAG	Hybrid RAG
Dense vector search	✅	✅
Sparse keyword search (BM25)	❌	✅
Hybrid fusion (RRF)	❌	✅
In-context retrieval (vectorless)	❌	✅
Auto-routing between strategies	❌	✅
Self-reflection + re-retrieval	❌	✅
Chain-of-thought reasoning	❌	✅
ReAct agent architecture	❌	✅
Persistent memory (short + long term)	❌	✅
Input / output guardrails	❌	✅
Citation with confidence scores	❌	✅
---
⚡ Live Demo
→ Open Hybrid RAG
Upload a PDF or DOCX, ask a question, and watch the system decide in real time whether to use dense retrieval, sparse retrieval, or direct in-context processing — and show you exactly which sources it used and how confident it is.
---
🧠 Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Guardrails + LLM Gateway                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │               Query Enhancement Layer                  │  │
│  │   HyDE · Step-back · Multi-query · Decomposition      │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │                                  │
│              ┌────────────▼────────────┐                    │
│              │    ReAct Agent Router    │                    │
│              └──────┬──────────┬───────┘                    │
│                     │          │                             │
│         ┌───────────▼──┐  ┌───▼──────────────┐             │
│         │ Traditional  │  │   Vectorless RAG  │             │
│         │     RAG      │  │  (Groq in-ctx)   │             │
│         │              │  │                  │             │
│         │ HF Embeddings│  │ Token-size guard │             │
│         │ FAISS/Chroma │  │ Auto-route back  │             │
│         │ BM25 + RRF   │  │ if too large     │             │
│         └──────┬───────┘  └───────┬──────────┘             │
│                └─────────┬────────┘                         │
│                          │                                   │
│         ┌────────────────▼──────────────────────┐           │
│         │       LangGraph Orchestration          │           │
│         │  Self-reflection · CoT · Re-rank       │           │
│         │  Multi-source synthesis · Grading      │           │
│         └────────────────┬──────────────────────┘           │
│                          │                                   │
│              ┌───────────▼───────────┐                      │
│              │   Answer Synthesis    │                      │
│              │  Groq · Citations     │                      │
│              │  Confidence scoring   │                      │
│              └───────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```
The two RAG modes
Traditional RAG — for large document corpora  
Converts documents into dense vector embeddings using `BAAI/bge-large-en-v1.5`, stores them in FAISS, and runs hybrid search (dense + BM25 sparse) fused with Reciprocal Rank Fusion. Best for large collections where semantic similarity matters.
Vectorless RAG — for small, sharp contexts  
Passes documents directly into Groq's long-context window (Mixtral 8x7b at 32k tokens). No embedding, no indexing — just pure in-context reasoning. The system automatically routes to Traditional RAG when the token budget is exceeded.
---
🗂️ Project Structure
```
hybrid\_rag/                        ← monorepo root
├── .env
├── .gitignore
├── README.md
│
├── backend/                       ← FastAPI  (runs on :8000)
│   ├── main.py                    entry point, registers all routes
│   ├── config.py                  all settings via pydantic + .env
│   ├── requirements.txt
│   │
│   ├── api/
│   │   ├── schemas.py             all request/response Pydantic models
│   │   └── routes/
│   │       ├── chat.py            POST /api/chat  +  /api/chat/stream
│   │       ├── upload.py          POST /api/upload
│   │       ├── memory.py          GET/DELETE /api/memory/{session}
│   │       └── health.py          GET /api/health
│   │
│   ├── core/                      ← RAG pipelines
│   │   ├── traditional\_rag.py     dense + sparse retrieval pipeline
│   │   ├── vectorless\_rag.py      in-context Groq pipeline
│   │   └── hybrid\_router.py       decides which pipeline to call
│   │
│   ├── retrieval/                 ← search layer
│   │   ├── embeddings.py          HuggingFace BGE embeddings
│   │   ├── vector\_store.py        FAISS / ChromaDB wrapper
│   │   ├── bm25\_retriever.py      sparse keyword search
│   │   └── hybrid\_search.py       RRF fusion of dense + sparse
│   │
│   ├── agents/                    ← autonomous reasoning
│   │   ├── react\_agent.py         ReAct tool-use agent
│   │   ├── langgraph\_flow.py      state machine / graph
│   │   └── self\_reflection.py     CRAG-style grading + retry
│   │
│   ├── memory/                    ← persistence
│   │   ├── short\_term.py          conversation buffer
│   │   └── long\_term.py           vector-based episodic memory
│   │
│   ├── guardrails/
│   │   └── gateway.py             input/output validation
│   │
│   └── data/                      auto-created at runtime
│       ├── uploads/
│       ├── vector\_store/
│       └── chroma\_db/
│
└── frontend/                      ← Next.js 14  (runs on :3000)
    ├── package.json
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── next.config.ts
    └── src/
        ├── app/
        │   ├── layout.tsx         root layout, dark theme
        │   ├── page.tsx           landing  →  /
        │   ├── chat/page.tsx      chat UI  →  /chat
        │   └── upload/page.tsx    uploads  →  /upload
        ├── components/
        │   ├── chat/              ChatWindow · MessageBubble · SourceCard · MemoryPanel
        │   ├── upload/            DropZone · FileList
        │   └── ui/                Sidebar · Button · Loader
        ├── lib/api.ts             typed fetch client
        ├── hooks/useChat.ts       chat state hook
        └── types/index.ts         TypeScript types
```
---
🛠️ Tech Stack
Layer	Technology
LLM inference	Groq — LLaMA 3.3 70B · Mixtral 8x7b · LLaMA 3.1 8B
Embeddings	HuggingFace — `BAAI/bge-large-en-v1.5`
Vector store	FAISS (local) · ChromaDB (persistent)
Sparse search	BM25 via `rank-bm25`
Fusion	Reciprocal Rank Fusion (RRF)
Agent framework	LangChain + LangGraph
Query enhancement	HyDE · Step-back · Multi-query · Decomposition
Self-reflection	CRAG-style document grading
Memory	Short-term buffer + long-term vector episodic store
Guardrails	Guardrails AI + NEMO Guardrails
Backend	FastAPI + Uvicorn
Frontend	Next.js 14 (App Router) + Tailwind CSS
Deployment	Vercel (frontend)
---
🚀 Getting Started
Prerequisites
Python 3.11+
Node.js 18+
A Groq API key (free tier available)
A HuggingFace token
1 — Clone
```bash
git clone https://github.com/YOUR\_USERNAME/hybrid-rag.git
cd hybrid-rag
```
2 — Backend
```bash
cd backend
python -m venv venv

# Windows
venv\\Scripts\\activate
# Mac / Linux
source venv/bin/activate

pip install -r requirements.txt
```
Copy the example env file and fill in your keys:
```bash
cp .env.example .env
```
```env
GROQ\_API\_KEY=your\_groq\_api\_key
HUGGINGFACE\_API\_TOKEN=your\_hf\_token
```
Start the API:
```bash
uvicorn main:app --reload --port 8000
```
API docs auto-available at http://localhost:8000/docs
3 — Frontend
```bash
cd ../frontend
npm install
```
```bash
# .env.local
NEXT\_PUBLIC\_API\_URL=http://localhost:8000/api
```
```bash
npm run dev
```
Open http://localhost:3000 🎉
---
🔌 API Reference
Method	Endpoint	Description
`POST`	`/api/chat`	Send a message, get a RAG-grounded response
`POST`	`/api/chat/stream`	Same but streaming (SSE)
`POST`	`/api/upload`	Upload and index a document
`GET`	`/api/memory/{session\_id}`	Retrieve conversation history
`DELETE`	`/api/memory/{session\_id}`	Clear session memory
`GET`	`/api/health`	Service health check
Example request
```bash
curl -X POST http://localhost:8000/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "session\_id": "abc-123",
    "message": "What are the key findings?",
    "mode": "auto"
  }'
```
Example response
```json
{
  "session\_id": "abc-123",
  "answer": "The key findings include...",
  "sources": \[
    {
      "id": "uuid",
      "content": "excerpt from document...",
      "source\_file": "report.pdf",
      "page": 4,
      "score": 0.94,
      "retrieval\_method": "hybrid"
    }
  ],
  "rag\_mode\_used": "traditional",
  "reflection\_loops": 2,
  "confidence": 0.91,
  "tokens\_used": 1024
}
```
---
🗺️ Roadmap
[x] Phase 1 — Project foundation, config, folder structure
[x] Phase 1 — FastAPI backend with all route stubs
[x] Phase 1 — Next.js frontend with chat + upload UI
[ ] Phase 2 — HuggingFace embeddings + FAISS + BM25 + RRF hybrid search
[ ] Phase 3 — Vectorless RAG with Groq + token-size auto-routing
[ ] Phase 4 — Query enhancement (HyDE, step-back, multi-query, decomposition)
[ ] Phase 5 — ReAct agent + LangGraph state machine
[ ] Phase 6 — Self-reflection loop + chain-of-thought (CRAG-style)
[ ] Phase 7 — Persistent short-term + long-term memory
[ ] Phase 8 — Guardrails AI + NEMO input/output validation
---
🤝 Contributing
Pull requests are welcome. For major changes please open an issue first to discuss what you'd like to change.
Fork the repo
Create your branch: `git checkout -b feat/amazing-feature`
Commit: `git commit -m 'add amazing feature'`
Push: `git push origin feat/amazing-feature`
Open a Pull Request
---
📄 License
MIT — see LICENSE for details.
---
<div align="center">
Built with 🧠 by Kartik Tewari
If this project helped you, consider giving it a ⭐
![Star on GitHub](https://github.com/Tewari-Kartik/DualCoreAI)
</div>
