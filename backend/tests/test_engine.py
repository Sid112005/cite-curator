from typing import Any

import pandas as pd
import pytest
import torch

from backend.engine import SbertRecommendationEngine


class FixedQueryModel:
    def encode(self, _query: str, **_kwargs: Any) -> torch.Tensor:
        return torch.tensor([1.0, 0.0])


def make_engine(rows: list[dict[str, Any]], title_vectors: list[list[float]], abstract_vectors: list[list[float]]) -> SbertRecommendationEngine:
    engine = SbertRecommendationEngine()
    engine.ensure_loaded = lambda: None
    engine._model = FixedQueryModel()  # type: ignore[assignment]
    engine._df = pd.DataFrame(rows)
    engine._title_embeddings = torch.tensor(title_vectors)
    engine._abstract_embeddings = torch.tensor(abstract_vectors)
    engine._category_sets = [set() for _ in rows]
    return engine


def test_empty_query_returns_no_recommendations() -> None:
    engine = make_engine(
        [{"id": "paper-1", "title": "Paper", "summary": "Abstract"}],
        [[1.0, 0.0]],
        [[1.0, 0.0]],
    )

    assert engine.get_recommendations("   ") == []


def test_missing_metadata_fields_are_returned_safely() -> None:
    engine = make_engine(
        [{"id": None, "title": "Paper without metadata", "summary": "Abstract"}],
        [[1.0, 0.0]],
        [[1.0, 0.0]],
    )

    recommendation = engine.get_recommendations("topic")[0]

    assert recommendation["paper"]["id"] == ""
    assert recommendation["paper"]["authors"] == ""
    assert recommendation["paper"]["keywords"] == ""
    assert recommendation["paper"]["publication_date"] is None
    assert recommendation["paper"]["arxiv_url"] is None
    assert recommendation["paper"]["pdf_url"] is None


def test_recommendations_follow_hybrid_similarity_order() -> None:
    engine = make_engine(
        [
            {"id": "title-match", "title": "Title match", "summary": "Abstract"},
            {"id": "abstract-match", "title": "Abstract match", "summary": "Abstract"},
        ],
        [[1.0, 0.0], [0.0, 1.0]],
        [[0.0, 1.0], [1.0, 0.0]],
    )

    recommendations = engine.get_recommendations("topic", top_k=2)

    assert [result["paper"]["id"] for result in recommendations] == [
        "abstract-match",
        "title-match",
    ]
    assert [result["score"] for result in recommendations] == pytest.approx([0.6, 0.4])
