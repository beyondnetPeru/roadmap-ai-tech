# Phase 3: RAG Architecture (Retrieval-Augmented Generation)

> **Goal:** Build the standard architecture for grounding AI responses in your own data. RAG prevents hallucinations by retrieving relevant context from your knowledge base and injecting it into the LLM prompt — so the model answers based on _your_ documents, not its training data.

---

## Theoretical Concepts

### 3.1 What Is RAG?

**Definition:** Retrieval-Augmented Generation (RAG) is an architecture pattern where you _retrieve_ relevant documents from a knowledge base and _augment_ the LLM's prompt with that context before _generating_ a response. The LLM only answers based on the provided context, dramatically reducing hallucinations.

**The RAG flow:**

```
User question
  → Embed the question (same model as indexing)
  → Search vector DB for top-K relevant chunks
  → Inject chunks into a system prompt: "Answer ONLY based on the following context: ..."
  → LLM generates answer grounded in retrieved context
  → Return response (+ source references)
```

**Why RAG instead of fine-tuning?**

| Approach         | Cost                  | Data freshness                  | Best for                              |
| ---------------- | --------------------- | ------------------------------- | ------------------------------------- |
| **RAG**          | Low (no training)     | Real-time (update docs anytime) | Enterprise knowledge, docs, Q&A       |
| **Fine-tuning**  | High ($$$, GPU hours) | Stale (retrain to update)       | Style/tone changes, specialized tasks |
| **Long context** | Medium (token costs)  | Real-time                       | Small docs that fit in context window |

**Reference:** [LangChain — RAG Tutorial](https://js.langchain.com/docs/tutorials/rag/) — Complete TypeScript RAG walkthrough with LangChain.js.

### 3.2 Ingestion Pipeline

**Definition:** The process of preparing your knowledge base for retrieval. This runs offline (or on a schedule) and populates the vector database.

**Pipeline stages:**

```
Source documents (Markdown, PDF, HTML, code)
  → Load: Read files from disk/URL/API
  → Split: Chunk documents (recursive text splitting, 500-1000 tokens, 10-20% overlap)
  → Embed: Convert chunks to vectors (Gemini text-embedding-004, OpenAI text-embedding-3-small)
  → Store: Upsert vectors + metadata into vector DB (Qdrant, Pinecone, pgvector)
```

**Metadata matters:** Store the source filename, section title, page number, and URL alongside each vector. This enables _source attribution_ — showing users exactly where the answer came from.

**Reference:** [Vercel AI SDK — RAG Guide](https://ai-sdk.dev/docs/guides/rag-chatbot) — Modern RAG implementation with AI SDK.

### 3.3 Retrieval Strategies

**Definition:** How you search the vector database and rank results before injecting them into the prompt. The quality of retrieval directly determines the quality of the final answer.

| Strategy                 | Description                                                         | When to use                                                |
| ------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Naive RAG**            | Embed query → top-K vector search → inject all results              | Simple use cases, small knowledge bases                    |
| **Hybrid search**        | Combine semantic search (vectors) + keyword search (BM25/full-text) | When exact terms matter (product names, SKUs, error codes) |
| **Re-ranking**           | Retrieve top-20 → re-rank with a cross-encoder model → take top-5   | Production systems where precision matters                 |
| **Query transformation** | Rewrite the user query for better retrieval (HyDE, multi-query)     | Ambiguous or short queries                                 |
| **Contextual retrieval** | Add document context to each chunk before embedding                 | Improved chunk relevance for large docs                    |

**The re-ranking pattern (recommended for production):**

```
User query → Retrieve top-20 from vector DB (fast, recall-oriented)
  → Re-rank with cross-encoder model (slow, precision-oriented)
  → Take top-5 highest scoring → Inject into prompt
```

**Reference:** [Pinecone — RAG Guide](https://www.pinecone.io/learn/retrieval-augmented-generation/) — Deep dive into retrieval strategies, re-ranking, and hybrid search.

### 3.4 Prompt Augmentation

**Definition:** The technique of structuring the system prompt so the LLM is forced to answer _only_ from the retrieved context and can say "I don't know" when the context doesn't contain the answer.

**Effective RAG prompt template:**

```
You are a helpful assistant that answers questions about our e-commerce platform.

RULES:
- Answer ONLY based on the provided context
- If the context doesn't contain the answer, say "I don't have information about that"
- Always cite which section the information came from
- Be concise and specific

CONTEXT:
---
{retrieved_chunk_1}
---
{retrieved_chunk_2}
---
{retrieved_chunk_3}

USER QUESTION: {user_question}
```

**Reference:** [Anthropic — RAG Best Practices](https://docs.anthropic.com/en/docs/build-with-claude/retrieval-augmented-generation) — Prompt engineering specifically for RAG systems.

---

## Hands-on Lab

### Prerequisites

> **Requires:** Phase 2 completed (Qdrant running with business-rules collection).

```bash
mkdir phase-3-rag && cd phase-3-rag
npm init -y
npm install typescript ts-node @types/node
npm install @google/generative-ai       # Gemini for embeddings + generation
npm install @qdrant/js-client-rest       # Vector DB client
npm install ai @ai-sdk/google zod       # Vercel AI SDK (Exercise 3)
npx tsc --init --strict --target ES2022 --module commonjs --rootDir src --outDir dist
mkdir src
```

### Exercise 1: Basic RAG Pipeline (From Scratch)

**Goal:** Build a complete RAG pipeline without any framework — understand every step.

Create `src/exercise-1-basic-rag.ts`:

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { readFileSync } from "fs";
import { randomUUID } from "crypto";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});
const chatModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: { temperature: 0.2 }, // Low temp for factual answers
});
const qdrant = new QdrantClient({ url: "http://localhost:6333" });

