# CiteCurator

CiteCurator is a research-paper discovery app. Enter a topic to find arXiv papers ranked by semantic similarity between the query and each paper's title and abstract. Results include publication details, categories, similarity scores, and links to the arXiv abstract and PDF.

## Features

- Searches the full local corpus of 41,000 arXiv metadata records.
- Uses Sentence-BERT (`all-MiniLM-L6-v2`) embeddings and a configurable title/abstract similarity blend (default: 0.4 / 0.6).
- Filters results by optional arXiv category and publication year.
- Applies a configurable relevance threshold and explains when no results meet it.
- Saves precomputed corpus embeddings so the model only encodes the user's query during recommendation requests.

## Technology

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Radix UI.
- **Backend:** Python, FastAPI, Uvicorn, pandas, Sentence Transformers, PyTorch.
- **Evaluation:** scikit-learn TF-IDF baseline and pytest/Vitest tests.
- **Data:** arXiv metadata in `data/arxivData.json`; generated title and abstract vectors in the ignored `data/embeddings.pt` cache.

## Requirements

- Python 3.10 or later.
- Node.js and npm.
- Approximately 126 MB of disk space for the generated embeddings, in addition to the dataset and installed dependencies.
- Network access the first time the Sentence Transformers model is needed, unless it is already cached locally.

## Run locally

### 1. Install Python dependencies

From the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend/requirements.txt
```

On macOS/Linux, activate the environment with `source .venv/bin/activate`.

### 2. Generate corpus embeddings

Generate the saved title and abstract vectors once:

```powershell
python -m backend.generate_embeddings
```

This processes the full dataset and writes `data/embeddings.pt`. It can take several minutes and requires the model to be available locally or downloadable. Regenerate this file whenever the source JSON changes. The API checks the artifact against the dataset timestamp, record count, and model and reports an error if it is missing or stale.

### 3. Start the API

In one terminal:

```powershell
npm run api
```

The FastAPI server listens at `http://127.0.0.1:8000`. Its startup loads the metadata, embedding artifact, and model.

### 4. Start the web app

In another terminal:

```powershell
npm install
npm run dev
```

Open the URL printed by Vite (configured to use port **8080**). During development, Vite proxies `/api` requests to the backend at `127.0.0.1:8000`.

## API

- `GET /health` — API health check.
- `GET /stats` — corpus size, embedding dimension, model, weights, and relevance threshold.
- `POST /recommend` — rank papers for a query, optionally filtered by category and/or year.

Example:

```powershell
curl.exe -X POST http://127.0.0.1:8000/recommend `
  -H "Content-Type: application/json" `
  -d '{"query":"graph neural networks","top_n":5,"category":"cs.AI","year":2018}'
```

`category` and `year` are optional. Category matching is case-insensitive and uses the paper's exact arXiv category. The API returns no results when none meet the relevance threshold.

### Recommendation settings

The backend reads these environment variables:

| Variable | Default | Meaning |
|---|---:|---|
| `CITECURATOR_TITLE_WEIGHT` | `0.4` | Title similarity weight |
| `CITECURATOR_ABSTRACT_WEIGHT` | `0.6` | Abstract similarity weight |
| `CITECURATOR_RELEVANCE_THRESHOLD` | `0.35` | Minimum blended cosine similarity to return |

The two weights are normalized by their sum. They must be non-negative and cannot both be zero. The threshold must be between -1 and 1. Restart the API after changing these settings.

## How it works

1. `backend/generate_embeddings.py` reads all records in `data/arxivData.json`, normalizes title and summary text, and separately encodes titles and abstracts using `all-MiniLM-L6-v2`.
2. The generator saves both vector matrices and dataset/model metadata to `data/embeddings.pt`.
3. At startup, `backend/engine.py` loads the corpus and verifies that the saved vectors correspond to the current JSON file and model. It fails with a regeneration instruction if they do not.
4. For each recommendation request, the engine embeds the query once, computes cosine similarity against both sets of vectors, combines the scores using the configured weights, applies optional filters and the minimum threshold, then returns the top requested matches.
5. The React app sends requests through Vite's `/api` proxy and displays ranked papers and their arXiv links.

## Evaluation

The current evaluation uses 21 draft queries and 42 title-grounded relevance judgments. It compares the hybrid SBERT retriever against a TF-IDF baseline:

| Model | Precision@5 | Recall@10 | MRR |
|---|---:|---:|---:|
| Hybrid SBERT (0.4 title / 0.6 abstract) | 0.0571 | 0.2381 | 0.1704 |
| TF-IDF (unigrams + bigrams) | 0.0571 | 0.2381 | 0.1680 |

These preliminary results are close and do not establish a statistically meaningful difference. The labels are sparse and have five entries flagged for review; see [docs/evaluation.md](docs/evaluation.md) and [data/eval/queries.json](data/eval/queries.json) for methodology and judgments.

To reproduce the comparison, install the Python dependencies and generate embeddings first, then run:

```powershell
python -m backend.evaluate
```

## Tests and build

```powershell
python -m pytest backend/tests
npm test
npm run lint
npm run build
```

## Data source, licensing, and updates

`data/arxivData.json` is a local snapshot of arXiv paper metadata. Its records contain arXiv identifiers and metadata fields such as title, summary, authors, categories, and dates, and cover publication years 1993–2018. The repository does not record the snapshot's original download date, export procedure, or a separate upstream dataset URL, so those provenance details cannot be verified from the project.

arXiv states that **its metadata is dedicated to CC0 1.0**. This applies to metadata, not automatically to the articles themselves: arXiv articles can have different licenses by submission and version. Cite the original authors and arXiv records when using the data, and check an individual paper's license before reusing its full text or other content. See [arXiv's license information](https://info.arxiv.org/help/license/index.html) and [API documentation](https://info.arxiv.org/help/api/user-manual.html).

The project currently has **no automatic data-refresh job**. To update the snapshot, retrieve the desired records through the official arXiv API (following its [terms of use](https://info.arxiv.org/help/api/tou.html)), transform them into the fields and representation expected by `backend/engine.py`, and replace the JSON snapshot. Review the updated records and source attribution, then regenerate the vectors with `python -m backend.generate_embeddings` before starting the API. Keep a record of the retrieval date, query, and source/API version alongside any future dataset refresh.
