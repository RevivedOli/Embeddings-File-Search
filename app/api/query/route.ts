import { NextRequest, NextResponse } from "next/server";
import { queryRequestSchema, queryResponseSchema } from "@/lib/schemas";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { generateEmbedding } from "@/lib/openai";
import { searchPinecone } from "@/lib/pinecone";
import { generateSummary } from "@/lib/openai";
import { calculateConfidence } from "@/lib/utils";
import type { Source } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const rateLimitResult = checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfter || 60),
          },
        }
      );
    }

    // Parse and validate input
    const body = await request.json();
    const validatedInput = queryRequestSchema.parse(body);
    const { question } = validatedInput;

    // Generate embedding for the question
    const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-large";
    console.log(`[Query] Using embedding model: ${embeddingModel}`);
    console.log(`[Query] Question: ${question}`);
    
    const queryVector = await generateEmbedding(question);

    // Search Pinecone (configurable topK, default 10)
    const topK = parseInt(process.env.PINECONE_TOP_K || "10", 10);
    const namespace = process.env.PINECONE_NAMESPACE || "default";
    console.log(`[Query] Pinecone topK: ${topK}, namespace: ${namespace}`);
    
    const pineconeResults = await searchPinecone(queryVector, topK);
    console.log(`[Query] Found ${pineconeResults.length} results from Pinecone`);

    if (pineconeResults.length === 0) {
      return NextResponse.json({
        summary_markdown: "No relevant documents found for this query.",
        key_findings: [],
        caveats: ["No matching sources were found in the database."],
        related_questions: [
          "Try rephrasing your question with different keywords",
          "Search for specific names, dates, or document types",
          "Explore broader topics related to your query"
        ],
        sources: [],
        confidence: "Low" as const,
      });
    }

    // Transform Pinecone results to Source format
    // Try multiple possible field names for text content (text_preview is the actual field)
    const sources: Source[] = pineconeResults.map((result, index) => {
      const text = (result.metadata.text_preview as string) || 
                   (result.metadata.text as string) || 
                   (result.metadata.content as string) || 
                   (result.metadata.chunk_text as string) ||
                   (result.metadata.body as string) ||
                   "";
      
      if (!text && index === 0) {
        console.warn(`[Query] Warning: No text found in first result. Metadata keys:`, Object.keys(result.metadata));
      }
      
      return {
        id: result.id || `source-${index}`,
        text,
        metadata: result.metadata,
        score: result.score || 0,
      };
    });
    
    // Log source details for debugging
    console.log(`[Query] Total sources after processing: ${sources.length}`);
    console.log(`[Query] Sources with text: ${sources.filter(s => s.text).length}`);
    console.log(`[Query] First source text length: ${sources[0]?.text?.length || 0}`);
    console.log(`[Query] Source scores:`, sources.map(s => s.score?.toFixed(3)).join(", "));
    
    // Filter out sources with no text
    const validSources = sources.filter(s => s.text && s.text.length > 0);
    if (validSources.length < sources.length) {
      console.warn(`[Query] Filtered out ${sources.length - validSources.length} sources with no text`);
    }
    
    if (validSources.length === 0) {
      return NextResponse.json({
        summary_markdown: "No valid source documents found. The retrieved documents did not contain extractable text content.",
        key_findings: [],
        caveats: ["No text content was found in the retrieved documents. This may indicate an issue with the document indexing or metadata structure."],
        related_questions: [
          "Try a different search query",
          "Search for specific document types or dates",
          "Explore related topics in the database"
        ],
        sources: [],
        confidence: "Low" as const,
      });
    }

    // Prepare sources for OpenAI (with text content)
    const sourcesForOpenAI = validSources.map((s) => ({
      text: s.text,
      metadata: s.metadata,
    }));

    console.log(`[Query] Sending ${sourcesForOpenAI.length} valid sources to OpenAI`);

    // Generate summary using OpenAI
    const openAIResponse = await generateSummary(question, sourcesForOpenAI);

    // Calculate confidence
    const confidence = calculateConfidence(sources);

    // Build response
    const response = {
      summary_markdown: openAIResponse.summary_markdown,
      key_findings: openAIResponse.key_findings,
      caveats: openAIResponse.caveats,
      related_questions: openAIResponse.related_questions || [],
      sources,
      confidence,
    };

    // Validate response
    const validatedResponse = queryResponseSchema.parse(response);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error("API Error:", error);
    
    if (error instanceof Error) {
      // Zod validation errors
      if (error.name === "ZodError") {
        return NextResponse.json(
          { error: "Invalid request format", details: error.message },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || "Internal server error" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
