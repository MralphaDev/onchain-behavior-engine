# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.router import api_router

app = FastAPI(
    title="Blockchain Graph Analysis API",
    version="0.1"
)

# 🔥 ADD THIS (CORS FIX)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev-only: allows everything
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "backend running"}

