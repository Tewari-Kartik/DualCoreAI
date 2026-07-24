import os
import socket

# Sanitize API keys to remove accidental trailing newlines (fixes httpcore.LocalProtocolError)
if "GROQ_API_KEY" in os.environ:
    os.environ["GROQ_API_KEY"] = os.environ["GROQ_API_KEY"].strip()

# Monkeypatch socket.getaddrinfo to force IPv4 (AF_INET) resolution globally.
# This prevents httpx APIConnectionErrors in Docker environments where IPv6 routing is broken.
old_getaddrinfo = socket.getaddrinfo
def new_getaddrinfo(*args, **kwargs):
    responses = old_getaddrinfo(*args, **kwargs)
    return [r for r in responses if r[0] == socket.AF_INET]
socket.getaddrinfo = new_getaddrinfo

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import health, chat, upload, agent_logs

app = FastAPI(title="Hybrid RAG API")

# Use the wildcard "*" to let your Vercel frontend connect without getting blocked
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(agent_logs.router, prefix="/api", tags=["agent-logs"])

@app.on_event("startup")
async def startup():
    print("Hybrid RAG API initialized")

# This block allows the cloud provider to set the port dynamically
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port)