import { useState, useEffect } from "react";
import { toast } from "sonner";
import HeroSection from "@/components/HeroSection";
import SearchSection from "@/components/SearchSection";
import ResultsSection from "@/components/ResultsSection";
import StatsSection from "@/components/StatsSection";
import WorkflowSection from "@/components/WorkflowSection";
import DocumentationSection from "@/components/DocumentationSection";
import type { Recommendation } from "@/lib/recommendations";

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

  useEffect(() => {
    fetch(`${API_BASE}/stats`)
      .then((r) => {
        if (!r.ok) throw new Error("unavailable");
        return r.json();
      })
      .then((data: StatsResponse) => setStats(data))
      .catch(() => setStats(null));
  }, []);

  const handleSearch = (searchQuery: string, topN: number) => {
    setIsSearching(true);
    setQuery(searchQuery);

    window.setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/recommend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery, top_n: topN }),
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
        const data = (await res.json()) as { recommendations: Recommendation[] };
        setResults(data.recommendations);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Recommendation request failed");
        setResults([]);
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
      <SearchSection onSearch={handleSearch} isSearching={isSearching} />
      <ResultsSection results={results} query={query} />
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
