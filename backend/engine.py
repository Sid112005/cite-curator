"""
SBERT-based paper recommendations: load arXiv JSON, embed title+summary, cache vectors.
"""

from __future__ import annotations

import ast
import math
import os
import pickle
from datetime import date
from pathlib import Path
from typing import Any
from urllib.parse import quote

import pandas as pd
import torch
from sentence_transformers import SentenceTransformer, util

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
JSON_PATH = DATA_DIR / "arxivData.json"
CACHE_PATH = DATA_DIR / "embeddings.pt"
MODEL_NAME = "all-MiniLM-L6-v2"
TITLE_WEIGHT = float(os.getenv("CITECURATOR_TITLE_WEIGHT", "0.4"))
ABSTRACT_WEIGHT = float(os.getenv("CITECURATOR_ABSTRACT_WEIGHT", "0.6"))
RELEVANCE_THRESHOLD = float(os.getenv("CITECURATOR_RELEVANCE_THRESHOLD", "0.35"))
_WEIGHT_TOTAL = TITLE_WEIGHT + ABSTRACT_WEIGHT

if (
    not math.isfinite(TITLE_WEIGHT)
    or not math.isfinite(ABSTRACT_WEIGHT)
    or TITLE_WEIGHT < 0
    or ABSTRACT_WEIGHT < 0
    or _WEIGHT_TOTAL <= 0
):
    raise ValueError("CiteCurator title and abstract weights must be non-negative and not both zero.")
if not math.isfinite(RELEVANCE_THRESHOLD) or not -1 <= RELEVANCE_THRESHOLD <= 1:
    raise ValueError("CiteCurator relevance threshold must be between -1 and 1.")


def _coerce_stringified_sequence(value: Any) -> list[Any]:
    """Turn a string like \"[{'a': 1}]\" into a list via ast.literal_eval; return [] on failure."""
    if not isinstance(value, str):
        return []
    s = value.strip()
    if not s:
        return []
    try:
        parsed = ast.literal_eval(s)
    except (ValueError, SyntaxError, MemoryError):
        return []
    return parsed if isinstance(parsed, list) else []


def _arxiv_item_list(value: Any) -> list[Any]:
    """Normalize author/tag column values to a list (already a list, or parsed from string)."""
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        return _coerce_stringified_sequence(value)
    try:
        if pd.isna(value):
            return []
    except (ValueError, TypeError):
        pass
    return []


def parse_arxiv_authors(value: Any) -> str:
    """Extract author names from list[dict] or stringified list; return comma-separated string."""
    names: list[str] = []
    for item in _arxiv_item_list(value):
        if isinstance(item, dict):
            name = item.get("name")
            if name is not None:
                t = str(name).strip()
                if t:
                    names.append(t)
    return ", ".join(names)


def parse_arxiv_tags(value: Any) -> str:
    """Extract category terms from list[dict] or stringified list; return comma-separated string."""
    terms: list[str] = []
    for item in _arxiv_item_list(value):
        if isinstance(item, dict):
            term = item.get("term")
            if term is not None:
                t = str(term).strip()
                if t:
                    terms.append(t)
    return ", ".join(terms)


def _date_component(value: Any) -> int | None:
    if value is None or isinstance(value, bool):
        return None
    try:
        numeric = pd.to_numeric(value, errors="coerce")
    except (TypeError, ValueError):
        return None
    if pd.isna(numeric) or not float(numeric).is_integer():
        return None
    return int(numeric)


def format_publication_date(year: Any, month: Any, day: Any) -> str | None:
    """Format available arXiv date fields without inventing missing components."""
    year_value = _date_component(year)
    if year_value is None or year_value < 1:
        return None

    month_value = _date_component(month)
    day_value = _date_component(day)
    if month_value is not None and 1 <= month_value <= 12:
        if day_value is not None:
            try:
                date(year_value, month_value, day_value)
            except ValueError:
                return f"{year_value:04d}-{month_value:02d}"
            return f"{year_value:04d}-{month_value:02d}-{day_value:02d}"
        return f"{year_value:04d}-{month_value:02d}"
    return f"{year_value:04d}"


def _paper_id(value: Any) -> str:
    if value is None or pd.isna(value):
        return ""
    return str(value).strip()


def load_papers_df() -> pd.DataFrame:
    df = pd.read_json(JSON_PATH)
    df["title"] = df["title"].fillna("").astype(str)
    df["summary"] = df["summary"].fillna("").astype(str)
    return df


