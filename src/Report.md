# A Mini Project Synopsis on
# Cite Curator: Semantic Research Paper Recommendation Engine
**B.E. - I.T Engineering**

**Submitted By:**
| Name | Roll No. |
| :--- | :--- |
| Nikhil [Last Name] | [Roll Number] |
| [Teammate 2 Name] | [Roll Number] |
| [Teammate 3 Name] | [Roll Number] |

**Under The Guidance Of:**
[Your Guide's Name]

**DEPARTMENT OF INFORMATION TECHNOLOGY**
**A.P.SHAH INSTITUTE OF TECHNOLOGY**
G.B. Road, Kasarvadavali, Thane (W), Mumbai-400615
UNIVERSITY OF MUMBAI
**Academic year: 2025-26**

---

## CERTIFICATE
This is to certify that the Mini Project report on **Cite Curator: Semantic Research Paper Recommendation Engine** has been submitted by Nikhil [Last Name] ([Roll No.]), [Teammate 2] ([Roll No.]), and [Teammate 3] ([Roll No.]) who are Bonafide students of A. P. Shah Institute of Technology, Thane, Mumbai, as a partial fulfilment of the requirement for the degree in Information Technology, during the academic year 2025-2026 in the satisfactory manner as per the curriculum laid down by University of Mumbai.

**[Guide's Name]**
Guide

---

## ACKNOWLEDGEMENT
This project would not have come to fruition without the invaluable help of our guide [Guide's Name]. Expressing gratitude towards our HoD, Dr. Kiran Deshpande, and the Department of Information Technology for providing us with the opportunity as well as the support required to pursue this project.

---

## TABLE OF CONTENTS
1. Introduction
   1.1. Purpose
   1.2. Objectives
   1.3. Scope
2. Literature Survey
3. Problem Definition
4. Proposed System
   4.1. Algorithms
5. Technology Stack
6. Implementation
7. Results
8. Conclusion
9. Future Scope
References

---

## Chapter 1: Introduction
The exponential growth of academic publishing has created a significant challenge for researchers and students: information overload. Finding relevant literature is essential for advancing research, but traditional search engines rely heavily on exact keyword matching. This approach, often powered by algorithms like TF-IDF (Term Frequency-Inverse Document Frequency), fails to understand the contextual meaning of search queries, leading to missed connections when authors use synonymous terminology.

To address this challenge, **Cite Curator** presents an intelligent, semantic recommendation platform that integrates state-of-the-art Natural Language Processing (NLP). The system utilizes Sentence-BERT (SBERT) embeddings to understand the deep semantic meaning of research papers. By mapping abstracts, titles, authors, and keywords into a dense vector space, the platform provides highly accurate, context-aware recommendations that transcend simple keyword mapping.

### 1.1. Purpose
Cite Curator is a data-driven platform designed to transform how researchers discover academic literature. By transitioning from sparse vector models (TF-IDF) to dense vector representations (SBERT), the system provides nuanced, contextually relevant paper suggestions. The platform automates the entire pipeline—from parsing nested JSON datasets of arXiv papers to generating multi-dimensional embeddings—ensuring real-time, accurate discovery through an intuitive React-based interface.

### 1.2. Objectives
1. Develop a semantic recommendation engine that accurately retrieves relevant research papers using the `all-MiniLM-L6-v2` SBERT model.
2. Implement robust Data Engineering pipelines to parse nested JSON datasets, extracting and normalizing authors, tags, titles, and abstracts.
3. Enhance search accuracy by utilizing Context Enrichment, combining multiple paper attributes into a singular, comprehensive mathematical vector.
4. Optimize system performance by engineering an intelligent `.pkl` caching mechanism that tracks dataset modification times to bypass redundant encoding.
5. Build a responsive, decoupled Full-Stack architecture utilizing a Python/FastAPI backend and a React/Vite frontend for seamless user interaction.

### 1.3. Scope
1. **Academic Researchers & Students:** Assists individuals in conducting thorough literature reviews by uncovering semantically related papers that traditional searches might miss.
2. **Educational Institutions:** Provides a streamlined tool for university libraries to enhance their academic databases.
3. **Data Science Professionals:** Serves as a reference architecture for deploying NLP models and managing high-dimensional vector data in production environments.

---

## Chapter 2: Literature Survey

| Title | Key Contributions | Limitations | Tech Stack |
| :--- | :--- | :--- | :--- |
| Keyword-Based Document Retrieval using TF-IDF | Established baseline for text retrieval using sparse vectors and term frequency. | Fails to capture semantic meaning or synonyms; high dimensionality. | Python, Scikit-learn, NLTK |
| Sentence-BERT: Sentence Embeddings using Siamese BERT | Introduced SBERT architecture to derive semantically meaningful sentence embeddings. | Computationally heavy for real-time inference without proper caching. | Python, PyTorch, Transformers |
| Context-Aware Recommendation Systems in Academia | Demonstrated the value of combining metadata (authors/tags) with text for better recommendations. | Often required complex graph databases instead of unified dense vectors. | Neo4j, Python, Pandas |

---

## Chapter 3: Problem Definition
Academic research discovery relies heavily on understanding the intricate relationships between complex scientific concepts. However, most existing recommendation systems face significant limitations in semantic comprehension. Traditional statistical methods, like TF-IDF, represent text as sparse vectors, meaning they can only match exact words. If a user searches for "Machine Learning," the system will completely miss highly relevant papers that exclusively use the term "Artificial Intelligence."

Furthermore, processing large-scale academic datasets (such as the arXiv database) involves handling deeply nested JSON structures containing authors and categories. Many available tools lack the automated data pipelines required to flatten, clean, and utilize this metadata effectively. Cite Curator addresses these challenges by providing an AI-driven platform that leverages dense vector embeddings to understand context, combined with an optimized caching backend to ensure scalability and instant retrieval.

---

## Chapter 4: Proposed System

Cite Curator is designed as an end-to-end, automated workflow that ingests structured arXiv metadata, normalises it for machine learning, enriches the textual context passed to the encoder, and serves ranked recommendations through a lightweight API. The proposed architecture prioritises reproducibility (fixed model and deterministic preprocessing), operational efficiency (embedding cache keyed to dataset freshness), and separation of concerns (retrieval logic isolated from the presentation layer).

The pipeline begins with **dataset ingestion**. The backend loads the corpus from a consolidated JSON file (`arxivData.json`) using Pandas (`pd.read_json`), which provides a tabular view of heterogeneous fields (identifier, title, summary, author, tag, and related metadata). This step establishes a single source of truth for all downstream processing.

**Data cleaning** addresses the irregular representation of authors and subject tags. In practice, these fields may arrive either as native lists of dictionaries or as stringified Python-like literals. The system applies defensive parsing: lists are consumed directly, while strings are interpreted safely via `ast.literal_eval` where appropriate, with failures degrading to empty lists rather than runtime errors. Author names are extracted from the `name` key and tags from the `term` key, producing human-readable, comma-separated strings for display and auditability.

**Context enrichment** concatenates complementary signals so that the encoder sees a unified document rather than an isolated abstract. Title and abstract (summary) supply the primary scientific narrative; parsed author names supply scholarly provenance; parsed arXiv category terms supply subject descriptors. By fusing these elements into a single `content` string prior to embedding, the model can align user queries not only with topical wording in the abstract but also with disciplinary cues and authorship context, improving retrieval quality relative to abstract-only encoding.

**Dense vector generation** employs Sentence-BERT via the Sentence Transformers library, using the `all-MiniLM-L6-v2` checkpoint. Each enriched document is mapped to a fixed-dimensional embedding that captures semantic similarity in a continuous vector space. User queries are encoded with the same model, ensuring symmetric geometry between query and corpus representations.

**Similarity search and ranking** compare the query embedding against all corpus embeddings using cosine similarity (`sentence_transformers.util.cos_sim`), followed by selection of the top-*k* matches. This step is purely geometric once embeddings are materialised and does not require re-fitting a vectoriser on each request.

**Intelligent caching** mitigates the high one-time cost of encoding large corpora. After the first successful run, embeddings and the associated DataFrame are serialised to `embeddings.pkl`. On subsequent service startup, the engine attempts to load this cache only if it remains consistent with the on-disk JSON source. Consistency is verified by comparing a stored modification timestamp with `os.path.getmtime()` applied to the dataset path: if the JSON file has changed, the cache is invalidated implicitly (reload fails the equality check) and embeddings are recomputed. This design materially reduces cold-start latency for routine development and deployment cycles while preserving correctness when the underlying data is updated.

### 4.1 Algorithms

The retrieval subsystem combines **neural encoding** with **vector similarity ranking**. Sentence-BERT (SBERT) fine-tunes transformer-based encoders to produce sentence-level embeddings optimised for semantic textual similarity; `all-MiniLM-L6-v2` offers a practical balance between accuracy and inference speed for interactive use. **Cosine similarity** measures alignment between normalised or comparable vectors and is well suited to dense semantic embeddings because it emphasises directional agreement over raw magnitude. **Top-*k* selection** (implemented via tensor top-*k* operations after similarity scoring) returns the prescribed number of highest-scoring papers for presentation to the client. Together, these algorithms replace sparse, vocabulary-limited scoring with a continuous semantic geometry that better reflects conceptual overlap between a free-text research topic and candidate publications.

---

## Chapter 5: Technology Stack

Cite Curator adopts a **decoupled client–server architecture** so that the user interface, API contract, and model serving responsibilities remain independent. This separation simplifies maintenance, allows each tier to evolve on its own release cycle, and mirrors common industry practice for machine-learning-backed web applications.

**Frontend.** The presentation layer is implemented in **React** with **TypeScript**, providing component-based UI construction, strong typing for API payloads, and predictable state handling during search and loading transitions. **Vite** serves as the development server and bundler, offering fast refresh and an efficient production build pipeline. Styling and layout leverage the existing component library and utility patterns in the codebase (e.g., Tailwind-oriented class composition), yielding a responsive experience across viewports.

**Backend.** **Python 3** hosts the recommendation service. **FastAPI** exposes RESTful endpoints (for example, health checks, corpus statistics, and recommendation requests) with automatic request validation and clear JSON schemas. **Uvicorn** (or an equivalent ASGI server) runs the application process in development and production-like settings.

**Data and NLP.** **Pandas** performs ingestion, null handling, string normalisation, and column-wise preparation of the arXiv records. **Sentence Transformers** wraps the SBERT family of models and supplies both encoding utilities and similarity helpers (`util.cos_sim`). **PyTorch** underpins tensor operations and model execution. Auxiliary libraries such as `pickle` persist the embedding cache; the standard library’s `os.path.getmtime` participates in cache validation as described in Chapter 4.

**Integration.** During local development, the Vite development server **proxies** API routes (e.g., `/api`) to the FastAPI listener, so the browser issues same-origin requests while the implementation remains logically split between Node-hosted tooling and Python-hosted inference.

---

## Chapter 6: Implementation

This chapter is reserved for evidence of the implemented system at the source-code level. The following placeholder should be replaced with annotated figures (IDE or terminal captures, short listings, or architecture diagrams) that illustrate key modules such as the FastAPI application, the SBERT engine lifecycle, parsing helpers for authors and tags, and the caching logic.

**[Insert Code Screenshots Here]**

---

## Chapter 7: Results

This chapter should document empirical and qualitative outcomes of Cite Curator: example queries, ranked outputs, similarity scores, and any observations on relevance compared with keyword-only baselines. Screens captures of the live interface (search form, recommendation list, similarity visualisation if present) will strengthen the evaluation narrative.

**[Insert UI Screenshots Here]**

---

## Chapter 8: Conclusion

Cite Curator demonstrates that **semantic vector search** substantially improves the discoverability of academic literature when compared with classical **keyword-driven** retrieval. Keyword methods—including bag-of-words and TF-IDF-style weighting—depend on lexical overlap between the query and the document. Consequently, they underperform when authors employ synonyms, domain-specific paraphrases, or orthogonal but conceptually related terminology. In contrast, SBERT maps natural-language descriptions into a shared embedding space in which proximity correlates with meaning. Cosine similarity in that space therefore approximates **conceptual relatedness** rather than mere token coincidence, enabling users to articulate research interests in flexible prose while still receiving pertinent paper suggestions.

The project further shows that **robust data engineering** (JSON ingestion, safe parsing of nested metadata, and context enrichment) is as critical as model choice: noisy or inaccessible author and category fields reduce trust and interpretability, whereas normalised strings support both downstream encoding and transparent presentation. Finally, the **mtime-guarded embedding cache** illustrates a pragmatic trade-off between first-run computational cost and steady-state responsiveness, which is essential when iterating on features or redeploying services against a stable corpus.

Taken together, the proposed system delivers a modern, maintainable stack—React and Vite on the client, FastAPI and Sentence Transformers on the server—that aligns academic mini-project goals with contemporary full-stack ML deployment patterns.

---

## Chapter 9: Future Scope

Several directions would extend Cite Curator from a prototype into a production-grade research assistant:

1. **Persistent relational storage.** Migrating the flat `arxivData.json` corpus into **PostgreSQL** (or a comparable RDBMS) would support indexed queries, incremental updates, versioning, and multi-user access control. Embeddings could be stored alongside paper rows or in an auxiliary table, with foreign keys preserving referential integrity.

2. **Larger or domain-specialised encoders.** Experimenting with **higher-capacity transformer models** (e.g., larger Sentence Transformer checkpoints or domain-adapted language models) may improve ranking quality on specialised subfields, at the cost of memory and latency; quantisation or distilled variants could partially offset that overhead.

3. **Hybrid retrieval.** Combining dense vectors with **sparse lexical signals** (BM25 or keyword filters) can improve precision on exact citation or acronym-style queries while retaining semantic recall for exploratory search.

4. **Operational hardening.** Containerisation (Docker), environment-based configuration, automated tests for parsing edge cases, and monitoring of API latency and cache hit rates would improve reliability for sustained deployment.

5. **User-centric features.** Optional account systems, saved queries, export of bibliographies, and feedback loops (explicit relevance labels) could enable personalisation and continuous improvement of ranking over time.

These enhancements preserve the core insight of the current work—**semantic embeddings over enriched scholarly text**—while addressing scalability, governance, and user experience expectations beyond the mini-project timeframe.

---

## References

[Insert references in the citation style prescribed by the department—e.g., Reimers & Gurevych (Sentence-BERT), arXiv dataset documentation, FastAPI and Sentence Transformers official documentation, and any course texts used.]