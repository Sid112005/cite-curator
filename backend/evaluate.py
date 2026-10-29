"""Evaluate SBERT recommendations against a labeled set and a TF-IDF baseline."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

from backend.engine import ROOT, SbertRecommendationEngine, load_papers_df

EVAL_PATH = ROOT / "data" / "eval" / "queries.json"
AT_K_PRECISION = 5
AT_K_RECALL = 10


def _read_evaluation_set() -> list[dict[str, Any]]:
    with EVAL_PATH.open(encoding="utf-8") as file:
        evaluation = json.load(file)
    queries = evaluation.get("queries")
    if not isinstance(queries, list) or not queries:
        raise ValueError(f"No evaluation queries found in {EVAL_PATH}")
    return queries


def _metrics(ranked_ids: list[str], relevant_ids: set[str]) -> tuple[float, float, float]:
    hits_at_5 = sum(paper_id in relevant_ids for paper_id in ranked_ids[:AT_K_PRECISION])
    hits_at_10 = sum(paper_id in relevant_ids for paper_id in ranked_ids[:AT_K_RECALL])
    reciprocal_rank = next(
        (1.0 / rank for rank, paper_id in enumerate(ranked_ids, start=1) if paper_id in relevant_ids),
        0.0,
    )
    return (
        hits_at_5 / AT_K_PRECISION,
        hits_at_10 / len(relevant_ids),
        reciprocal_rank,
    )


def _aggregate(rows: list[dict[str, Any]], key: str) -> tuple[float, float, float]:
    return tuple(float(np.mean([row[key][i] for row in rows])) for i in range(3))


def main() -> None:
    queries = _read_evaluation_set()
    df = load_papers_df()
    paper_ids = df["id"].astype(str).tolist()
    known_ids = set(paper_ids)
    for item in queries:
        relevant_ids = item.get("relevant_paper_ids")
        if not isinstance(item.get("query"), str) or not item["query"].strip():
            raise ValueError(f"Evaluation entry has an invalid query: {item}")
        if not isinstance(relevant_ids, list) or not relevant_ids:
            raise ValueError(f"Evaluation entry has no relevant paper IDs: {item['query']}")
        unknown_ids = set(relevant_ids) - known_ids
        if unknown_ids:
            raise ValueError(
                f"Unknown relevant paper ID(s) for {item['query']!r}: {sorted(unknown_ids)}"
            )

    corpus = (
        df["title"].fillna("").astype(str)
        + " "
        + df["summary"].fillna("").astype(str)
    ).tolist()
    vectorizer = TfidfVectorizer(
        lowercase=True,
        stop_words="english",
        ngram_range=(1, 2),
        sublinear_tf=True,
        dtype=np.float32,
    )
    tfidf_matrix = vectorizer.fit_transform(corpus)

    engine = SbertRecommendationEngine()
    results: list[dict[str, Any]] = []
    for item in queries:
        query = item["query"].strip()
        relevant_ids = set(item["relevant_paper_ids"])

        sbert = engine.get_recommendations(query, top_k=AT_K_RECALL)
        sbert_ids = [recommendation["paper"]["id"] for recommendation in sbert]

        query_vector = vectorizer.transform([query])
        tfidf_scores = (tfidf_matrix @ query_vector.T).toarray().ravel()
        top_indices = np.argsort(-tfidf_scores, kind="stable")[:AT_K_RECALL]
        tfidf_ids = [paper_ids[int(index)] for index in top_indices]

        results.append(
            {
                "query": query,
                "sbert": _metrics(sbert_ids, relevant_ids),
                "tfidf": _metrics(tfidf_ids, relevant_ids),
            }
        )

    print(f"Evaluation queries: {len(results)}")
    print("Model\tPrecision@5\tRecall@10\tMRR")
    for model in ("sbert", "tfidf"):
        precision, recall, mrr = _aggregate(results, model)
        print(f"{model}\t{precision:.4f}\t{recall:.4f}\t{mrr:.4f}")


if __name__ == "__main__":
    main()
