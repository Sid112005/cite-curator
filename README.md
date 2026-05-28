**Project Title & Overview**

Data Structures — Course Laboratory Work

This repository contains a lab project for a "Data Structures using Python" course. It combines a small Python backend that demonstrates practical data-processing and retrieval techniques (an SBERT-based paper recommendation engine) with a modern React + TypeScript frontend. The codebase includes parsing, caching, vector search (cosine similarity), and a Vite-based UI demonstrating the recommendations.

**Data Structures & Algorithms Implemented**

- **Vector search (embeddings):** Sentence-BERT embeddings with cosine similarity ranking (backend implementation in [backend/engine.py](backend/engine.py)).
- **Caching:** Pickle-based cache for embeddings with JSON modification-time validation to avoid unnecessary recomputation ([backend/engine.py](backend/engine.py)).
- **Parsing & normalization:** Robust parsing of stringified lists and author/tag extraction using `ast.literal_eval` and `pandas` helpers ([backend/engine.py](backend/engine.py)).
- **Data loading & preprocessing:** Loading JSON into a `pandas.DataFrame`, concatenating title+summary into a single `content` field for encoding ([backend/engine.py](backend/engine.py)).
- **API & routing:** FastAPI endpoints for health, stats and recommendations (see [backend/main.py](backend/main.py)).

Note: A scan of the repository did not reveal classical classroom implementations of Linked Lists, Trees, Graphs, or sorting algorithm source files. If you have additional folders with exercise code, add them and I can update this list.

**Tech Stack**

- **Backend:** Python 3.10+ (recommended), FastAPI, Uvicorn, pandas, sentence-transformers, PyTorch
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Dev / Test:** Vitest, ESLint

**Project Structure**

- **backend/** — Python backend with recommendation engine and FastAPI server.
  - [backend/engine.py](backend/engine.py): SBERT embedding generation, caching, and search utilities.
  - [backend/main.py](backend/main.py): FastAPI application exposing `/health`, `/stats`, and `/recommend` endpoints.
  - [backend/requirements.txt](backend/requirements.txt): Python dependencies for the backend.
- **data/** — Dataset used by the backend.
  - [data/arxivData.json](data/arxivData.json): Source JSON of papers used for embeddings.
- **src/** — React + TypeScript frontend (Vite) and UI components.
- **public/** — Static assets for the frontend.
- **docs/** — (Optional) Documentation and notes.

**How to Run**

Prerequisites:

- Python 3.10+ (for the backend)
- Node.js 18+ and npm/yarn/bun (for the frontend)

1) Backend (local)

Create and activate a virtual environment, install dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r backend/requirements.txt
```

Start the FastAPI server:

```powershell
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
# or (convenience script)
npm run api
```

The API endpoints:

- `GET /health` — server health
- `GET /stats` — engine statistics (paper count, embedding dim, model)
- `POST /recommend` — body: `{ "query": "your text", "top_n": 5 }`

Example request using `curl`:

```bash
curl -X POST http://127.0.0.1:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{"query": "graph neural networks", "top_n": 5}'
```

2) Frontend (local)

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

The frontend runs via Vite (default at `http://localhost:5173`) and calls the backend API for recommendations.

**Notes & Next Steps**

- If you want the README to enumerate classic data structure implementations (Linked Lists, Trees, Heaps, Graphs, sorting/searching algorithms), add those Python exercise files or point me to their location and I will update the list accordingly.
- Consider adding small unit tests for the backend (`pytest` or `unittest`) and a lightweight demo script (e.g., `scripts/query_example.py`) to make it easier to showcase engine output without running the full frontend.

---

If you'd like, I can update this README to include diagrams, runtime benchmarks for the embedding pipeline, or add a dedicated `CONTRIBUTING.md` and example notebook demonstrating embedding generation and nearest-neighbor search.
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
