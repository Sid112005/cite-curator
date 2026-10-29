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
    category: str | None = Field(None, min_length=1)
    year: int | None = Field(None, ge=1, le=9999)


class PaperResponse(BaseModel):
    id: str
    title: str
    abstract: str
    authors: str
    keywords: str
    publication_date: str | None
    arxiv_url: str | None
    pdf_url: str | None


class RecommendationResponse(BaseModel):
    paper: PaperResponse
    score: float


class RecommendResponse(BaseModel):
    recommendations: list[RecommendationResponse]
    message: str | None = None


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
def recommend(body: RecommendRequest) -> RecommendResponse:
    try:
        recommendations = engine.get_recommendations(
            body.query.strip(),
            body.top_n,
            category=body.category,
            year=body.year,
        )
        message = None
        if not recommendations:
            message = "No strong matches found. Try another topic or adjust the filters."
        return RecommendResponse(recommendations=recommendations, message=message)
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
