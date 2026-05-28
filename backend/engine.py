"""
SBERT-based paper recommendations: load arXiv JSON, embed title+summary, cache vectors.
"""

from __future__ import annotations

import ast
import os
import pickle
from pathlib import Path
from typing import Any

import pandas as pd
import torch
from sentence_transformers import SentenceTransformer, util

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
JSON_PATH = DATA_DIR / "arxivData.json"
CACHE_PATH = DATA_DIR / "embeddings.pkl"
MODEL_NAME = "all-MiniLM-L6-v2"


def _json_mtime() -> float:
    return os.path.getmtime(JSON_PATH)


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


def load_papers_df() -> pd.DataFrame:
    df = pd.read_json(JSON_PATH)
    df = df.head(1000)
    df["title"] = df["title"].fillna("").astype(str)
    df["summary"] = df["summary"].fillna("").astype(str)
    df["content"] = df["title"] + " " + df["summary"]
    return df


class SbertRecommendationEngine:
    """Loads corpus embeddings from cache or builds them with SentenceTransformer."""

    def __init__(self) -> None:
        self._model: SentenceTransformer | None = None
        self._df: pd.DataFrame | None = None
        self._embeddings: torch.Tensor | None = None

    def ensure_loaded(self) -> None:
        if self._model is not None and self._df is not None and self._embeddings is not None:
            return

        if not JSON_PATH.is_file():
            raise FileNotFoundError(f"Dataset not found: {JSON_PATH}")

        self._model = SentenceTransformer(MODEL_NAME)

        if self._try_load_cache():
            return

        df = load_papers_df()
        contents = df["content"].tolist()
        embeddings_np = self._model.encode(
            contents,
            batch_size=64,
            show_progress_bar=True,
            convert_to_numpy=True,
        )
        self._df = df
        self._embeddings = torch.from_numpy(embeddings_np).float()

        DATA_DIR.mkdir(parents=True, exist_ok=True)
        with open(CACHE_PATH, "wb") as f:
            pickle.dump(
                {
                    "json_mtime": _json_mtime(),
                    "df": df,
                    "embeddings_np": embeddings_np,
                },
                f,
            )

    def _try_load_cache(self) -> bool:
        if not CACHE_PATH.is_file():
            return False
        try:
            with open(CACHE_PATH, "rb") as f:
                cache = pickle.load(f)
        except (OSError, pickle.PickleError):
            return False

        if cache.get("json_mtime") != _json_mtime():
            return False

        self._df = cache["df"]
        self._embeddings = torch.from_numpy(cache["embeddings_np"]).float()
        return True

    def get_recommendations(self, query: str, top_k: int = 5) -> list[dict[str, Any]]:
        """Return top_k papers by cosine similarity between query and corpus embeddings."""
        self.ensure_loaded()
        assert self._model is not None and self._df is not None and self._embeddings is not None

        q = query.strip()
        if not q:
            return []

        query_emb = self._model.encode(q, convert_to_tensor=True)
        corpus = self._embeddings.to(query_emb.device)
        sims = util.cos_sim(query_emb, corpus)[0]
        k = min(max(top_k, 1), len(sims))
        scores, indices = torch.topk(sims, k=k)

        out: list[dict[str, Any]] = []
        for score, idx in zip(scores.tolist(), indices.tolist()):
            row = self._df.iloc[int(idx)]
            out.append(
                {
                    "paper": {
                        "id": str(row["id"]),
                        "title": str(row["title"]),
                        "abstract": str(row["summary"]),
                        "authors": parse_arxiv_authors(row.get("author")),
                        "keywords": parse_arxiv_tags(row.get("tag")),
                    },
                    "score": float(score),
                }
            )
        return out

    def get_stats(self) -> dict[str, Any]:
        self.ensure_loaded()
        assert self._df is not None and self._embeddings is not None
        dim = int(self._embeddings.shape[1])
        return {
            "paper_count": len(self._df),
            "embedding_dim": dim,
            "model": MODEL_NAME,
        }


engine = SbertRecommendationEngine()
