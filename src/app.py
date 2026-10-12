"""
TasteMem - Python Backend & Qloo Gateway Engine
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.qloo_client import QlooClient

app = FastAPI(
    title="TasteMem - Cultural Taste Intelligence",
    description="Backend engine connecting personal taste vaults with Qloo's Cultural AI graph.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

qloo_client = QlooClient()


@app.get("/health")
async def health():
    return {"status": "ok", "app": "TasteMem", "qloo_connected": bool(qloo_client.api_key)}
