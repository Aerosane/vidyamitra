"""VidyaMitra API - Optimized for 1GB RAM VPS"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings

# Shared HTTP client for LLM calls (reused across requests)
_http_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle - manage shared resources"""
    global _http_client
    import httpx
    _http_client = httpx.AsyncClient(
        timeout=60,
        limits=httpx.Limits(max_connections=10, max_keepalive_connections=5)
    )
    yield
    await _http_client.aclose()

def get_http_client():
    return _http_client

app = FastAPI(
    title="VidyaMitra API",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url=None,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes import api_router
app.include_router(api_router, prefix=settings.API_PREFIX)


@app.get("/")
async def root():
    return {"status": "ok", "service": "VidyaMitra API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        workers=1,
        reload=settings.DEBUG,
        access_log=False,
        limit_concurrency=20,
        timeout_keep_alive=5
    )