const COLLECTION = "rag-knowledge-base";
const VECTOR_SIZE = 768;

// ──────────────────────── INGESTION PIPELINE ────────────────────────

// Step 1: Load and chunk the document
function chunkDocument(
  markdown: string,
  chunkSize = 500,
  overlap = 100,
): string[] {
  const text = markdown.replace(/^#+ .+$/gm, "").trim(); // Remove headings
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    const chunk = text.slice(i, i + chunkSize).trim();
    if (chunk.length > 50) chunks.push(chunk); // Skip tiny fragments
  }
  return chunks;
}

// Step 2: Embed text
async function embed(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

// Step 3: Ingest documents into vector DB
async function ingest(filePath: string) {
  console.log("📥 INGESTION PIPELINE");
  const markdown = readFileSync(filePath, "utf-8");
  const chunks = chunkDocument(markdown);
  console.log(`  📄 Loaded: ${filePath} → ${chunks.length} chunks`);

  // Create collection
  try {
    await qdrant.deleteCollection(COLLECTION);
  } catch {}
  await qdrant.createCollection(COLLECTION, {
    vectors: { size: VECTOR_SIZE, distance: "Cosine" },
  });

  // Embed and store
  const points = await Promise.all(
    chunks.map(async (content, i) => ({
      id: randomUUID(),
      vector: await embed(content),
      payload: { content, source: filePath, chunkIndex: i },
    })),
  );
  await qdrant.upsert(COLLECTION, { points });
  console.log(`  ✅ Stored ${points.length} vectors in Qdrant\n`);
}

// ──────────────────────── RETRIEVAL + GENERATION ────────────────────────

async function askRAG(question: string): Promise<string> {
  console.log(`❓ Question: "${question}"`);

  // Step 4: Retrieve relevant chunks
  const queryVector = await embed(question);
  const results = await qdrant.search(COLLECTION, {
    vector: queryVector,
    limit: 3,
    with_payload: true,
    score_threshold: 0.3, // Only return relevant results
  });

  if (results.length === 0) {
    return "❌ No relevant context found in the knowledge base.";
  }

  // Step 5: Build augmented prompt
  const context = results
    .map((hit, i) => {
      const payload = hit.payload as { content: string; source: string };
      return `[Source ${i + 1} — score: ${hit.score.toFixed(3)}]\n${payload.content}`;
    })
    .join("\n\n---\n\n");

  const augmentedPrompt = `You are a helpful assistant that answers questions about our e-commerce platform.

RULES:
- Answer ONLY based on the provided context below
- If the context doesn't contain enough information, say "I don't have information about that"
- Cite which source(s) you used (e.g., "According to Source 1...")
- Be concise and specific

CONTEXT:
${context}

USER QUESTION: ${question}`;

  // Step 6: Generate grounded response
  const response = await chatModel.generateContent(augmentedPrompt);
  const answer = response.response.text();

  console.log(`\n📚 Retrieved ${results.length} chunks:`);
  results.forEach((hit, i) => {
    const payload = hit.payload as { content: string };
    console.log(
      `   ${i + 1}. [${hit.score.toFixed(3)}] ${payload.content.substring(0, 80)}...`,
    );
  });
  console.log(`\n🤖 Answer: ${answer}\n`);
  return answer;
}

// ──────────────────────── RUN ────────────────────────

async function main() {
  // First, ingest the business rules (reuse from Phase 2 or provide path)
  await ingest("src/sample-business-rules.md");

  // Now ask questions — the answers come from YOUR data, not model training
  await askRAG("Can I cancel my order after it has been shipped?");
  await askRAG("What is the refund policy for digital products?");
  await askRAG("How does the automatic reorder system work?");
  await askRAG("What is the capital of France?"); // Should say "I don't have info"
}

main();
```

Copy the business rules file from Phase 2 or create it:

```bash
cp ../phase-2-embeddings/src/sample-business-rules.md src/
```

**Run it:**

```bash
GEMINI_API_KEY=your-key npx ts-node src/exercise-1-basic-rag.ts
```

**Expected output:**

```
📥 INGESTION PIPELINE
  📄 Loaded: src/sample-business-rules.md → 6 chunks
  ✅ Stored 6 vectors in Qdrant

❓ Question: "Can I cancel my order after it has been shipped?"
📚 Retrieved 3 chunks:
   1. [0.892] Orders that have been shipped cannot be cancelled...
   2. [0.654] A customer can cancel an order within 24 hours...
   3. [0.432] Refunds are processed within 5-7 business days...

🤖 Answer: According to Source 1, orders that have been shipped cannot be cancelled.
   You would need to initiate a return instead. (Source 2 adds that cancellation
   within 24 hours of placement is straightforward.)

❓ Question: "What is the capital of France?"
🤖 Answer: I don't have information about that in the provided context.
```

### Exercise 2: RAG with Chat History (Conversational RAG)

**Goal:** Build a RAG system that maintains conversation context across multiple turns.

Create `src/exercise-2-conversational-rag.ts`:

```typescript
import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import { QdrantClient } from "@qdrant/js-client-rest";
import * as readline from "readline";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});
const chatModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: { temperature: 0.2 },
  systemInstruction: `You are a helpful e-commerce support assistant.
Answer ONLY based on the provided CONTEXT. If the context doesn't contain the answer, say so.
Cite your sources. Remember the conversation history for follow-up questions.`,
});
const qdrant = new QdrantClient({ url: "http://localhost:6333" });

