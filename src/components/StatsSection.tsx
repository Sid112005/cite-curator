import { motion } from "framer-motion";

interface StatsSectionProps {
  embeddingDim: number;
  paperCount: number;
  modelName: string;
}

const StatsSection = ({ embeddingDim, paperCount, modelName }: StatsSectionProps) => {
  const stats = [
    { label: "Papers Indexed", value: paperCount },
    { label: "Embedding Dim", value: embeddingDim > 0 ? embeddingDim.toLocaleString() : "—" },
    { label: "Model", value: modelName },
    { label: "Similarity", value: "Cosine" },
  ];

  return (
    <section className="py-10 bg-background border-y border-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-2xl font-display font-bold text-foreground">
                {typeof stat.value === "number" ? stat.value : stat.value}
              </p>
              <p className="text-xs text-muted-foreground font-body mt-1">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