class SbertRecommendationEngine:
    """Loads precomputed corpus embeddings and ranks papers by hybrid cosine similarity."""

    def __init__(self) -> None:
        self._model: SentenceTransformer | None = None
        self._df: pd.DataFrame | None = None
        self._title_embeddings: torch.Tensor | None = None
        self._abstract_embeddings: torch.Tensor | None = None
        self._category_sets: list[set[str]] | None = None

    def ensure_loaded(self) -> None:
        if (
            self._model is not None
            and self._df is not None
            and self._title_embeddings is not None
            and self._abstract_embeddings is not None
            and self._category_sets is not None
        ):
            return

        if not JSON_PATH.is_file():
            raise FileNotFoundError(f"Dataset not found: {JSON_PATH}")

        df = load_papers_df()
        if not CACHE_PATH.is_file():
            raise FileNotFoundError(
                f"Precomputed embeddings not found: {CACHE_PATH}. "
                "Generate them with `python -m backend.generate_embeddings`."
            )

        try:
            cache = torch.load(CACHE_PATH, map_location="cpu", weights_only=True)
        except (OSError, RuntimeError, ValueError, EOFError, pickle.UnpicklingError) as e:
            raise RuntimeError(
                f"Could not load embeddings from {CACHE_PATH}. "
                "Regenerate them with `python -m backend.generate_embeddings`."
            ) from e

        if not isinstance(cache, dict):
            raise RuntimeError(
                f"Embedding artifact has an invalid format: {CACHE_PATH}. "
                "Regenerate it with `python -m backend.generate_embeddings`."
            )

        if (
            cache.get("json_mtime_ns") != JSON_PATH.stat().st_mtime_ns
            or cache.get("paper_count") != len(df)
            or cache.get("model_name") != MODEL_NAME
        ):
            raise RuntimeError(
                "Precomputed embeddings are stale or incompatible with the current dataset/model. "
                "Regenerate them with `python -m backend.generate_embeddings`."
            )

        title_embeddings = cache.get("title_embeddings")
        abstract_embeddings = cache.get("abstract_embeddings")
        if (
            not isinstance(title_embeddings, torch.Tensor)
            or not isinstance(abstract_embeddings, torch.Tensor)
            or title_embeddings.ndim != 2
            or abstract_embeddings.shape != title_embeddings.shape
            or title_embeddings.shape[0] != len(df)
        ):
            raise RuntimeError(
                f"Embedding artifact has an invalid shape: {CACHE_PATH}. "
                "Regenerate it with `python -m backend.generate_embeddings`."
            )

        self._model = SentenceTransformer(MODEL_NAME)
        self._df = df
        self._title_embeddings = title_embeddings.float()
        self._abstract_embeddings = abstract_embeddings.float()
        self._category_sets = [
            {term.strip().casefold() for term in parse_arxiv_tags(value).split(",") if term.strip()}
            for value in df.get("tag", pd.Series([""] * len(df)))
        ]

    def get_recommendations(
        self,
        query: str,
        top_k: int = 5,
        category: str | None = None,
        year: int | None = None,
    ) -> list[dict[str, Any]]:
        """Return top_k relevant papers, optionally filtered by arXiv category and year."""
        self.ensure_loaded()
        assert (
            self._model is not None
            and self._df is not None
            and self._title_embeddings is not None
            and self._abstract_embeddings is not None
            and self._category_sets is not None
        )

        q = query.strip()
        if not q:
            return []

        query_emb = self._model.encode(q, convert_to_tensor=True, normalize_embeddings=True)
        title_sims = util.cos_sim(query_emb, self._title_embeddings.to(query_emb.device))[0]
        abstract_sims = util.cos_sim(query_emb, self._abstract_embeddings.to(query_emb.device))[0]
        scores = (
            title_sims * (TITLE_WEIGHT / _WEIGHT_TOTAL)
            + abstract_sims * (ABSTRACT_WEIGHT / _WEIGHT_TOTAL)
        )

        category_filter = category.strip().casefold() if category and category.strip() else None
        years = pd.to_numeric(self._df.get("year"), errors="coerce")
        eligible = [
            idx
            for idx in range(len(self._df))
            if (category_filter is None or category_filter in self._category_sets[idx])
            and (year is None or (not pd.isna(years.iloc[idx]) and int(years.iloc[idx]) == year))
        ]
        if not eligible:
            return []

        candidate_indices = torch.tensor(eligible, dtype=torch.long, device=scores.device)
        candidate_scores = scores[candidate_indices]
        relevant = candidate_scores >= RELEVANCE_THRESHOLD
        candidate_indices = candidate_indices[relevant]
        candidate_scores = candidate_scores[relevant]
        if candidate_indices.numel() == 0:
            return []

        k = min(max(top_k, 1), candidate_scores.numel())
        top_scores, top_positions = torch.topk(candidate_scores, k=k)
        indices = candidate_indices[top_positions]

        out: list[dict[str, Any]] = []
        for score, idx in zip(top_scores.tolist(), indices.tolist()):
            row = self._df.iloc[int(idx)]
            paper_id = _paper_id(row.get("id"))
            encoded_id = quote(paper_id, safe=".")
            out.append(
                {
                    "paper": {
                        "id": paper_id,
                        "title": str(row["title"]),
                        "abstract": str(row["summary"]),
                        "authors": parse_arxiv_authors(row.get("author")),
                        "keywords": parse_arxiv_tags(row.get("tag")),
                        "publication_date": format_publication_date(
                            row.get("year"), row.get("month"), row.get("day")
                        ),
                        "arxiv_url": f"https://arxiv.org/abs/{encoded_id}" if encoded_id else None,
                        "pdf_url": f"https://arxiv.org/pdf/{encoded_id}" if encoded_id else None,
                    },
                    "score": float(score),
                }
            )
        return out

    def get_stats(self) -> dict[str, Any]:
        self.ensure_loaded()
        assert self._df is not None and self._title_embeddings is not None
        dim = int(self._title_embeddings.shape[1])
        return {
            "paper_count": len(self._df),
            "embedding_dim": dim,
            "model": MODEL_NAME,
            "title_weight": TITLE_WEIGHT / _WEIGHT_TOTAL,
            "abstract_weight": ABSTRACT_WEIGHT / _WEIGHT_TOTAL,
            "relevance_threshold": RELEVANCE_THRESHOLD,
        }


engine = SbertRecommendationEngine()
