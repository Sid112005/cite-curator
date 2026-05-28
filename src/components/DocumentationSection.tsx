import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, BookOpen } from "lucide-react";

interface DocItem {
  title: string;
  content: string;
}

const docs: DocItem[] = [
  {
    title: "Content-Based Filtering",
    content:
      "Content-based filtering recommends items based on their features (content) rather than user behavior. In this system, we compare dense vector representations of each paper (title + abstract) against the user's query. Unlike collaborative filtering, no user history or ratings are needed — the recommendation is purely based on semantic similarity of the text.",
  },
  {
    title: "Sentence-BERT (SBERT) & all-MiniLM-L6-v2",
    content:
      "Sentence-BERT maps sentences and paragraphs to a fixed-size embedding using a transformer fine-tuned for semantic textual similarity. The all-MiniLM-L6-v2 model from Sentence Transformers produces 384-dimensional vectors that capture meaning beyond bag-of-words overlap, so related topics match even when wording differs.",
  },
  {
    title: "Cosine Similarity (util.cos_sim)",
    content:
      "Cosine similarity measures the cosine of the angle between two vectors. With L2-normalized embeddings (as produced by this pipeline), it is equivalent to the dot product and ranges from -1 to 1; higher values indicate stronger alignment. The backend uses sentence_transformers.util.cos_sim between the query embedding and all corpus embeddings, then takes the top results.",
  },
  {
    title: "Why This is Unsupervised Learning",
    content:
      "The retriever does not require query–document relevance labels for your dataset. Pre-trained SBERT already encodes general language semantics; we only embed your corpus and compare vectors. No fine-tuning step is required for basic semantic search over papers.",
  },
  {
    title: "Why Collaborative Filtering is Not Used",
    content:
      "Collaborative filtering requires user interaction data (ratings, clicks) from many users. For research discovery we instead use content similarity: each paper is represented only by its text, which works for new papers and niche topics without interaction history.",
  },
  {
    title: "Search Engine vs. Recommendation System",
    content:
      "Keyword search retrieves literal term matches. This system encodes your topic and each paper into the same vector space and ranks by cosine similarity, surfacing conceptually related work even when vocabulary differs — closer to semantic search / recommendation than classic inverted-index retrieval.",
  },
];

const DocAccordionItem = ({ item, isOpen, toggle }: { item: DocItem; isOpen: boolean; toggle: () => void }) => (
  <div className="border border-border rounded-xl overflow-hidden bg-card paper-shadow">
    <button
      onClick={toggle}
      className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
    >
      <span className="font-display font-bold text-card-foreground text-sm md:text-base">
        {item.title}
      </span>
      <ChevronDown
        className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
    <motion.div
      initial={false}
      animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <p className="px-5 pb-5 text-sm text-muted-foreground font-body leading-relaxed">
        {item.content}
      </p>
    </motion.div>
  </div>
);

const DocumentationSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-20 bg-muted/30" id="documentation">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-accent" />
            <span className="text-sm font-body text-accent font-medium">Documentation</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">
            Key Concepts Explained
          </h2>
          <p className="text-muted-foreground font-body">
            Understanding the theory behind the recommendation engine
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {docs.map((doc, i) => (
            <motion.div
              key={doc.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <DocAccordionItem
                item={doc}
                isOpen={openIndex === i}
                toggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DocumentationSection;
