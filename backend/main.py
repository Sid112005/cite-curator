"""FastAPI server for SBERT paper recommendations."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.engine import engine

app = FastAPI(title="Cite Curator Recommendations", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendRequest(BaseModel):
    query: str = Field(..., min_length=1)
    top_n: int = Field(5, ge=1, le=50)


@app.on_event("startup")
def _startup() -> None:
    engine.ensure_loaded()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/stats")
def stats() -> dict:
    try:
        return engine.get_stats()
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/recommend")
def recommend(body: RecommendRequest) -> dict:
    try:
        recommendations = engine.get_recommendations(body.query.strip(), body.top_n)
        return {"recommendations": recommendations}
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
