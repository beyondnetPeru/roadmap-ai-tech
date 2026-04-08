# Phase 2: Semantic Memory (Embeddings & Vector Databases)

> **Goal:** Learn how to translate text into mathematical vectors so that AI can understand and search your project's documentation, business rules, and code semantically — by _meaning_, not keywords.

---

## Theoretical Concepts

### 2.1 What Are Embeddings?

**Definition:** An embedding is a dense numerical vector (array of floats) that captures the _semantic meaning_ of a piece of text. Texts with similar meanings produce vectors that are close together in vector space, even if they use completely different words.

**Example:**

```
"cancel the order"  → [0.12, -0.34, 0.78, ...]  ─┐
"abort the purchase" → [0.11, -0.33, 0.77, ...]  ─┘ very close (cosine similarity ~0.95)
"the weather is nice" → [-0.56, 0.91, 0.02, ...] ── far away (cosine similarity ~0.12)
```

**Key properties:**
| Property | Description |
|----------|-------------|
| **Dimensionality** | Typically 256–3072 floats per vector. Higher = more nuance, but slower to search. |
| **Distance metrics** | **Cosine similarity** (angle between vectors, most common), Euclidean distance, Dot product. |
| **Model-specific** | Vectors from different models are NOT comparable. Always use the same model for indexing and querying. |
| **Multilingual** | Modern models (e.g., `text-embedding-3-small`) support 100+ languages natively. |

**How embedding models work:** The model is a neural network trained on massive text corpora. It learns to map semantically similar texts to nearby points in vector space. You send text in, you get a float array out. No generation, no completion — just a mathematical representation.

