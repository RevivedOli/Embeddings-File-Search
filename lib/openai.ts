import OpenAI from "openai";
import { openAIResponseSchema, type OpenAIResponse } from "./schemas";

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getOpenAIClient();
  const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-large";
  const response = await client.embeddings.create({
    model: embeddingModel,
    input: text,
  });
  return response.data[0].embedding;
}

export async function generateSummary(
  question: string,
  sources: Array<{ text: string; metadata: Record<string, unknown> }>
): Promise<OpenAIResponse> {
  const client = getOpenAIClient();
  const model = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";

  // Build context from sources with proper formatting (matching n8n format)
  const context = sources
    .map((source, idx) => {
      const batesNumber = source.metadata.bates_number as string || 
                         source.metadata.document_id as string || 
                         source.metadata.id as string || 
                         `Source-${idx + 1}`;
      const datasetNumber = source.metadata.dataset_number as string || 
                           source.metadata.dataset as string || 
                           source.metadata.dataset_id as string || 
                           "Unknown";
      const pageCount = source.metadata.page_count as string || 
                       source.metadata.pages as string || 
                       "Unknown";
      const dojUrl = source.metadata.doj_url as string || "";
      const textPreview = source.text || "";
      
      // Format similar to n8n's output format
      let sourceBlock = `---\n**Document:** \`${batesNumber}\``;
      if (dojUrl) {
        sourceBlock += ` — [View Original PDF](${dojUrl})`;
      }
      sourceBlock += `\n**Dataset:** ${datasetNumber}`;
      if (pageCount !== "Unknown") {
        sourceBlock += ` | **Pages:** ${pageCount}`;
      }
      sourceBlock += `\n**Relevant Extract:**\n> ${textPreview}\n---`;
      
      return sourceBlock;
    })
    .join("\n\n");

  const systemPrompt = `You are an expert research assistant specialising in the Jeffrey Epstein investigation files released by the U.S. Department of Justice under the Epstein Files Transparency Act (EFTA). You have access to a vector database containing text extracted from thousands of official DOJ documents including FBI interview summaries (302 reports), police reports, court filings, legal correspondence, financial records, flight manifests, emails, and other investigative materials.

## Your Role

You help journalists, researchers, lawyers, and members of the public search, understand, and cross-reference information from the Epstein files. You are thorough, precise, and always ground your answers in the source documents. You never speculate beyond what the documents say.

## Response Format

CRITICAL: You MUST return a valid JSON object with EXACTLY this structure (all four fields are required):
{
  "summary_markdown": "A clear, concise answer to the user's question in 2-4 sentences. State what the documents show and don't show. Use markdown formatting. Do NOT include 'Key Findings' or 'Caveats' sections in this field.",
  "key_findings": ["Finding 1 as a string", "Finding 2 as a string"],
  "caveats": ["Caveat 1 as a string", "Caveat 2 as a string"],
  "related_questions": ["Question 1 as a string", "Question 2 as a string", "Question 3 as a string"]
}

## Rules for Each Field

### summary_markdown
- Write a clear, concise answer in 2-4 sentences
- State what the documents show and don't show
- If documents don't contain relevant information, say so clearly
- Use markdown formatting (headers, lists, emphasis)
- Do NOT include "Key Findings" or "Caveats" headings in this field

### key_findings
- MUST be an array of strings, even if empty
- Each string is one key finding
- Present relevant information found across the documents
- Group related findings together
- For each finding: state what the document says (paraphrased, not invented)
- Note any redactions, gaps, or ambiguities in the source
- Flag if information appears across multiple documents (corroboration)
- If there are no key findings, use an empty array: []

### caveats
- MUST be an array of strings, even if empty
- Always include relevant caveats such as:
  - The DOJ used low-quality OCR (96 DPI) so some text extraction may contain errors
  - Redactions may obscure relevant information
  - The presence of a name in these files does not imply wrongdoing
  - Some documents contain "untrue and sensationalist claims" as noted by the DOJ itself
  - OCR quality may affect accuracy of dates and names
  - If a finding relies on a single source, note that it is uncorroborated
- If there are no caveats, use an empty array: []

## Important Rules

1. **Never fabricate information.** If the documents don't contain something, say so. Do not hallucinate document contents, Bates numbers, or URLs.
2. **Always ground in sources.** Every factual claim must be based on the provided source chunks.
3. **Quote directly when possible.** Reference the exact text from the document chunks. Mark OCR errors with [sic] if obvious.
4. **Be neutral.** Present what the documents say without editorialising. The presence of someone's name in investigative files does not imply guilt.
5. **Flag uncertainty.** If OCR quality makes a passage ambiguous, say so. If a finding relies on a single source, note that it is uncorroborated.
6. **Respect privacy.** Do not draw attention to or speculate about redacted names. Redactions exist to protect victims and their families.
7. **Be helpful.** Note any connections between documents (same names, dates, contradictions).
8. **Handle sensitive content carefully.** These files contain descriptions of serious crimes. Be factual and clinical, never sensational.

### related_questions
- MUST be an array of strings with exactly 3-5 questions
- Generate thoughtful, specific follow-up questions that would help users explore related topics
- Questions should be:
  - Directly related to the user's query and the documents found
  - Specific enough to be actionable (not vague like "tell me more")
  - Focused on different aspects or angles of the topic
  - Based on what you found in the source documents (e.g., if documents mention specific names, dates, or events, create questions about those)
  - Formatted as complete questions (e.g., "What do the files say about [specific topic]?" or "Who was involved in [specific event]?")
- Examples of good related questions:
  - "What evidence exists about [specific person mentioned]?"
  - "When did [specific event] occur according to the documents?"
  - "What do the files reveal about [related topic]?"
  - "Which documents mention [specific detail from sources]?"
- Avoid generic questions like "What else can you tell me?" or "Tell me more"

## JSON Response Requirements

- summary_markdown: String with markdown formatting
- key_findings: Array of strings (each string is one finding)
- caveats: Array of strings (each string is one caveat)
- related_questions: Array of strings (3-5 specific, actionable questions)
- All fields are required, but key_findings and caveats arrays can be empty: []`;

  const userPrompt = `Question: ${question}

Source Documents:
${context}

IMPORTANT INSTRUCTIONS:
- Analyze ALL provided source documents carefully - do not skip any
- If the question asks about something specific (like "judges", "names", "dates"), search through EVERY source for any mentions
- Review each source document thoroughly for relevance, even if it seems less relevant at first
- Extract and include ALL relevant information from the sources
- If information exists in the sources, you MUST include it in your response
- Don't filter out information - be comprehensive in your analysis
- Base your response entirely on the source documents provided above

Provide a structured analysis in the specified JSON format. Remember: key_findings and caveats must be arrays of strings, not markdown text.`;

  // Debug logging
  console.log(`[OpenAI] Model: ${model}`);
  console.log(`[OpenAI] Number of sources: ${sources.length}`);
  console.log(`[OpenAI] Total context length: ${context.length} characters`);
  console.log(`[OpenAI] First source preview: ${sources[0]?.text?.substring(0, 100) || "N/A"}...`);

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  try {
    const parsed = JSON.parse(content);
    
    // Ensure key_findings, caveats, and related_questions are arrays, with fallbacks
    const result = {
      summary_markdown: parsed.summary_markdown || "",
      key_findings: Array.isArray(parsed.key_findings) 
        ? parsed.key_findings 
        : (parsed.key_findings ? [String(parsed.key_findings)] : []),
      caveats: Array.isArray(parsed.caveats)
        ? parsed.caveats
        : (parsed.caveats ? [String(parsed.caveats)] : []),
      related_questions: Array.isArray(parsed.related_questions)
        ? parsed.related_questions
        : (parsed.related_questions ? [String(parsed.related_questions)] : []),
    };
    
    return openAIResponseSchema.parse(result);
  } catch (error) {
    console.error("Failed to parse OpenAI response:", error);
    console.error("Response content:", content);
    
    // Try to extract from markdown as fallback
    try {
      const parsed = JSON.parse(content);
      const summary = parsed.summary_markdown || "";
      
      // Extract key findings and caveats from markdown if they exist there
      const keyFindingsMatch = summary.match(/##\s*Key Findings?\s*\n([\s\S]*?)(?=\n##|$)/i);
      const caveatsMatch = summary.match(/##\s*Caveats?\s*\n([\s\S]*?)(?=\n##|$)/i);
      
      const keyFindings = keyFindingsMatch 
        ? keyFindingsMatch[1]
            .split('\n')
            .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('*'))
            .map((line: string) => line.replace(/^[-*]\s*/, '').trim())
            .filter(Boolean)
        : [];
      
      const caveats = caveatsMatch
        ? caveatsMatch[1]
            .split('\n')
            .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('*'))
            .map((line: string) => line.replace(/^[-*]\s*/, '').trim())
            .filter(Boolean)
        : [];
      
      // Remove key findings and caveats sections from summary
      const cleanSummary = summary
        .replace(/##\s*Key Findings?\s*\n[\s\S]*?(?=\n##|$)/gi, '')
        .replace(/##\s*Caveats?\s*\n[\s\S]*?(?=\n##|$)/gi, '')
        .trim();
      
      const result = {
        summary_markdown: cleanSummary || summary,
        key_findings: keyFindings.length > 0 ? keyFindings : (Array.isArray(parsed.key_findings) ? parsed.key_findings : []),
        caveats: caveats.length > 0 ? caveats : (Array.isArray(parsed.caveats) ? parsed.caveats : []),
        related_questions: Array.isArray(parsed.related_questions) ? parsed.related_questions : [],
      };
      
      return openAIResponseSchema.parse(result);
    } catch (fallbackError) {
      console.error("Fallback parsing also failed:", fallbackError);
      throw new Error("Invalid response format from OpenAI");
    }
  }
}
