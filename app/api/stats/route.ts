import { NextResponse } from "next/server";
import { getPineconeStats } from "@/lib/pinecone";

export async function GET() {
  try {
    const stats = await getPineconeStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats API Error:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to get Pinecone stats" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
