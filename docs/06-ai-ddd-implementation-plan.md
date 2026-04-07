# 🧠 Phase 2 — AI-Powered Evolution of @nestjslatam DDD Libraries

> **Prerequisite:** Complete all 5 phases of the [AI Immersion Roadmap](../README.md) before starting this phase.

**Overview:**
Apply all learned AI concepts (Structured Outputs, Embeddings, RAG, Agentic Systems, MCP) to evolve `@nestjslatam/ddd-lib` and `@nestjslatam/ddd-valueobjects` into AI-native DDD libraries with MCP servers, intelligent agents, and developer tooling.

---

## Context

| Library | Package | Description |
|---------|---------|-------------|
| **ddd-lib** | `@nestjslatam/ddd-lib` (v2.0.0) | Core DDD building blocks: AggregateRoot, ValueObject, Business Rules, AbstractRuleValidator, State Tracking, Domain Events |
| **ddd-valueobjects** | `@nestjslatam/ddd-valueobjects` (v1.0.0) | 13+ pre-built Value Objects: Name, Email, Money, Age, DateRange, Password, URL, PhoneNumber, DocumentId, Uuid, Percentage, BirthDate, Description |

**Repositories:**
- https://github.com/nestjslatam/ddd
- https://github.com/nestjslatam/ddd-valueobjects

---

## Sub-Phase 2A: MCP Server for DDD Libraries

**Goal:** Build MCP servers that expose DDD library documentation, patterns, and code generation capabilities to AI coding assistants (Cursor, VS Code, Claude, Windsurf).

### Steps

1. **Create `@nestjslatam/ddd-mcp-server` package**
   - Expose library documentation as MCP Resources
   - Implement `resolve-ddd-pattern` tool — given a domain description, suggest which DDD building blocks to use
   - Implement `generate-aggregate` tool — scaffold an AggregateRoot from a schema description
   - Implement `generate-valueobject` tool — scaffold a ValueObject with validators from type description
   - Implement `validate-ddd-structure` tool — analyze existing code for DDD compliance

2. **Register library docs in Context7** for up-to-date documentation retrieval by LLMs

3. **Publish MCP server** to npm as `@nestjslatam/ddd-mcp`

### Key Tools & Frameworks

| Tool | Package | Purpose |
|------|---------|---------|
| MCP SDK | `@modelcontextprotocol/sdk` | Official TypeScript SDK for building MCP servers |
| Context7 | `@upstash/context7-mcp` | Up-to-date library docs delivery to LLMs (51.9k ⭐) |
| Awesome MCP Servers | — | Curated registry for discoverability (35k+ ⭐) |

