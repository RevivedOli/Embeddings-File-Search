import { type ConfidenceLevel, type Source } from "@/types";

export function calculateConfidence(sources: Source[]): ConfidenceLevel {
  if (sources.length === 0) {
    return "Low";
  }

  // Factors for confidence:
  // 1. Number of sources (more = better)
  // 2. Average relevance score
  // 3. OCR quality (if available)
  // 4. Top source score (highest relevance)

  const avgScore = sources.reduce((sum, s) => sum + (s.score || 0), 0) / sources.length;
  const topScore = Math.max(...sources.map(s => s.score || 0));
  const highQualitySources = sources.filter(
    (s) => s.metadata.ocr_quality === "high" || s.metadata.ocr_quality === "good"
  ).length;

  let score = 0;
  
  // Source count factor (0-30 points) - adjusted thresholds
  if (sources.length >= 8) score += 30;
  else if (sources.length >= 5) score += 20;
  else if (sources.length >= 3) score += 12;
  else if (sources.length >= 1) score += 5;

  // Average relevance score factor (0-35 points) - adjusted thresholds
  if (avgScore >= 0.85) score += 35;
  else if (avgScore >= 0.75) score += 25;
  else if (avgScore >= 0.65) score += 15;
  else if (avgScore >= 0.5) score += 8;
  else if (avgScore >= 0.3) score += 3;

  // Top source score factor (0-25 points) - highest relevance matters
  if (topScore >= 0.9) score += 25;
  else if (topScore >= 0.8) score += 18;
  else if (topScore >= 0.7) score += 12;
  else if (topScore >= 0.6) score += 6;
  else if (topScore >= 0.5) score += 3;

  // OCR quality factor (0-10 points) - reduced weight
  const qualityRatio = highQualitySources / sources.length;
  if (qualityRatio >= 0.8) score += 10;
  else if (qualityRatio >= 0.6) score += 6;
  else if (qualityRatio >= 0.4) score += 3;

  // Debug logging
  console.log(`[Confidence] Sources: ${sources.length}, Avg Score: ${avgScore.toFixed(3)}, Top Score: ${topScore.toFixed(3)}, Total: ${score}`);

  if (score >= 75) return "High";
  if (score >= 45) return "Medium";
  return "Low";
}

// URL encoding/decoding for shareable links
export function encodeQuery(query: string): string {
  return encodeURIComponent(query);
}

export function decodeQuery(encoded: string): string {
  return decodeURIComponent(encoded);
}

// Generate shareable URL
export function generateShareableUrl(query: string, baseUrl: string = ""): string {
  const encoded = encodeQuery(query);
  return `${baseUrl}?q=${encoded}`;
}

// Parse query from URL
export function parseQueryFromUrl(searchParams: URLSearchParams): string | null {
  const q = searchParams.get("q");
  if (!q) return null;
  try {
    return decodeQuery(q);
  } catch {
    return null;
  }
}
