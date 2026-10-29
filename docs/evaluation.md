# Recommendation evaluation

## Results

The current hybrid SBERT retriever and a word-level TF-IDF baseline were evaluated on the same **21 draft queries** and **42 title-grounded relevance judgments** from [`data/eval/queries.json`](../data/eval/queries.json).

| Model | Precision@5 | Recall@10 | MRR |
|---|---:|---:|---:|
| Hybrid SBERT (0.4 title / 0.6 abstract) | 0.0571 | 0.2381 | 0.1704 |
| TF-IDF (unigrams + bigrams) | 0.0571 | 0.2381 | 0.1680 |

The measured ranking metrics are close: the current SBERT model has a slightly higher MRR, while precision@5 and recall@10 are equal at the reported precision. This small draft evaluation does not establish a statistically meaningful quality difference.

## Method

- The corpus is the full 41,000-paper `data/arxivData.json` dataset.
- SBERT ranks with the current production engine: `all-MiniLM-L6-v2`, cosine similarity, and configurable title/abstract weights (default **0.4 / 0.6**). The default minimum relevance threshold is **0.35**.
- The baseline is scikit-learn `TfidfVectorizer` over concatenated title and abstract text, using English stop words, unigrams and bigrams, and sublinear term frequency.
- Precision@5 is relevant results in the first five divided by five. Recall@10 is relevant results in the first ten divided by the number labeled relevant for that query. MRR is the reciprocal rank of the first labeled relevant result; it is zero when none is found.
- SBERT's configured threshold may leave fewer than five results; unfilled positions count as non-relevant for precision@5. TF-IDF is an unthresholded ranking baseline.

The judgments are a **draft**, derived from paper titles and metadata rather than independent expert assessment. They are intentionally sparse and mark two papers per query as relevant; recall therefore measures recovery of the supplied labels, not all relevant papers in the corpus. Five queries include review notes identifying less certain judgments. Please check these labels before treating the scores as a final benchmark.

## Reproduce

From the repository root, with backend dependencies installed and the saved embeddings available:

```powershell
python -m backend.evaluate
```

The evaluation script validates every labeled paper ID against the corpus, then prints the macro-averaged metrics. If the dataset changes, update and review the judgments and regenerate embeddings with `python -m backend.generate_embeddings` before evaluating.
