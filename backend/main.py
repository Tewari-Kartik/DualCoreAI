from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import health, chat ,upload



app = FastAPI(title="Hybrid RAG API")

# Allow the Next.js frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register our routes
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(upload.router, prefix="/api", tags=["upload"])

@app.on_event("startup")
async def startup():
    print("🚀 Hybrid RAG API started on http://localhost:8000")