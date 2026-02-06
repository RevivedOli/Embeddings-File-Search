# Epstein File Explorer

A modern, AI-powered investigative tool for querying the Epstein files. Built with Next.js, Pinecone vector search, and OpenAI.

## Features

- **AI-Powered Search**: Ask questions and get structured summaries with source references
- **Source Credibility**: View document context, copy citations, and navigate between chunks
- **Search History**: LocalStorage-based history (no database, no login required)
- **Shareable Links**: Generate shareable URLs that regenerate results on load
- **Confidence Scoring**: High/Medium/Low confidence indicators based on source quality
- **Modern UI**: Dark theme with purple accents, smooth animations, and professional design

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS with custom dark/purple theme
- **Vector DB**: Pinecone
- **AI**: OpenAI (text-embedding-3-large for embeddings, configurable chat model)
- **Validation**: Zod for schema validation
- **Rate Limiting**: IP-based rate limiting

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

**For local development (localhost only):**
```bash
npm run dev
```

**For mobile testing on local network:**
```bash
npm run dev:network
```

Then:
1. Find your computer's local IP address:
   - **macOS/Linux**: Run `ifconfig | grep "inet " | grep -v 127.0.0.1` or check System Preferences > Network
   - **Windows**: Run `ipconfig` and look for IPv4 Address
2. On your mobile device, connect to the same Wi-Fi network as your computer
3. Open your mobile browser and navigate to `http://YOUR_IP_ADDRESS:3000` (e.g., `http://192.168.1.100:3000`)

**Note**: Make sure your firewall allows incoming connections on port 3000.

### 3. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-large
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=your_index_name_here
PINECONE_NAMESPACE=your_namespace_here
PINECONE_TOP_K=10
```

**Optional Environment Variables:**
- `OPENAI_EMBEDDING_MODEL`: Embedding model to use (default: `text-embedding-3-large`)
- `PINECONE_TOP_K`: Number of results to return from Pinecone (default: `10`)

**For Vercel Deployment:**
Add these environment variables in your Vercel project settings (Settings → Environment Variables).

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── app/
│   ├── api/query/route.ts      # API endpoint for queries
│   ├── components/             # React components
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main page
│   └── globals.css              # Global styles
├── lib/
│   ├── openai.ts               # OpenAI client and functions
│   ├── pinecone.ts             # Pinecone client and search
│   ├── rate-limit.ts           # Rate limiting logic
│   ├── schemas.ts              # Zod validation schemas
│   └── utils.ts                # Utility functions
└── types/
    └── index.ts                # TypeScript type definitions
```

## API Endpoint

### POST `/api/query`

Query the Epstein files database.

**Request:**
```json
{
  "question": "Your investigative question here"
}
```

**Response:**
```json
{
  "summary_markdown": "Markdown formatted summary...",
  "key_findings": ["Finding 1", "Finding 2"],
  "caveats": ["Caveat 1"],
  "sources": [
    {
      "id": "source-id",
      "text": "Source text...",
      "metadata": {...},
      "score": 0.85
    }
  ],
  "confidence": "High"
}
```

## Security

- All API keys are stored server-side in environment variables
- IP-based rate limiting (10 requests per minute per IP)
- Zod input validation on all API requests
- No sensitive data exposed to the client

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

The API routes will automatically be deployed as serverless functions.

## Notes

- Search history is stored in browser localStorage only (no database)
- Shareable URLs encode the query in the URL; results regenerate on load
- No user authentication or login required
- All processing happens server-side for security
