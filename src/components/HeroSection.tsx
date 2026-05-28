import { motion } from "framer-motion";
import { BookOpen, Search, Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden navy-gradient py-24 md:py-32">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-accent blur-[100px]" />
        <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-accent blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 mb-8">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-primary-foreground/80 font-body">
              Content-Based Recommendation Engine
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6 leading-tight">
            Research Paper
            <br />
            <span className="text-gold-gradient">Recommendation System</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/70 font-body font-light max-w-2xl mx-auto mb-10">
            Discover relevant research papers using sentence embeddings (SBERT) and
            cosine similarity. Enter any topic and let the engine find the most
            semantically similar papers from the arXiv corpus.
          </p>

          <div className="flex items-center justify-center gap-8 text-primary-foreground/50 font-body text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>arXiv dataset</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>SBERT + Cosine Similarity</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
