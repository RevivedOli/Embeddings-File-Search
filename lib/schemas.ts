import { z } from "zod";

// Input validation schema
export const queryRequestSchema = z.object({
  question: z.string().min(1, "Question cannot be empty").max(1000, "Question too long"),
});

// Source schema
export const sourceSchema = z.object({
  id: z.string(),
  text: z.string(),
  metadata: z.record(z.unknown()),
  score: z.number(),
  prevChunk: z.string().optional(),
  nextChunk: z.string().optional(),
});

// OpenAI response schema (what we expect from OpenAI)
export const openAIResponseSchema = z.object({
  summary_markdown: z.string(),
  key_findings: z.array(z.string()),
  caveats: z.array(z.string()),
  related_questions: z.array(z.string()),
});

// Full API response schema
export const queryResponseSchema = z.object({
  summary_markdown: z.string(),
  key_findings: z.array(z.string()),
  caveats: z.array(z.string()),
  related_questions: z.array(z.string()),
  sources: z.array(sourceSchema),
  confidence: z.enum(["High", "Medium", "Low"]),
});

export type QueryRequest = z.infer<typeof queryRequestSchema>;
export type QueryResponse = z.infer<typeof queryResponseSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type OpenAIResponse = z.infer<typeof openAIResponseSchema>;
