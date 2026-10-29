import { motion } from "framer-motion";
import { Database, Filter, BarChart3, Search, ListOrdered, FileOutput } from "lucide-react";

const steps = [
  {
    icon: Database,
    title: "Load Full Corpus",
    description: "Load all arXiv papers and their titles, abstracts, dates, and categories",
  },
  {
    icon: Filter,
    title: "Precompute Embeddings",
    description: "Generate and save separate title and abstract vectors once",
  },
  {
    icon: BarChart3,
    title: "Hybrid Similarity",
    description: "Blend title and abstract cosine scores using configurable weights",
  },
  {
    icon: Search,
    title: "Filter and Search",
    description: "Encode the query and optionally filter results by category or year",
  },
  {
    icon: ListOrdered,
    title: "Relevance Threshold",
    description: "Exclude papers below the configured minimum similarity score",
  },
  {
    icon: FileOutput,
    title: "Rank & Display",
    description: "Return strong matches, or explain when none meet the threshold",
  },
];

const WorkflowSection = () => {
  return (
    <section className="py-16 md:py-20 bg-background" id="workflow">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">
            System Workflow
          </h2>
          <p className="text-muted-foreground font-body">
            How the recommendation engine processes your query
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-card rounded-xl border border-border p-5 paper-shadow group hover:glow-gold transition-shadow duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center">
                  <step.icon className="w-4 h-4 text-secondary-foreground" />
                </div>
                <span className="text-xs font-mono-code text-muted-foreground">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="text-sm font-display font-bold text-card-foreground mb-1">
                {step.title}
              </h3>
              <p className="text-xs text-muted-foreground font-body leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