async function retrieve(query: string, topK = 3): Promise<string> {
  const result = await embeddingModel.embedContent(query);
  const hits = await qdrant.search("rag-knowledge-base", {
    vector: result.embedding.values,
    limit: topK,
    with_payload: true,
    score_threshold: 0.3,
  });
  return hits
    .map((h) => (h.payload as { content: string }).content)
    .join("\n---\n");
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const history: Content[] = [];

  console.log('💬 E-Commerce RAG Chatbot (type "exit" to quit)\n');

  const ask = () => {
    rl.question("You: ", async (question) => {
      if (question.toLowerCase() === "exit") {
        rl.close();
        return;
      }

      // Retrieve context for each turn
      const context = await retrieve(question);

      // Add user message with context injection
      history.push({
        role: "user",
        parts: [{ text: `CONTEXT:\n${context}\n\nQUESTION: ${question}` }],
      });

      const chat = chatModel.startChat({ history: history.slice(0, -1) });
      const response = await chat.sendMessage(
        history[history.length - 1].parts,
      );
      const answer = response.response.text();

      history.push({ role: "model", parts: [{ text: answer }] });

      console.log(`Bot: ${answer}\n`);
      ask();
    });
  };
  ask();
}

main();
```

**Run it:**

```bash
GEMINI_API_KEY=your-key npx ts-node src/exercise-2-conversational-rag.ts
```

**Example conversation:**

```
You: What's the refund policy?
Bot: Refunds are processed within 5-7 business days after the returned item
     is received and inspected. Digital products are non-refundable after download.

