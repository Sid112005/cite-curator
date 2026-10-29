/**
 * Types for SBERT recommendation API responses (Python backend).
 */

export interface Paper {
  id: string;
  title: string;
  abstract: string;
  authors: string;
  keywords: string;
  publication_date: string | null;
  arxiv_url: string | null;
  pdf_url: string | null;
}

export interface Recommendation {
  paper: Paper;
  score: number;
}

export interface RecommendationFilters {
  category?: string;
  year?: number;
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
  message: string | null;
}

export function parseRecommendationResponse(value: unknown): RecommendationResponse {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid recommendation response from the backend.");
  }

  const response = value as Record<string, unknown>;
  if (!Array.isArray(response.recommendations)) {
    throw new Error("Invalid recommendation response from the backend.");
  }

  const recommendations = response.recommendations.map((item): Recommendation => {
    if (!item || typeof item !== "object") {
      throw new Error("Invalid recommendation response from the backend.");
    }
    const recommendation = item as Record<string, unknown>;
    const paper = recommendation.paper;
    if (!paper || typeof paper !== "object") {
      throw new Error("Invalid recommendation response from the backend.");
    }
    const details = paper as Record<string, unknown>;

    if (
      typeof recommendation.score !== "number" ||
      !Number.isFinite(recommendation.score) ||
      typeof details.id !== "string" ||
      typeof details.title !== "string" ||
      typeof details.abstract !== "string" ||
      typeof details.authors !== "string" ||
      typeof details.keywords !== "string" ||
      !isNullableString(details.publication_date) ||
      !isNullableString(details.arxiv_url) ||
      !isNullableString(details.pdf_url)
    ) {
      throw new Error("Invalid recommendation response from the backend.");
    }

    return {
      score: recommendation.score,
      paper: {
        id: details.id,
        title: details.title,
        abstract: details.abstract,
        authors: details.authors,
        keywords: details.keywords,
        publication_date: details.publication_date,
        arxiv_url: details.arxiv_url,
        pdf_url: details.pdf_url,
      },
    };
  });

  if (response.message !== undefined && response.message !== null && typeof response.message !== "string") {
    throw new Error("Invalid recommendation response from the backend.");
  }

  return {
    recommendations,
    message: typeof response.message === "string" ? response.message : null,
  };
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}
