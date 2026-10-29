import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecommendationFilters } from "@/lib/recommendations";

interface SearchSectionProps {
  onSearch: (query: string, topN: number, filters?: RecommendationFilters) => void;
  isSearching: boolean;
}

const EXAMPLE_QUERIES = [
  "deep learning for image recognition",
  "natural language processing transformers",
  "reinforcement learning robotics",
  "privacy preserving machine learning",
  "medical image analysis",
  "recommendation systems",
  "sentiment analysis social media",
  "quantum machine learning",
];

const SearchSection = ({ onSearch, isSearching }: SearchSectionProps) => {
  const [query, setQuery] = useState("");
  const [topN, setTopN] = useState(5);
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, topN, {
        ...(category.trim() ? { category: category.trim() } : {}),
        ...(year ? { year: Number(year) } : {}),
      });
    }
  };

  return (
    <section className="py-16 md:py-20 bg-background" id="search">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl font-display font-bold text-foreground text-center mb-2">
            Enter Your Research Topic
          </h2>
          <p className="text-muted-foreground font-body text-center mb-8">
            Type a research topic and the system will recommend the most relevant papers
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., deep learning for natural language processing"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-card text-card-foreground font-body text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow paper-shadow"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="category" className="block text-xs text-muted-foreground font-body mb-1">
                  Category (optional)
                </label>
                <input
                  id="category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., cs.AI"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="year" className="block text-xs text-muted-foreground font-body mb-1">
                  Publication year (optional)
                </label>
                <input
                  id="year"
                  type="number"
                  min="1"
                  max="9999"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g., 2020"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 font-body text-sm text-muted-foreground">
                <label htmlFor="topN">Top results:</label>
                <select
                  id="topN"
                  value={topN}
                  onChange={(e) => setTopN(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg border border-border bg-card text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {[3, 5, 8, 10].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                disabled={!query.trim() || isSearching}
                className="gold-gradient text-secondary-foreground font-body font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                Recommend
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <p className="text-xs text-muted-foreground font-body mb-2">Try these topics:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuery(q);
                    onSearch(q, topN);
                  }}
                  className="px-3 py-1 rounded-full text-xs font-body border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SearchSection;
