export type ConfidenceLevel = "High" | "Medium" | "Low";

export interface Source {
  id: string;
  text: string;
  metadata: {
    document_id?: string;
    title?: string;
    date?: string;
    source?: string;
    ocr_quality?: string;
    chunk_index?: number;
    total_chunks?: number;
    [key: string]: unknown;
  };
  score: number;
  prevChunk?: string;
  nextChunk?: string;
}

export interface QueryResponse {
  summary_markdown: string;
  key_findings: string[];
  caveats: string[];
  sources: Source[];
  confidence: ConfidenceLevel;
}

export interface QueryRequest {
  question: string;
}

export interface SearchHistoryItem {
  id: string;
  question: string;
  timestamp: number;
  confidence?: ConfidenceLevel;
}
