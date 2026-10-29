import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  User,
  Tag,
  TrendingUp,
  CalendarDays,
  ExternalLink,
  Loader2,
} from "lucide-react";
import type { Recommendation } from "@/lib/recommendations";

interface ResultsSectionProps {
  results: Recommendation[];
  query: string;
  message?: string | null;
  isLoading?: boolean;
}

const ScoreBar = ({ score }: { score: number }) => {
  const percentage = Math.round(score * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full gold-gradient"
        />
      </div>
      <span className="text-sm font-mono-code font-medium text-foreground min-w-[52px] text-right">
        {(score * 100).toFixed(1)}%
      </span>
    </div>
  );
};

const SHORT_SUMMARY_LENGTH = 500;

const ResultsSection = ({ results, query, message, isLoading = false }: ResultsSectionProps) => {
  if (!query) return null;

  return (
    <section className="py-16 bg-muted/50" id="results">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">
                Recommendations
              </h2>
              <p className="text-sm text-muted-foreground font-body mt-1">
                {results.length} papers found for "{query}"
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
              <TrendingUp className="w-4 h-4" />
              Sorted by similarity
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-16 text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                <p className="font-body">Finding relevant papers…</p>
              </motion.div>
            ) : results.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground font-body">
                  {message || "No similar papers found. Try a different topic."}
                </p>
              </motion.div>
            ) : (
              <motion.div key="results" className="space-y-4">
                {results.map((rec, index) => {
                  const summary = rec.paper.abstract.trim();
                  const shortSummary =
                    summary.length > SHORT_SUMMARY_LENGTH
                      ? `${summary.slice(0, SHORT_SUMMARY_LENGTH).trimEnd()}…`
                      : summary;

                  return (
                    <motion.div
                      key={rec.paper.id || `${rec.paper.title}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      className="bg-card rounded-xl border border-border p-6 paper-shadow hover:glow-gold transition-shadow duration-300"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2 text-xs font-mono-code text-accent font-medium">
                          <span className="w-6 h-6 rounded-full gold-gradient flex items-center justify-center text-secondary-foreground text-xs font-bold">
                            {index + 1}
                          </span>
                          Rank #{index + 1}
                        </div>
                      </div>

                      <h3 className="text-lg font-display font-bold text-card-foreground mb-2">
                        {rec.paper.title || "Untitled paper"}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground font-body mb-3">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{rec.paper.authors || "Authors unavailable"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          <span>{rec.paper.publication_date || "Publication date unavailable"}</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground font-body leading-relaxed mb-4">
                        {shortSummary || "No summary available."}
                      </p>

                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground font-body mb-1">
                          Similarity Score
                        </p>
                        <ScoreBar score={rec.score} />
                      </div>

                      {rec.paper.keywords && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-body mb-4">
                          <Tag className="w-3 h-3" />
                          <span>{rec.paper.keywords}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm font-body">
                        {rec.paper.arxiv_url && (
                          <a
                            href={rec.paper.arxiv_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-accent hover:underline"
                          >
                            Abstract <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {rec.paper.pdf_url && (
                          <a
                            href={rec.paper.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-accent hover:underline"
                          >
                            PDF <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
