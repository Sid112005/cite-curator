import { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import SearchSection from "@/components/SearchSection";
import ResultsSection from "@/components/ResultsSection";
import StatsSection from "@/components/StatsSection";
import WorkflowSection from "@/components/WorkflowSection";
import DocumentationSection from "@/components/DocumentationSection";
import { parseRecommendationResponse } from "@/lib/recommendations";
import type {
  Recommendation,
  RecommendationFilters,
} from "@/lib/recommendations";

const API_BASE = "/api";

interface StatsResponse {
  paper_count: number;
  embedding_dim: number;
  model: string;
}

const Index = () => {
  const [results, setResults] = useState<Recommendation[]>([]);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [backendStatusError, setBackendStatusError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/stats`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: StatsResponse) => {
        setStats(data);
        setBackendStatusError(null);
      })
      .catch((error: unknown) => {
        setStats(null);
        setBackendStatusError(
          error instanceof TypeError
            ? "The CiteCurator backend is unreachable. Start the API server with `npm run api`."
            : "The CiteCurator backend could not load corpus statistics. Check the API logs.",
        );
      });
  }, []);

  const handleSearch = (
    searchQuery: string,
    topN: number,
    filters: RecommendationFilters = {},
  ) => {
    setIsSearching(true);
    setQuery(searchQuery);
    setResultMessage(null);

    window.setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/recommend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: searchQuery,
            top_n: topN,
            ...filters,
          }),
        });
        if (!res.ok) {
          let message = res.statusText;
          try {
            const err = (await res.json()) as { detail?: unknown };
            if (typeof err.detail === "string") message = err.detail;
            else if (Array.isArray(err.detail)) message = JSON.stringify(err.detail);
          } catch {
            /* ignore */
          }
          throw new Error(message);
        }
        const data = parseRecommendationResponse(await res.json());
        setResults(data.recommendations);
        setResultMessage(data.message);
        setBackendStatusError(null);
      } catch (e) {
        const message =
          e instanceof TypeError
            ? "Can't reach the CiteCurator backend. Make sure it is running with `npm run api`."
            : e instanceof Error
              ? e.message
              : "Recommendation request failed.";
        setResults([]);
        setResultMessage(message);
      } finally {
        setIsSearching(false);
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }
    }, 300);
  };

  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <StatsSection
        embeddingDim={stats?.embedding_dim ?? 0}
        paperCount={stats?.paper_count ?? 0}
        modelName={stats?.model ?? "all-MiniLM-L6-v2"}
      />
      {backendStatusError && (
        <p role="alert" className="container mx-auto px-6 py-3 text-center text-sm text-destructive">
          {backendStatusError}
        </p>
      )}
      <SearchSection onSearch={handleSearch} isSearching={isSearching} />
      <ResultsSection
        results={results}
        query={query}
        message={resultMessage}
        isLoading={isSearching}
      />
      <WorkflowSection />
      <DocumentationSection />

      <footer className="py-8 border-t border-border bg-background">
        <p className="text-center text-xs text-muted-foreground font-body">
          Research Paper Recommendation System — SBERT (Sentence-BERT) & cosine similarity
        </p>
      </footer>
    </main>
  );
};

export default Index;