You: What about partial returns?
Bot: Based on the context, partial refunds are available for orders where only
     some items are returned.

You: exit
```

### Exercise 3: RAG with Vercel AI SDK + Streaming

**Goal:** Production-ready RAG with streaming responses using the Vercel AI SDK.

Create `src/exercise-3-ai-sdk-rag.ts`:

```typescript
import { streamText, embed } from "ai";
import { google } from "@ai-sdk/google";
import { QdrantClient } from "@qdrant/js-client-rest";

const qdrant = new QdrantClient({ url: "http://localhost:6333" });

async function ragWithStreaming(question: string) {
  console.log(`\n❓ ${question}\n🤖 `);

  // 1. Embed the query
  const { embedding } = await embed({
    model: google.textEmbeddingModel("text-embedding-004"),
    value: question,
  });

  // 2. Retrieve from Qdrant
  const hits = await qdrant.search("rag-knowledge-base", {
    vector: embedding,
    limit: 3,
    with_payload: true,
    score_threshold: 0.3,
  });

  const context = hits
    .map((h) => (h.payload as { content: string }).content)
    .join("\n---\n");

  // 3. Stream the response
  const { textStream } = streamText({
    model: google("gemini-2.0-flash"),
    system: `Answer based ONLY on the provided context. Say "I don't know" if the context is insufficient.

CONTEXT:
${context}`,
    prompt: question,
    temperature: 0.2,
  });

  // 4. Print streaming tokens as they arrive
  for await (const chunk of textStream) {
    process.stdout.write(chunk);
  }
  console.log("\n");
}

async function main() {
  await ragWithStreaming("How do discount codes work?");
  await ragWithStreaming("Can I use two promo codes on one order?");
}

main();
```

**Run it:**

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your-key npx ts-node src/exercise-3-ai-sdk-rag.ts
```

---

## Key Takeaways

| Concept             | What you learned                               | Production use case                                |
| ------------------- | ---------------------------------------------- | -------------------------------------------------- |
| RAG architecture    | Retrieve → Augment → Generate grounded answers | Customer support, internal knowledge, docs chatbot |
| Ingestion pipeline  | Load → Chunk → Embed → Store                   | Process company knowledge bases, wikis, docs       |
| Prompt augmentation | Force LLM to answer only from context          | Eliminate hallucinations in production             |
| Conversational RAG  | Maintain chat history + per-turn retrieval     | Multi-turn support chatbots                        |
| Streaming           | Send tokens as they're generated               | Better UX for web/chat applications                |
| Score threshold     | Filter out low-relevance results               | Prevent garbage context from polluting answers     |

## Resources

### Official Documentation

- **Tutorial:** [LangChain JS/TS: Build a RAG App](https://js.langchain.com/docs/tutorials/rag/)
- **Vercel AI SDK:** [Re-ranking & Retrieval](https://ai-sdk.dev/docs/ai-sdk-core/reranking) — Re-ranking patterns for RAG pipelines

### Free Courses (DeepLearning.AI)

- **[LangChain: Chat with Your Data](https://www.deeplearning.ai/short-courses/langchain-chat-with-your-data/)** — by Harrison Chase (LangChain). Complete RAG pipeline: document loading (80+ loaders), splitting, vector stores, retrieval, Q&A, chatbot. _Free, ~1h_
- **[Building Applications with Vector Databases](https://www.deeplearning.ai/short-courses/building-applications-vector-databases/)** — RAG implementation with Pinecone, semantic search, hybrid search. _Free, ~1h_
- **[LangChain for LLM Application Development](https://www.deeplearning.ai/short-courses/langchain-for-llm-application-development/)** — Chains, Q&A over documents, evaluation. _Free, ~1.5h_

### YouTube (Free)

- **[RAG from Scratch — LangChain](https://www.youtube.com/results?search_query=RAG+from+scratch+langchain+tutorial)** — Step-by-step RAG implementation
- **[Building a RAG App with TypeScript](https://www.youtube.com/results?search_query=RAG+typescript+langchain+tutorial)** — TypeScript-focused RAG tutorials
- **[Advanced RAG Techniques](https://www.youtube.com/results?search_query=advanced+RAG+re-ranking+hybrid+search)** — Re-ranking, hybrid search, query transformation
