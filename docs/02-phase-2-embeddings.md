# Phase 2: Semantic Memory (Embeddings & Vector Databases)

For the AI to process the documentation of your own projects, business rules, or C4 diagrams, you need to translate that text into a mathematical format.

## Theoretical Concepts

* **Embeddings:** Multidimensional vectors representing the "meaning" of a text. If two code snippets or technical manuals are conceptually similar, their vectors will be close in space.
* **Vector Databases:** Databases optimized for semantic similarity search (e.g., Cosine Similarity) rather than exact keyword matches.

## Hands-on (Practice)

1. Take an extensive Markdown file (e.g., e-commerce business rules).
2. Use Node.js to split the text into manageable chunks (Chunking).
3. Use Gemini's embedding API to vectorize the chunks.
4. Save the vectors in a local vector database such as **ChromaDB** or **Qdrant**.

## Resources

### Official Documentation
* **Theoretical Guide:** [Pinecone Academy: What are Vector Embeddings?](https://www.pinecone.io/learn/vector-embeddings/)
* **Local Setup:** [Qdrant Quick Start with Node.js](https://qdrant.tech/documentation/quick-start/)
* **ChromaDB:** [ChromaDB Getting Started](https://docs.trychroma.com/getting-started)
* **Vercel AI SDK Embeddings:** [Embeddings API](https://ai-sdk.dev/docs/ai-sdk-core/embeddings) — Unified embedding API across providers

### Free Courses (DeepLearning.AI)
* **[Understanding and Applying Text Embeddings](https://www.deeplearning.ai/short-courses/google-cloud-vertex-ai/)** — by Nikita Namjoshi (Google Cloud) & Andrew Ng. Properties of embeddings, semantic similarity, classification, clustering, Q&A system. *Free, ~1.5h*
* **[Vector Databases: from Embeddings to Applications](https://www.deeplearning.ai/short-courses/vector-databases-embeddings-applications/)** — by Sebastian Witalec (Weaviate). Semantic search, sparse/dense/hybrid search, approximate nearest neighbors, multilingual search. *Free, ~55min*
* **[Building Applications with Vector Databases](https://www.deeplearning.ai/short-courses/building-applications-vector-databases/)** — by Tim Tully (Pinecone). 6 practical applications: semantic search, RAG, recommender systems, hybrid search, facial similarity, anomaly detection. *Free, ~1h*

### YouTube (Free)
* **[What are Vector Embeddings?](https://www.youtube.com/results?search_query=vector+embeddings+explained+tutorial)** — Quick visual explainer
* **[Qdrant Vector Database Tutorial Node.js](https://www.youtube.com/results?search_query=qdrant+vector+database+nodejs+tutorial)** — Hands-on setup with Node.js
* **[ChromaDB Tutorial for Beginners](https://www.youtube.com/results?search_query=chromadb+tutorial+embeddings+beginners)** — Getting started with local vector DB
