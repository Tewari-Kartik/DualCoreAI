import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import health, chat, upload

app = FastAPI(title="Hybrid RAG API")

# Use the wildcard "*" to let your Vercel frontend connect without getting blocked
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False, # <--- THIS IS THE MAGIC FIX
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(upload.router, prefix="/api", tags=["upload"])

@app.on_event("startup")
async def startup():
    print("🚀 Hybrid RAG API initialized")

# This block allows the cloud provider to set the port dynamically
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)