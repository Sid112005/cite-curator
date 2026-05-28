/**
 * Types for SBERT recommendation API responses (Python backend).
 */

export interface Paper {
  id: string;
  title: string;
  abstract: string;
  authors: string;
  keywords: string;
}

export interface Recommendation {
  paper: Paper;
  score: number;
}