**Reference:** [Pinecone — What are Vector Embeddings?](https://www.pinecone.io/learn/vector-embeddings/) — The best visual explainer of embeddings, distance metrics, and use cases.

### 2.2 Text Chunking

**Definition:** The process of splitting large documents into smaller, overlapping pieces ("chunks") before embedding them. This is critical because:

1. Embedding models have token limits (typically 512–8192 tokens)
2. Smaller chunks produce more focused, precise embeddings
3. Retrieval returns specific relevant sections, not entire documents

**Chunking strategies:**

| Strategy                     | Description                                                    | Best for                  |
| ---------------------------- | -------------------------------------------------------------- | ------------------------- |
| **Fixed-size**               | Split every N characters/tokens with overlap                   | General purpose, simplest |
| **Recursive text splitting** | Split by paragraphs → sentences → words, respecting boundaries | Markdown, documentation   |
| **Semantic chunking**        | Use embeddings to detect topic boundaries                      | Long, varied documents    |
| **Code-aware**               | Split by functions/classes/modules                             | Source code               |

**Overlap:** Always use 10-20% overlap between chunks to avoid losing context at boundaries.

**Reference:** [LangChain Text Splitters](https://js.langchain.com/docs/concepts/text_splitters) — Comprehensive guide to all splitting strategies.

### 2.3 Vector Databases

**Definition:** Specialized databases optimized for storing and querying high-dimensional vectors using similarity search (Approximate Nearest Neighbors — ANN) rather than exact keyword matches.

**How similarity search works:**

```
Query: "how to cancel an order"
  → Embed query → [0.12, -0.34, 0.78, ...]
  → Search vector DB for closest vectors (ANN algorithm)
  → Returns top-K most semantically similar chunks
```

**Popular vector databases:**

| Database     | Type                 | Best for                          | Reference                                                            |
| ------------ | -------------------- | --------------------------------- | -------------------------------------------------------------------- |
| **Qdrant**   | Self-hosted or cloud | Production, filtering, payloads   | [qdrant.tech/documentation](https://qdrant.tech/documentation/)      |
| **ChromaDB** | Embedded (local)     | Prototyping, small datasets       | [docs.trychroma.com](https://docs.trychroma.com/)                    |
| **Pinecone** | Managed cloud        | Serverless, zero-ops              | [docs.pinecone.io](https://docs.pinecone.io/)                        |
| **pgvector** | PostgreSQL extension | When you already use Postgres     | [github.com/pgvector/pgvector](https://github.com/pgvector/pgvector) |
| **Supabase** | Managed (pgvector)   | Full-stack apps with auth/storage | [supabase.com/docs/guides/ai](https://supabase.com/docs/guides/ai)   |

**Reference:** [Qdrant — Quick Start](https://qdrant.tech/documentation/quick-start/) — Production-ready vector DB with excellent Node.js support.

---

## Hands-on Lab

### Prerequisites

```bash
mkdir phase-2-embeddings && cd phase-2-embeddings
npm init -y
npm install typescript ts-node @types/node
npm install @google/generative-ai    # Gemini embedding API
npm install @qdrant/js-client-rest   # Qdrant vector DB client
npm install uuid                      # For generating unique IDs
npx tsc --init --strict --target ES2022 --module commonjs --rootDir src --outDir dist
mkdir src
```

**Start Qdrant locally with Docker:**

```bash
docker run -d --name qdrant -p 6333:6333 -p 6334:6334 qdrant/qdrant:latest
```

> Verify it's running: open http://localhost:6333/dashboard in your browser.

### Exercise 1: Generate Embeddings with Gemini

**Goal:** Understand how text becomes vectors and compare similarity between texts.

Create `src/exercise-1-embeddings.ts`:

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

// Helper: compute cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (magA * magB);
}

async function embedText(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

async function main() {
  // 1. Embed three texts
  const texts = [
    "How to cancel an order in the e-commerce system",
    "Steps to abort a purchase and get a refund",
    "The weather forecast for tomorrow is sunny",
  ];

  const vectors = await Promise.all(texts.map(embedText));

  // 2. Compare similarity
  console.log(`Vector dimensionality: ${vectors[0].length}`);
  console.log(`\nSimilarity matrix:`);
  console.log(
    `"cancel order" vs "abort purchase":  ${cosineSimilarity(vectors[0], vectors[1]).toFixed(4)}`,
  );
  console.log(
    `"cancel order" vs "weather forecast": ${cosineSimilarity(vectors[0], vectors[2]).toFixed(4)}`,
  );
  console.log(
    `"abort purchase" vs "weather forecast": ${cosineSimilarity(vectors[1], vectors[2]).toFixed(4)}`,
  );
}

main();
```

**Run it:**

```bash
GEMINI_API_KEY=your-key npx ts-node src/exercise-1-embeddings.ts
```

**Expected output:**

```
Vector dimensionality: 768
Similarity matrix:
"cancel order" vs "abort purchase":  0.9234    ← high: same meaning!
"cancel order" vs "weather forecast": 0.1456   ← low: unrelated
"abort purchase" vs "weather forecast": 0.1302 ← low: unrelated
```

### Exercise 2: Chunk, Embed, and Store in Qdrant

**Goal:** Take a real Markdown document, split it into chunks, embed them, and store in a vector database for semantic search.

Create `src/sample-business-rules.md`:

```markdown
# E-Commerce Business Rules

## Order Cancellation

A customer can cancel an order within 24 hours of placement. After 24 hours, cancellation requires manager approval. Orders that have been shipped cannot be cancelled — the customer must initiate a return instead.

## Refund Policy

Refunds are processed within 5-7 business days after the returned item is received and inspected. Digital products are non-refundable after download. Partial refunds are available for orders where only some items are returned.

## Shipping Rules

Free shipping applies to orders over $50. Express shipping (1-2 days) costs $15.99. International orders require customs declaration and may incur additional duties. Perishable items cannot be shipped internationally.

## Inventory Management

Stock levels are updated in real-time. When stock drops below 10 units, an automatic reorder is triggered. Out-of-stock items are hidden from the storefront but remain searchable for notifications. Pre-orders require a minimum 30% deposit.

## Discount Rules

Discount codes cannot be stacked — only one code per order. Employee discounts (25%) do not apply to sale items. Loyalty points expire after 12 months of account inactivity.
```

Create `src/exercise-2-chunk-and-store.ts`:

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { readFileSync } from "fs";
import { randomUUID } from "crypto";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});
const qdrant = new QdrantClient({ url: "http://localhost:6333" });

const COLLECTION_NAME = "business-rules";
const VECTOR_SIZE = 768; // Gemini text-embedding-004 output dimension

// Step 1: Chunk the document by Markdown sections
function chunkBySection(
  markdown: string,
): { title: string; content: string }[] {
  const sections = markdown.split(/^## /m).filter(Boolean);
  return sections.map((section) => {
    const lines = section.trim().split("\n");
    const title = lines[0].replace(/^#+ /, "").trim();
    const content = lines.slice(1).join("\n").trim();
    return { title, content };
  });
}

// Step 2: Embed a chunk
async function embedText(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

async function main() {
  // Read and chunk the document
  const markdown = readFileSync("src/sample-business-rules.md", "utf-8");
  const chunks = chunkBySection(markdown);
  console.log(`📄 Document split into ${chunks.length} chunks`);

  // Create Qdrant collection (delete if exists for idempotency)
  try {
    await qdrant.deleteCollection(COLLECTION_NAME);
  } catch {}
  await qdrant.createCollection(COLLECTION_NAME, {
    vectors: { size: VECTOR_SIZE, distance: "Cosine" },
  });
  console.log(`✅ Created collection: ${COLLECTION_NAME}`);

  // Embed and upsert each chunk
  const points = await Promise.all(
    chunks.map(async (chunk, i) => {
      const textToEmbed = `${chunk.title}: ${chunk.content}`;
      const vector = await embedText(textToEmbed);
      console.log(
        `  📦 Embedded chunk ${i + 1}: "${chunk.title}" (${vector.length} dims)`,
      );
      return {
        id: randomUUID(),
        vector,
        payload: {
          title: chunk.title,
          content: chunk.content,
          source: "business-rules.md",
        },
      };
    }),
  );

  await qdrant.upsert(COLLECTION_NAME, { points });
  console.log(`\n✅ Stored ${points.length} chunks in Qdrant`);

  // Verify: count points in collection
  const info = await qdrant.getCollection(COLLECTION_NAME);
  console.log(
    `📊 Collection "${COLLECTION_NAME}": ${info.points_count} points`,
  );
}

main();
```

**Run it:**

```bash
GEMINI_API_KEY=your-key npx ts-node src/exercise-2-chunk-and-store.ts
```

**Expected output:**

```
📄 Document split into 5 chunks
✅ Created collection: business-rules
  📦 Embedded chunk 1: "Order Cancellation" (768 dims)
  📦 Embedded chunk 2: "Refund Policy" (768 dims)
  📦 Embedded chunk 3: "Shipping Rules" (768 dims)
  📦 Embedded chunk 4: "Inventory Management" (768 dims)
  📦 Embedded chunk 5: "Discount Rules" (768 dims)
✅ Stored 5 chunks in Qdrant
📊 Collection "business-rules": 5 points
```

### Exercise 3: Semantic Search

**Goal:** Query the vector database with natural language and get the most relevant chunks.

Create `src/exercise-3-semantic-search.ts`:

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { QdrantClient } from "@qdrant/js-client-rest";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});
const qdrant = new QdrantClient({ url: "http://localhost:6333" });

async function semanticSearch(query: string, topK: number = 3) {
  console.log(`\n🔍 Query: "${query}"`);

  // Embed the query using the SAME model used for indexing
  const result = await embeddingModel.embedContent(query);
  const queryVector = result.embedding.values;

  // Search Qdrant for the most similar chunks
  const results = await qdrant.search("business-rules", {
    vector: queryVector,
    limit: topK,
    with_payload: true,
  });

  console.log(`📋 Top ${topK} results:`);
  results.forEach((hit, i) => {
    const payload = hit.payload as { title: string; content: string };
    console.log(
      `\n  ${i + 1}. [score: ${hit.score.toFixed(4)}] ${payload.title}`,
    );
    console.log(`     ${payload.content.substring(0, 120)}...`);
  });

  return results;
}

async function main() {
  // Try different queries — note how semantic search finds relevant chunks
  // even when the exact keywords don't match
  await semanticSearch("Can I get my money back for a digital download?");
  await semanticSearch("What happens when products run out of stock?");
  await semanticSearch("How do I cancel my order after it was shipped?");
}

main();
```

**Run it:**

```bash
GEMINI_API_KEY=your-key npx ts-node src/exercise-3-semantic-search.ts
```

**Expected output:**

```
🔍 Query: "Can I get my money back for a digital download?"
📋 Top 3 results:
  1. [score: 0.8934] Refund Policy            ← found it! (no word "money" in source)
  2. [score: 0.5123] Order Cancellation
  3. [score: 0.3456] Discount Rules

🔍 Query: "What happens when products run out of stock?"
📋 Top 3 results:
  1. [score: 0.8721] Inventory Management      ← semantic match
  2. [score: 0.4532] Shipping Rules
  3. [score: 0.3211] Order Cancellation
```

---

## Key Takeaways

| Concept            | What you learned                                           | Production use case                             |
| ------------------ | ---------------------------------------------------------- | ----------------------------------------------- |
| Embeddings         | Text → float vectors representing meaning                  | Semantic search, recommendations, deduplication |
| Chunking           | Split large docs into focused pieces with overlap          | Document processing, RAG ingestion pipeline     |
| Vector DB (Qdrant) | Store and search by semantic similarity                    | Knowledge bases, documentation search, chatbots |
| Cosine similarity  | Measure how "related" two texts are (0–1)                  | Relevance scoring, threshold filtering          |
| Same-model rule    | Always embed queries with the same model used for indexing | Avoid subtle bugs where search returns garbage  |

## Resources

### Official Documentation

- **Theoretical Guide:** [Pinecone Academy: What are Vector Embeddings?](https://www.pinecone.io/learn/vector-embeddings/)
- **Local Setup:** [Qdrant Quick Start with Node.js](https://qdrant.tech/documentation/quick-start/)
- **ChromaDB:** [ChromaDB Getting Started](https://docs.trychroma.com/getting-started)
- **Vercel AI SDK Embeddings:** [Embeddings API](https://ai-sdk.dev/docs/ai-sdk-core/embeddings) — Unified embedding API across providers

### Free Courses (DeepLearning.AI)

- **[Understanding and Applying Text Embeddings](https://www.deeplearning.ai/short-courses/google-cloud-vertex-ai/)** — by Nikita Namjoshi (Google Cloud) & Andrew Ng. Properties of embeddings, semantic similarity, classification, clustering, Q&A system. _Free, ~1.5h_
- **[Vector Databases: from Embeddings to Applications](https://www.deeplearning.ai/short-courses/vector-databases-embeddings-applications/)** — by Sebastian Witalec (Weaviate). Semantic search, sparse/dense/hybrid search, approximate nearest neighbors, multilingual search. _Free, ~55min_
- **[Building Applications with Vector Databases](https://www.deeplearning.ai/short-courses/building-applications-vector-databases/)** — by Tim Tully (Pinecone). 6 practical applications: semantic search, RAG, recommender systems, hybrid search, facial similarity, anomaly detection. _Free, ~1h_

### YouTube (Free)

- **[What are Vector Embeddings?](https://www.youtube.com/results?search_query=vector+embeddings+explained+tutorial)** — Quick visual explainer
- **[Qdrant Vector Database Tutorial Node.js](https://www.youtube.com/results?search_query=qdrant+vector+database+nodejs+tutorial)** — Hands-on setup with Node.js
- **[ChromaDB Tutorial for Beginners](https://www.youtube.com/results?search_query=chromadb+tutorial+embeddings+beginners)** — Getting started with local vector DB
