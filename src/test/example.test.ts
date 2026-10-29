import { describe, expect, it } from "vitest";
import { parseRecommendationResponse } from "@/lib/recommendations";

const validResponse = {
  recommendations: [
    {
      paper: {
        id: "2401.01234",
        title: "A research paper",
        abstract: "An abstract.",
        authors: "A. Researcher",
        keywords: "cs.AI",
        publication_date: "2024-01-10",
        arxiv_url: "https://arxiv.org/abs/2401.01234",
        pdf_url: "https://arxiv.org/pdf/2401.01234",
      },
      score: 0.82,
    },
  ],
  message: null,
};

describe("parseRecommendationResponse", () => {
  it("parses a valid backend recommendation response", () => {
    expect(parseRecommendationResponse(validResponse)).toEqual(validResponse);
  });

  it("accepts nullable metadata and an explanatory empty-results message", () => {
    const response = {
      recommendations: [
        {
          paper: {
            ...validResponse.recommendations[0].paper,
            publication_date: null,
            arxiv_url: null,
            pdf_url: null,
          },
          score: 0.41,
        },
      ],
      message: null,
    };

    expect(parseRecommendationResponse(response)).toEqual(response);
    expect(parseRecommendationResponse({ recommendations: [], message: "No strong matches." })).toEqual({
      recommendations: [],
      message: "No strong matches.",
    });
  });

  it("rejects malformed results and non-finite similarity scores", () => {
    expect(() => parseRecommendationResponse({ recommendations: "invalid" })).toThrow(
      "Invalid recommendation response",
    );
    expect(() =>
      parseRecommendationResponse({
        recommendations: [{ ...validResponse.recommendations[0], score: Number.NaN }],
      }),
    ).toThrow("Invalid recommendation response");
  });
});
