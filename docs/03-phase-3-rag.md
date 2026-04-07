# Phase 3: RAG Architecture (Retrieval-Augmented Generation)

This is the standard architecture for providing enterprise context to AI, preventing hallucinations, and ensuring responses are based strictly on your own data (knowledge bases, repositories).

## Theoretical Concepts

* **Ingestion and Retrieval Pipeline:** How to dynamically search your vector database for relevant information triggered by an event or user query, and "augment" the prompt with that data.
* **Advanced RAG:** Re-ranking techniques and hybrid searches (semantic + keyword).

## Hands-on (Practice)

1. Using **LangChain.js**, create an endpoint on your Node.js server.
2. Configure the flow: the code must vectorize the user's input, retrieve the top 3 most relevant chunks from your vector database (Phase 2), inject them into the Gemini Pro prompt, and return a precise, hallucination-free response.

## Resources

### Official Documentation
* **Tutorial:** [LangChain JS/TS: Build a RAG App](https://js.langchain.com/docs/tutorials/rag/)
* **Vercel AI SDK:** [Re-ranking & Retrieval](https://ai-sdk.dev/docs/ai-sdk-core/reranking) — Re-ranking patterns for RAG pipelines

### Free Courses (DeepLearning.AI)
* **[LangChain: Chat with Your Data](https://www.deeplearning.ai/short-courses/langchain-chat-with-your-data/)** — by Harrison Chase (LangChain). Complete RAG pipeline: document loading (80+ loaders), splitting, vector stores, retrieval, Q&A, chatbot. *Free, ~1h*
* **[Building Applications with Vector Databases](https://www.deeplearning.ai/short-courses/building-applications-vector-databases/)** — RAG implementation with Pinecone, semantic search, hybrid search. *Free, ~1h*
* **[LangChain for LLM Application Development](https://www.deeplearning.ai/short-courses/langchain-for-llm-application-development/)** — Chains, Q&A over documents, evaluation. *Free, ~1.5h*

### YouTube (Free)
* **[RAG from Scratch — LangChain](https://www.youtube.com/results?search_query=RAG+from+scratch+langchain+tutorial)** — Step-by-step RAG implementation
* **[Building a RAG App with TypeScript](https://www.youtube.com/results?search_query=RAG+typescript+langchain+tutorial)** — TypeScript-focused RAG tutorials
* **[Advanced RAG Techniques](https://www.youtube.com/results?search_query=advanced+RAG+re-ranking+hybrid+search)** — Re-ranking, hybrid search, query transformation
