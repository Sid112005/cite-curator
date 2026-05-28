import { motion, AnimatePresence } from "framer-motion";
import { FileText, User, Tag, TrendingUp } from "lucide-react";
import type { Recommendation } from "@/lib/recommendations";

interface ResultsSectionProps {
  results: Recommendation[];
  query: string;
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

const ResultsSection = ({ results, query }: ResultsSectionProps) => {
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
            {results.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground font-body">
                  No similar papers found. Try a different topic.
                </p>
              </motion.div>
            ) : (
              <motion.div key="results" className="space-y-4">
                {results.map((rec, index) => (
                  <motion.div
                    key={rec.paper.id}
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
                      {rec.paper.title}
                    </h3>

                    <p className="text-sm text-muted-foreground font-body leading-relaxed mb-4">
                      {rec.paper.abstract}
                    </p>

                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground font-body mb-1">
                        Similarity Score
                      </p>
                      <ScoreBar score={rec.score} />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-body">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {rec.paper.authors}
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {rec.paper.keywords}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
