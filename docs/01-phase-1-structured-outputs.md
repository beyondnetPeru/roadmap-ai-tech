# Phase 1: Deterministic Control (Structured Outputs & Function Calling)

The first step is mastering how AI interacts with your existing codebase. An LLM in a production environment should not generate free-form text; it must return exact data structures or invoke functions from your backend.

## Theoretical Concepts

* **Prompt Engineering for Code:** System Prompts, Few-Shot Prompting, and temperature control.
* **Structured Outputs:** Forcing Gemini Pro to return strict JSON schemas that perfectly match your TypeScript interfaces.
* **Function Calling (Tools/Skills):** The mechanism by which you define a function signature (e.g., `checkInventory(id)`) and provide it to the LLM. The model reasons and decides to "call" that function, pausing its execution until your Node.js backend returns the result.

## Hands-on (Practice)

1. Initialize a pure TypeScript or NestJS project.
2. Install the `@google/generative-ai` SDK and a schema validation library like `zod`.
3. Create a "Skill" (Tool) that simulates querying a legacy inventory or service status.
4. Pass this tool to Gemini Pro and force it to orchestrate the call, returning a validated Data Transfer Object (DTO) instead of plain text.

## Resources

### Official Documentation
* **Gemini Documentation:** [Function Calling](https://ai.google.dev/docs/function_calling)
* **OpenAI Documentation:** [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
* **Zod Documentation:** [Zod — TypeScript-first schema validation](https://zod.dev/)

### Free Courses (DeepLearning.AI)
* **[ChatGPT Prompt Engineering for Developers](https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/)** — by Isa Fulford (OpenAI) & Andrew Ng. Best practices for System Prompts, Few-Shot Prompting, iterative prompt design. *Free, ~1.5h*
* **[Function Calling and Data Extraction with LLMs](https://www.deeplearning.ai/short-courses/function-calling-and-data-extraction-with-llms/)** — Parallel/nested function calls, structured data extraction, SQL generation via LLM. *Free, ~1h*
* **[LangChain for LLM Application Development](https://www.deeplearning.ai/short-courses/langchain-for-llm-application-development/)** — by Harrison Chase (LangChain) & Andrew Ng. Models, prompts, parsers, chains, agents, memory. *Free, ~1.5h*

### YouTube (Free)
* **[Gemini API Function Calling Tutorial](https://www.youtube.com/results?search_query=gemini+api+function+calling+typescript+tutorial)** — Search for up-to-date tutorials on Gemini function calling with TypeScript
* **[Vercel AI SDK Structured Outputs](https://www.youtube.com/results?search_query=vercel+ai+sdk+structured+outputs+zod)** — Practical examples using `ai` package with Zod schemas
