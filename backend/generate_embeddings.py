"""Generate full-corpus title and abstract embeddings for the recommendation engine."""

from __future__ import annotations

from pathlib import Path

import torch
from sentence_transformers import SentenceTransformer

from backend.engine import CACHE_PATH, JSON_PATH, MODEL_NAME, load_papers_df


def main() -> None:
    if not JSON_PATH.is_file():
        raise FileNotFoundError(f"Dataset not found: {JSON_PATH}")

    source_mtime_ns = JSON_PATH.stat().st_mtime_ns
    df = load_papers_df()
    model = SentenceTransformer(MODEL_NAME)
    title_embeddings = model.encode(
        df["title"].tolist(),
        batch_size=64,
        show_progress_bar=True,
        convert_to_tensor=True,
        normalize_embeddings=True,
    ).cpu()
    abstract_embeddings = model.encode(
        df["summary"].tolist(),
        batch_size=64,
        show_progress_bar=True,
        convert_to_tensor=True,
        normalize_embeddings=True,
    ).cpu()

    if JSON_PATH.stat().st_mtime_ns != source_mtime_ns:
        raise RuntimeError("Dataset changed while embeddings were being generated; run the script again.")

    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = CACHE_PATH.with_suffix(".pt.tmp")
    try:
        torch.save(
            {
                "json_mtime_ns": source_mtime_ns,
                "paper_count": len(df),
                "model_name": MODEL_NAME,
                "title_embeddings": title_embeddings,
                "abstract_embeddings": abstract_embeddings,
            },
            temporary_path,
        )
        temporary_path.replace(CACHE_PATH)
    finally:
        if temporary_path.exists():
            temporary_path.unlink()

    print(f"Saved embeddings for {len(df)} papers to {CACHE_PATH}")


if __name__ == "__main__":
    main()
