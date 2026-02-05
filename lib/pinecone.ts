import { Pinecone } from "@pinecone-database/pinecone";

let pineconeClient: Pinecone | null = null;

export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error("PINECONE_API_KEY is not set");
    }
    pineconeClient = new Pinecone({ apiKey });
  }
  return pineconeClient;
}

export async function searchPinecone(
  queryVector: number[],
  topK: number = 10
): Promise<Array<{ id: string; score?: number; metadata: Record<string, unknown> }>> {
  const client = getPineconeClient();
  const indexName = process.env.PINECONE_INDEX_NAME;
  const namespace = process.env.PINECONE_NAMESPACE;

  if (!indexName) {
    throw new Error("PINECONE_INDEX_NAME is not set");
  }

  // Get the index
  let index = client.index(indexName);
  
  // If namespace is specified, use the namespace() method
  if (namespace) {
    index = index.namespace(namespace);
  }

  // Query the index (namespace is now handled via the namespace() method)
  const queryResponse = await index.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
  });

  return (
    queryResponse.matches?.map((match) => ({
      id: match.id || "",
      score: match.score,
      metadata: (match.metadata || {}) as Record<string, unknown>,
    })) || []
  );
}

export async function getPineconeStats(): Promise<{
  totalRecordCount: number;
  namespace?: string;
  indexName: string;
}> {
  const client = getPineconeClient();
  const indexName = process.env.PINECONE_INDEX_NAME;
  const namespace = process.env.PINECONE_NAMESPACE;

  if (!indexName) {
    throw new Error("PINECONE_INDEX_NAME is not set");
  }

  // Get the index
  let index = client.index(indexName);
  
  // If namespace is specified, use the namespace() method
  if (namespace) {
    index = index.namespace(namespace);
  }

  // Get index stats
  const stats = await index.describeIndexStats();
  
  return {
    totalRecordCount: stats.totalRecordCount || 0,
    namespace: namespace || undefined,
    indexName,
  };
}
