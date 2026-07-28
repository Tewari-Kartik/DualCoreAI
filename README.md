<div align="center">
  <img src="https://img.shields.io/badge/DualCore_AI-080B11?style=for-the-badge&logo=openai&logoColor=white" alt="DualCore AI Logo" />
  <br>
  <h1>🔮 DualCore AI: The Agentic Hybrid RAG Engine</h1>
  <p><i>A next-generation, self-reflecting, multi-agent AI system designed to eliminate hallucinations through orchestrated reasoning and hybrid retrieval.</i></p>

  <a href="https://dual-core-kqz2zzobs-tewarikartik007-9205s-projects.vercel.app/">
    <img src="https://img.shields.io/badge/🟢_Live_Demo_on_Vercel-10B981?style=for-the-badge" alt="Live Demo" />
  </a>
  <a href="https://render.com/">
    <img src="https://img.shields.io/badge/Backend_on_Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render" />
  </a>
  <a href="https://fastapi.tiangolo.com/">
    <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  </a>
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  </a>
</div>

<br>

Welcome to **DualCore AI**, a highly experimental and powerful approach to Retrieval-Augmented Generation (RAG). 

Standard RAG architectures suffer from a critical flaw: they rely on a single, linear pipeline and a monolithic LLM call. When the retrieval fails, or the model misunderstands the context, the system hallucinates. 

DualCore AI solves this by delegating the cognitive workload to **a symphony of 6 autonomous AI agents**. These agents debate, research, critique, and synthesize information in real-time, completely eliminating hallucinations and delivering verifiable truth directly to a stunning, highly responsive frontend interface.

---

## 🎨 The Frontend: Making the Invisible Visible

We believe that interacting with advanced AI shouldn't feel like typing into a black box. The frontend of DualCore AI is engineered to expose the underlying agentic reasoning to the user in real-time.

### Tech Stack & Architecture
- **Framework:** Next.js 14 (App Router) combined with React and strict TypeScript.
- **Styling:** TailwindCSS utilized for highly customized, responsive design tokens.
- **Animations:** Powered by Framer Motion. We use staggered variants, layout transitions, and precise spring physics to create an interface that feels alive and tactile.

### Key Innovations
- **Server-Sent Events (SSE) Streaming:** We do not wait 15 seconds for the final Llama 3.1 generation to complete. The Next.js client establishes an open HTTP stream to the FastAPI backend. As each of the 6 agents finishes their localized sub-task, the UI instantly renders a **Dynamic Reasoning Timeline**. You literally watch the orchestrator delegate tasks, the critic evaluate answers, and the web researcher scour the internet.
- **Glassmorphism Aesthetic:** The UI features a premium, hyper-modern dark mode. It leverages `backdrop-blur`, frosted glass overlays, and subtle radial gradient lighting that reacts dynamically to the state of the AI pipeline. 
- **Source Card Transparency:** Every generated answer is paired with dynamic RRF (Reciprocal Rank Fusion) source cards. These cards show exactly which chunks of which documents were referenced, alongside their raw algorithmic confidence scores (e.g., `87% Match`).

---

## ⚙️ The Backend: The High-Performance Gateway

The backend isn't just a basic API wrapper; it is a high-performance orchestration gateway designed for heavy parallel processing and strict state management.

### Tech Stack & Architecture
- **Framework:** FastAPI running on Uvicorn. Completely asynchronous (`async`/`await`) to prevent blocking during intensive I/O operations (like querying Groq or Tavily).
- **Generator Pipelines:** Every route natively yields data via `StreamingResponse`, pushing `data: {}` JSON blocks to the frontend the exact millisecond a LangGraph node executes.

### The Hybrid Retrieval Engine (The "Hybrid" in Hybrid RAG)
Vector databases alone aren't enough. They capture semantic meaning (e.g., matching "puppy" with "dog"), but they fail miserably at exact keyword matching (e.g., searching for a specific product serial number like "XJ-9200-B"). DualCore AI utilizes a dual-engine approach:

1. **Dense Vector Search:** Uses HuggingFace FastEmbed (`BAAI/bge-small-en-v1.5`) and FAISS. It converts documents into 384-dimensional dense arrays to understand the *semantic meaning* and conceptual overlap of a query.
2. **Sparse Lexical Search:** Uses BM25 (Best Matching 25), a bag-of-words retrieval function that perfectly matches *exact keywords*, acronyms, and specific names by analyzing term frequency-inverse document frequency (TF-IDF).
3. **Reciprocal Rank Fusion (RRF):** The results from the Dense and Sparse engines are mathematically merged using the RRF algorithm. If a document ranks highly in *both* semantic meaning and exact keyword match, it is propelled to the top of the context window.