### Resources
- [MCP Official Documentation](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Context7 GitHub](https://github.com/upstash/context7)
- [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers)

---

## Sub-Phase 2B: DDD Code Generation Agent with VoltAgent

**Goal:** Build an intelligent agent that helps developers scaffold entire DDD bounded contexts using the VoltAgent framework.

### Steps

1. **Create `@nestjslatam/ddd-agent` package** using VoltAgent (`@voltagent/core`)

2. **Define agent tools:**
   | Tool | Description |
   |------|-------------|
   | `scaffoldBoundedContext` | Creates full folder structure (domain/application/infrastructure layers) |
   | `createAggregate` | Generates AggregateRoot with business rules, validators, domain events |
   | `createValueObject` | Generates typed ValueObject with custom validation |
   | `createRepository` | Generates read/write repository interfaces and implementations |
   | `createCQRS` | Generates Command/Query/Handler triplets |

3. **Implement supervisor agent pattern (Multi-Agent):**
   - **Architect Agent** — analyzes domain description, suggests bounded contexts
   - **Code Generator Agent** — generates TypeScript code following library patterns
   - **Validator Agent** — checks generated code against DDD rules and business constraints

4. **Add VoltOps Console integration** for observability and debugging

5. **Connect to MCP server** (Sub-Phase 2A) for documentation context

### Key Tools & Frameworks

| Tool | Package | Purpose |
|------|---------|---------|
| VoltAgent | `@voltagent/core` | TypeScript AI Agent Platform: Memory, RAG, Guardrails, Tools, MCP, Workflows, Multi-Agent (7.5k ⭐) |
| AI Providers | `@ai-sdk/openai` / `@ai-sdk/anthropic` | LLM providers for agent reasoning |
| VoltOps | Console | Agent observability, deployment, evals |

### Resources
- [VoltAgent Documentation](https://voltagent.dev)
- [VoltAgent GitHub](https://github.com/VoltAgent/voltagent)

---

## Sub-Phase 2C: RAG-Powered DDD Knowledge Base

**Goal:** Build a semantic search system over DDD patterns, business rules, and architectural decisions specific to the libraries.

### Steps

1. **Create documentation corpus:**
   - Library API docs, architecture guides, examples
   - Best practices for DDD in NestJS
   - Common domain modeling patterns (from `libs/ddd/docs/`)

2. **Implement RAG pipeline** using VoltAgent Knowledge Base or standalone:
   - Chunk and embed DDD documentation
   - Store in vector database (Qdrant, Pinecone, or Supabase pgvector)
   - Expose as retriever tool for agents

3. **Create `ddd-rag-tool`** that agents invoke to get contextual DDD guidance before generating code

### Key Tools & Frameworks

| Tool | Purpose |
|------|---------|
| VoltAgent RAG (`@voltagent/core` retriever agents) | Knowledge retrieval for agents |
| Qdrant / Pinecone | Vector storage and semantic search |
| Gemini / OpenAI embedding models | Text-to-vector conversion |

### Resources
- [Qdrant Quick Start](https://qdrant.tech/documentation/quick-start/)
- [Pinecone Docs](https://docs.pinecone.io/)

---

## Sub-Phase 2D: Integration with AI Development Ecosystem

**Goal:** Make the DDD libraries first-class citizens in AI-assisted development workflows.

### Steps

1. **VS Code / Cursor / Windsurf Integration:**
   - Create `.instructions.md` / `SKILL.md` files for DDD library usage patterns
   - Add Context7 skill for automatic doc injection (`npx ctx7 setup`)
   - Create `copilot-instructions.md` for DDD coding conventions

2. **Mastra Integration** (alternative/complement to VoltAgent):
   - Create Mastra agents for DDD workflows (`npm create mastra@latest`)
   - Leverage Mastra's workflow engine for multi-step DDD scaffolding
   - Use Mastra's MCP server capabilities to expose agents via MCP

3. **CopilotKit Integration:**
   - Build React-based DDD modeling UI with Generative UI
   - Shared state between UI domain model editor and agent
   - Human-in-the-loop for business rule validation

4. **Vercel AI SDK Integration:**
   - Use `ai` package for structured output (domain model → TypeScript interfaces)
   - Implement agent tools with Zod validation matching DDD patterns

### Key Tools & Frameworks

| Tool | Package | Purpose | Stars |
|------|---------|---------|-------|
| Mastra | `@mastra/core` | AI Framework: Agents, Workflows, MCP, RAG, Evals | 22.8k ⭐ |
| CopilotKit | `@copilotkit/react-core` | Agent-native frontend, Generative UI, AG-UI Protocol | 30k ⭐ |
| Vercel AI SDK | `ai` | Provider-agnostic AI toolkit, structured outputs | 23.3k ⭐ |
| Context7 | `@upstash/context7-mcp` | Docs for LLMs | 51.9k ⭐ |

### Resources
- [Mastra Documentation](https://mastra.ai/docs)
- [CopilotKit Documentation](https://docs.copilotkit.ai)
- [Vercel AI SDK Documentation](https://ai-sdk.dev/docs) — *Note: SDK moved to ai-sdk.dev (v6)*

---

## Sub-Phase 2E: AI-Powered DDD Validation & Guardrails

**Goal:** Use AI to enforce DDD patterns, detect anti-patterns, and validate domain models.

### Steps

1. **Create `@nestjslatam/ddd-guardrails` agent tool:**
   - Analyze code for DDD violations (anemic domain models, leaking domain logic)
   - Validate aggregate boundaries and consistency rules
   - Check value object immutability compliance
   - Detect missing business rule validators

2. **Integrate with CI/CD pipeline** via MCP

3. **Create eval suite** for measuring agent quality on DDD tasks

### Resources
- [VoltAgent Guardrails](https://voltagent.dev/docs/agents/guardrails/)
- **Free Course:** [Safe and Reliable AI via Guardrails (DeepLearning.AI)](https://www.deeplearning.ai/short-courses/safe-and-reliable-ai-via-guardrails/) — Build guardrails from scratch, mitigate hallucinations, PII. *Free, ~1.5h*

---

## Best AI Tools Ecosystem Reference

### MCP & Documentation Tools

| Tool | Package | Purpose | Stars |
|------|---------|---------|-------|
| **Context7** | `@upstash/context7-mcp` | Up-to-date library docs for LLMs | 51.9k ⭐ |
| **MCP Official SDK** | `@modelcontextprotocol/sdk` | Build MCP servers in TypeScript | Official |
| **Awesome MCP Servers** | — | Curated MCP server directory | 35k+ ⭐ |

### Protocols & Standards

| Protocol | Purpose | Status |
|----------|---------|--------|
| **MCP** (Model Context Protocol) | Connects AI apps to external tools & data | Open standard by Anthropic |
| **A2A** (Agent2Agent Protocol) | Connects agents to each other across frameworks | Open standard by Google, donated to Linux Foundation |
| **AG-UI** (Agent-User Interaction) | Standardizes agent-to-frontend communication | Backed by CopilotKit |

### Agent Frameworks (TypeScript)

| Tool | Package | Purpose | Stars |
|------|---------|---------|-------|
| **VoltAgent** | `@voltagent/core` | AI Agent Platform: Memory, RAG, Tools, MCP, Workflows | 7.5k ⭐ |
| **Mastra** | `@mastra/core` | AI Framework: Agents, Workflows, MCP, Evals | 22.8k ⭐ |
| **Vercel AI SDK** | `ai` | Provider-agnostic AI toolkit, structured outputs | 23.3k ⭐ |
| **CopilotKit** | `@copilotkit/react-core` | Agent-native frontend, Generative UI, AG-UI Protocol | 30k ⭐ |
| **LangChain.js / LangGraph.js** | `langchain` / `@langchain/langgraph` | Chains, graphs, agentic workflows | 15k+ ⭐ |

### AI-Powered Development Tools

| Tool | Purpose |
|------|---------|
| **GitHub Copilot** | AI pair coding & agent mode |
| **Cursor** | AI-native IDE with MCP support |
| **Claude Code** | CLI coding agent with MCP support |
| **Antigravity** | AI-native IDE |
| **Windsurf** | AI-powered IDE by Codeium |

### Observability & Operations

| Tool | Purpose |
|------|---------|
| **VoltOps Console** | Agent observability, deployment, evals |
| **Langfuse** | LLM observability & prompt management |
| **Mastra Studio** | Agent testing & debugging |

---

## Key Library Files to Expose via AI Tooling

| Path | Purpose |
|------|---------|
| `libs/ddd/src/core/` | Core DDD building blocks to expose via MCP |
| `libs/ddd/src/valueobjects/` | Base value object classes |
| `libs/ddd/src/aggregate-root.ts` | AggregateRoot pattern to teach agents |
| `libs/ddd/src/core/validator-rules/` | Validation framework for guardrails |
| `libs/ddd-valueobjects/src/implementations/` | 13+ concrete VOs as agent templates |
| `docs/` | Existing docs to feed into RAG pipeline |

---

## Verification Criteria

1. ✅ MCP server connects from Cursor/VS Code/Claude and returns accurate DDD guidance
2. ✅ VoltAgent-based agent successfully scaffolds a complete bounded context from natural language
3. ✅ RAG retrieval returns relevant DDD patterns with >80% relevance
4. ✅ Generated code passes existing test suites (`npm run test`, `npm run test:e2e`)
5. ✅ Context7 integration returns current library docs when prompted

---

## Recommended Free Learning Path for This Phase

These free courses from DeepLearning.AI directly support the sub-phases above:

| # | Course | Applies to | Duration |
|---|--------|-----------|----------|
| 1 | [MCP: Build Rich-Context AI Apps with Anthropic](https://www.deeplearning.ai/short-courses/mcp-build-rich-context-ai-apps-with-anthropic/) | Sub-Phase 2A (MCP Server) | ~1.8h |
| 2 | [Build AI Apps with MCP Servers](https://www.deeplearning.ai/short-courses/build-ai-apps-with-mcp-server-working-with-box-files/) | Sub-Phase 2A (MCP + A2A) | ~36min |
| 3 | [Agentic AI by Andrew Ng](https://www.deeplearning.ai/courses/agentic-ai/) | Sub-Phase 2B (Agent patterns) | Self-paced |
| 4 | [AI Agents in LangGraph](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/) | Sub-Phase 2B (Agent framework) | ~1.5h |
| 5 | [Agent Memory: Building Memory-Aware Agents](https://www.deeplearning.ai/short-courses/agent-memory-building-memory-aware-agents/) | Sub-Phase 2B (Agent memory) | ~2h |
| 6 | [LangChain: Chat with Your Data](https://www.deeplearning.ai/short-courses/langchain-chat-with-your-data/) | Sub-Phase 2C (RAG pipeline) | ~1h |
| 7 | [Multi AI Agent Systems with crewAI](https://www.deeplearning.ai/short-courses/multi-ai-agent-systems-with-crewai/) | Sub-Phase 2D (Multi-agent) | ~2.5h |
| 8 | [A2A: The Agent2Agent Protocol](https://www.deeplearning.ai/short-courses/a2a-the-agent2agent-protocol/) | Sub-Phase 2D (Agent interop) | ~1.5h |
| 9 | [Safe and Reliable AI via Guardrails](https://www.deeplearning.ai/short-courses/safe-and-reliable-ai-via-guardrails/) | Sub-Phase 2E (Guardrails) | ~1.5h |

### Additional Official Documentation
* **Vercel AI SDK v6:** [ai-sdk.dev/docs](https://ai-sdk.dev/docs) — Agents, structured outputs, MCP tools, embeddings
* **Mastra Framework:** [mastra.ai/docs](https://mastra.ai/docs) — Agents, workflows, MCP server authoring
* **Context7:** [context7.com](https://context7.com) — Register libraries for AI doc delivery

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **VoltAgent** as primary agent framework | TypeScript-native, MCP-first, production observability via VoltOps |
| **Mastra** as alternative/complement | Workflow-heavy scenarios, Gatsby team backing, MCP server capabilities |
| **Context7** for documentation delivery | Most popular docs-for-LLMs tool (51.9k ⭐), MCP-native |
| **MCP** as universal integration layer | Open standard, supported by all major AI IDEs and tools |
| **Scope: library-level tooling only** | Focus on DDD library augmentation, not end-user application code |