---

## 🤖 The GenAI: A 6-Agent Ecosystem

At the core of DualCore AI is a LangGraph-inspired, multi-agent state machine. The LLM (Llama 3.1 via Groq) is given distinct, isolated "personas" (system prompts) to tackle different parts of the problem. This compartmentalization prevents context-window degradation and allows for hyper-specialized instruction following.

### 1. 🧠 The Orchestrator
The central coordinator. It receives your raw query, classifies the intent, and maps out a sequence of operations. It acts as the routing node in the directed acyclic graph (DAG), deciding *which* agents need to be activated and in what order based on the user's input.

### 2. 🔍 The Query Analyst
Users rarely ask perfect questions. If a user asks *"How does it work?"*, a standard RAG system will search the database for "How does it work" and fail. The Analyst Agent looks at your conversation history and rewrites your vague question into a mathematically optimized search query (e.g., *"Mechanism of Reciprocal Rank Fusion in Vector Databases"*).

### 3. 🗄️ The Retrieval Strategist
The librarian. It takes the optimized query, executes the Hybrid RAG search against the local documents, scores the chunks, strips out irrelevant noise, and packages the verified context window for the synthesis layer.

### 4. ✨ The Synthesis Agent
The writer. Armed with Llama 3.1, this agent weaves the retrieved context into a clear, concise, and highly readable answer. It is strictly prompted to utilize native citations, ensuring every claim maps back to a specific document chunk.

### 5. 🛡️ The Critic Agent
The immune system. Before you ever see the answer, the Critic Agent executes a **Corrective RAG (CRAG)** evaluation. It reads the Synthesis Agent's generated answer, compares it side-by-side to the source context, and grades it for factual grounding. If it detects a lie, hallucination, or unsupported claim, it throws out the answer entirely, alerts the Orchestrator, and demands a rewrite or fallback.

### 6. 🌐 The Web Researcher
The ultimate fallback plan. If your local documents do not contain the answer (and the Critic flags the response as ungrounded), the Web Researcher is activated. It autonomously hits the live internet via **Tavily**, scrapes top results, summarizes the external data, and writes a fresh, accurate answer.

---

## 🚀 Deployment Architecture

This project is structured as a decoupled full-stack monorepo, perfectly optimized for modern serverless and containerized cloud infrastructure:

- 🖥️ **Frontend (UI):** Deployed on **Vercel**. Leverages edge-network caching, global CDN distribution, and serverless edge functions for sub-50ms TTFB (Time to First Byte).
- ⚙️ **Backend (API):** Deployed on **Render** as a high-performance Dockerized FastAPI web service. It handles the heavy computational load of embedding generation (via FastEmbed) and maintains the persistent state for the LangGraph agent mesh.

---

## 🛠️ Local Development Guide

Want to run the multi-agent hive mind on your own machine? Follow these steps to spin up the entire stack locally.

### 1. Prerequisites
- Python 3.11+
- Node.js 18+
- [uv](https://github.com/astral-sh/uv) (Extremely fast Python package installer)

### 2. Start the Backend
Navigate to the backend directory and set up your virtual environment:

```bash
cd backend
uv venv .venv

# Activate on Windows:
.venv\Scripts\activate
# Activate on Mac/Linux:
source .venv/bin/activate

# Install dependencies blazing fast
uv pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory and add your API keys:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
TAVILY_API_KEY=tvly-your_tavily_api_key_here
```

Launch the FastAPI server:
```bash
python main.py
# The backend will start on http://0.0.0.0:8080
```

### 3. Start the Frontend
Open a new terminal window, navigate to the frontend directory, and install the Node packages:

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory to point Next.js to your local backend:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Launch the Next.js development server:
```bash
npm run dev
# The frontend will start on http://localhost:3000
```

Visit `http://localhost:3000` in your browser to interact with the agents!

---

## 📈 Future Roadmap & Scalability

While currently a fully functional prototype, DualCore AI is designed to scale into a production-grade enterprise system. Planned upgrades include:

- **Redis Session Persistence:** Moving LangGraph state out of local memory into Redis for multi-worker scaling and cross-device session continuity.
- **AgentOps Observability:** Injecting AgentOps decorators to trace token usage, latency bottlenecks, and exact API costs per LLM call.
- **Dockerization:** Fully containerizing both the Next.js frontend and FastAPI backend into a single `docker-compose.yml` for unified local deployment and cloud scaling.

<br>

<div align="center">
  <i>Designed and developed by Kartik Tewari.</i><br>
  <b>Empowering the next generation of intelligent software.</b>
</div>
