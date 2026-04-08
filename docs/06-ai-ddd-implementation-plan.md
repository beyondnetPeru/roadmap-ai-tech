# Phase 6: AI-Powered Evolution of @nestjslatam DDD Libraries

> **Prerequisite:** Complete all 5 phases of the [AI Immersion Roadmap](../README.md) before starting this phase.
>
> **Goal:** Apply everything learned (Structured Outputs, Embeddings, RAG, Agents, MCP) to evolve `@nestjslatam/ddd-lib` and `@nestjslatam/ddd-valueobjects` into AI-native DDD libraries with MCP servers, intelligent agents, and developer tooling.

---

## Context

| Library              | Package                                  | Description                                                                                                                                       |
| -------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ddd-lib**          | `@nestjslatam/ddd-lib` (v2.0.0)          | Core DDD building blocks: AggregateRoot, ValueObject, Business Rules, AbstractRuleValidator, State Tracking, Domain Events                        |
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

### Demo Code: DDD MCP Server Skeleton

```typescript
// src/ddd-mcp-server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "@nestjslatam/ddd-mcp",
  version: "1.0.0",
  description:
    "MCP server for DDD library guidance, code generation, and validation",
});

// ── Tool: Resolve DDD Pattern ──
// Given a domain description, recommends which DDD building blocks to use
server.tool(
  "resolve-ddd-pattern",
  "Analyze a domain concept and recommend DDD building blocks (Aggregate, Value Object, Domain Event, etc.)",
  {
    domainDescription: z
      .string()
      .describe(
        'Description of the domain concept, e.g., "a monetary amount with currency"',
      ),
    context: z
      .string()
      .optional()
      .describe("Additional context about the bounded context or module"),
  },
  async ({ domainDescription, context }) => {
    // In production, this calls an LLM with RAG context from the library docs
    const patterns = analyzeDomainConcept(domainDescription);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              concept: domainDescription,
              recommendedPattern: patterns.primary,
              buildingBlocks: patterns.blocks,
              codeExample: patterns.example,
              libraryImports: patterns.imports,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ── Tool: Generate Aggregate ──
// Scaffolds a complete AggregateRoot with business rules and domain events
server.tool(
  "generate-aggregate",
  "Generate a complete AggregateRoot class with business rules, validators, and domain events",
  {
    name: z.string().describe('Aggregate name in PascalCase, e.g., "Order"'),
    properties: z
      .array(
        z.object({
          name: z.string(),
          type: z.string(),
          required: z.boolean().optional(),
        }),
      )
      .describe("Properties of the aggregate"),
    businessRules: z
      .array(z.string())
      .optional()
      .describe("Business rules to enforce"),
  },
  async ({ name, properties, businessRules }) => {
    const code = generateAggregateCode(name, properties, businessRules ?? []);
    return {
      content: [
        {
          type: "text" as const,
          text: code,
        },
      ],
    };
  },
);

// ── Tool: Generate Value Object ──
server.tool(
  "generate-valueobject",
  "Generate a typed ValueObject class with custom validation. Uses @nestjslatam/ddd-lib ValueObject base.",
  {
    name: z.string().describe('Value Object name, e.g., "Email", "Money"'),
    primitiveType: z
      .enum(["string", "number", "boolean", "object"])
      .describe("Underlying primitive type"),
    validationRules: z
      .array(z.string())
      .optional()
      .describe('Validation rules, e.g., "must be valid email format"'),
  },
  async ({ name, primitiveType, validationRules }) => {
    const code = `import { ValueObject } from '@nestjslatam/ddd-lib';

interface ${name}Props {
  value: ${primitiveType};
}

export class ${name} extends ValueObject<${name}Props> {
  private constructor(props: ${name}Props) {
    super(props);
  }

  static create(value: ${primitiveType}): ${name} {
    ${(validationRules ?? []).map((rule) => `// Validate: ${rule}`).join("\n    ")}
    if (value === undefined || value === null) {
      throw new Error('${name} value is required');
    }
    return new ${name}({ value });
  }

  get value(): ${primitiveType} {
    return this.props.value;
  }
}`;
    return { content: [{ type: "text" as const, text: code }] };
  },
);

// ── Resource: DDD Patterns Reference ──
server.resource(
  "ddd-patterns",
  "ddd://patterns/reference",
  {
    description:
      "Complete reference of DDD patterns supported by @nestjslatam/ddd-lib",
  },
  async () => ({
    contents: [
      {
        uri: "ddd://patterns/reference",
        mimeType: "application/json",
        text: JSON.stringify(
          {
            patterns: [
              {
                name: "AggregateRoot",
                description: "Consistency boundary for a cluster of entities",
                baseClass: "AggregateRoot<TProps>",
              },
              {
                name: "ValueObject",
                description:
                  "Immutable object defined by its attributes, not identity",
                baseClass: "ValueObject<TProps>",
              },
              {
                name: "DomainEvent",
                description:
                  "Something that happened in the domain that domain experts care about",
                baseClass: "IDomainEvent",
              },
              {
                name: "BusinessRule",
                description: "Encapsulated business validation logic",
                interface: "IBusinessRule",
              },
              {
                name: "AbstractRuleValidator",
                description:
                  "Validates a set of business rules against an entity",
                baseClass: "AbstractRuleValidator",
              },
            ],
            library: "@nestjslatam/ddd-lib",
            version: "2.0.0",
          },
          null,
          2,
        ),
      },
    ],
  }),
);

// ── Prompt: DDD Code Review ──
server.prompt(
  "review-ddd-code",
  "Review TypeScript code for DDD pattern compliance and suggest improvements",
  { code: z.string().describe("The TypeScript code to review") },
  async ({ code }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Review this TypeScript code for DDD compliance using @nestjslatam/ddd-lib patterns:

\`\`\`typescript
${code}
\`\`\`

Check for:
1. Anemic domain models (logic in services instead of entities)
2. Missing Value Objects (primitive obsession)
3. Aggregate boundary violations
4. Missing business rule validators
5. Leaking domain logic to application/infrastructure layers

Suggest concrete improvements with code examples using @nestjslatam/ddd-lib.`,
        },
      },
    ],
  }),
);

// Helper functions (simplified — in production, use LLM + RAG)
function analyzeDomainConcept(description: string) {
  const lower = description.toLowerCase();
  if (
    lower.includes("money") ||
    lower.includes("email") ||
    lower.includes("name")
  ) {
    return {
      primary: "ValueObject",
      blocks: ["ValueObject", "BusinessRule"],
      example: "See generate-valueobject tool",
      imports: ["import { ValueObject } from '@nestjslatam/ddd-lib';"],
    };
  }
  return {
    primary: "AggregateRoot",
    blocks: [
      "AggregateRoot",
      "DomainEvent",
      "BusinessRule",
      "AbstractRuleValidator",
    ],
    example: "See generate-aggregate tool",
    imports: ["import { AggregateRoot } from '@nestjslatam/ddd-lib';"],
  };
}

function generateAggregateCode(
  name: string,
  props: Array<{ name: string; type: string }>,
  rules: string[],
) {
  return `import { AggregateRoot } from '@nestjslatam/ddd-lib';

interface ${name}Props {
${props.map((p) => `  ${p.name}: ${p.type};`).join("\n")}
}

export class ${name} extends AggregateRoot<${name}Props> {
  private constructor(props: ${name}Props) {
    super(props);
  }

  static create(props: ${name}Props): ${name} {
${rules.map((r) => `    // Business rule: ${r}`).join("\n")}
    const instance = new ${name}(props);
    // instance.addDomainEvent(new ${name}CreatedEvent(instance));
    return instance;
  }

${props.map((p) => `  get ${p.name}(): ${p.type} { return this.props.${p.name}; }`).join("\n")}
}`;
}

// Start server
const transport = new StdioServerTransport();
server.connect(transport);
```

**Test with MCP Inspector:**

```bash
npx @modelcontextprotocol/inspector npx ts-node src/ddd-mcp-server.ts
```

### Key Tools & Frameworks

| Tool                | Package                     | Purpose                                             |
| ------------------- | --------------------------- | --------------------------------------------------- |
| MCP SDK             | `@modelcontextprotocol/sdk` | Official TypeScript SDK for building MCP servers    |
| Context7            | `@upstash/context7-mcp`     | Up-to-date library docs delivery to LLMs (51.9k ⭐) |
| Awesome MCP Servers | —                           | Curated registry for discoverability (35k+ ⭐)      |

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

### Demo Code: DDD Agent with Vercel AI SDK

```typescript
// src/ddd-agent.ts
import { generateText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { writeFileSync, mkdirSync } from "fs";

// Tool: Scaffold an entire bounded context folder structure
const scaffoldBoundedContext = tool({
  description: "Create the complete folder structure for a DDD bounded context",
  parameters: z.object({
    contextName: z
      .string()
      .describe(
        'Name of the bounded context in kebab-case, e.g., "order-management"',
      ),
    aggregates: z
      .array(z.string())
      .describe("List of aggregate names in PascalCase"),
  }),
  execute: async ({ contextName, aggregates }) => {
    const basePath = `src/${contextName}`;
    const dirs = [
      `${basePath}/domain/aggregates`,
      `${basePath}/domain/value-objects`,
      `${basePath}/domain/events`,
      `${basePath}/domain/rules`,
      `${basePath}/application/commands`,
      `${basePath}/application/queries`,
      `${basePath}/application/handlers`,
      `${basePath}/infrastructure/repositories`,
      `${basePath}/infrastructure/persistence`,
      `${basePath}/presentation/controllers`,
      `${basePath}/presentation/dtos`,
    ];
    dirs.forEach((dir) => mkdirSync(dir, { recursive: true }));

    // Create index files for each aggregate
    aggregates.forEach((agg) => {
      writeFileSync(
        `${basePath}/domain/aggregates/${agg.toLowerCase()}.aggregate.ts`,
        `// TODO: Implement ${agg} AggregateRoot\nimport { AggregateRoot } from '@nestjslatam/ddd-lib';\n`,
      );
    });

    return {
      created: true,
      path: basePath,
      directories: dirs.length,
      aggregates,
    };
  },
});

// Tool: Generate a Value Object
const createValueObject = tool({
  description:
    "Generate a complete ValueObject with validation using @nestjslatam/ddd-lib",
  parameters: z.object({
    name: z.string().describe("Value Object name in PascalCase"),
    primitiveType: z.enum(["string", "number"]),
    validations: z
      .array(z.string())
      .describe("Validation rules in plain English"),
    outputPath: z.string().describe("File path relative to project root"),
  }),
  execute: async ({ name, primitiveType, validations, outputPath }) => {
    const validationCode = validations.map((v, i) => {
      // Simple heuristic — in production, use LLM to generate validation logic
      if (v.includes("email"))
        return `    if (!/^[\\w.-]+@[\\w.-]+\\.\\w+$/.test(String(value))) throw new Error('Invalid email format');`;
      if (v.includes("empty") || v.includes("required"))
        return `    if (!value || String(value).trim() === '') throw new Error('${name} cannot be empty');`;
      if (v.includes("positive"))
        return `    if (value <= 0) throw new Error('${name} must be positive');`;
      if (v.includes("max") || v.includes("length"))
        return `    if (String(value).length > 255) throw new Error('${name} exceeds max length');`;
      return `    // TODO: Implement validation: ${v}`;
    });

    const code = `import { ValueObject } from '@nestjslatam/ddd-lib';

interface ${name}Props {
  value: ${primitiveType};
}

export class ${name} extends ValueObject<${name}Props> {
  private constructor(props: ${name}Props) {
    super(props);
  }

  static create(value: ${primitiveType}): ${name} {
${validationCode.join("\n")}
    return new ${name}({ value });
  }

  get value(): ${primitiveType} {
    return this.props.value;
  }
}
`;
    writeFileSync(outputPath, code);
    return { generated: true, path: outputPath, name, validations };
  },
});

// Run the DDD Agent
async function runDDDAgent(task: string) {
  console.log(`\n🧠 DDD Agent Task: "${task}"\n`);

  const { text, steps } = await generateText({
    model: google("gemini-2.0-flash"),
    system: `You are a DDD architecture agent for NestJS projects using @nestjslatam/ddd-lib.
Your job is to scaffold bounded contexts, generate aggregates, value objects, and domain events
following strict DDD patterns. Rules:
- Every entity property that has domain meaning should be a Value Object
- Aggregates must have factory methods (static create), never public constructors
- Business rules must be explicit classes implementing IBusinessRule
- Always organize by bounded context: domain/application/infrastructure/presentation layers`,
    prompt: task,
    tools: { scaffoldBoundedContext, createValueObject },
    maxSteps: 15,
  });

  console.log(`📋 Completed in ${steps.length} step(s)`);
  steps.forEach((step, i) => {
    step.toolCalls?.forEach((tc) => {
      console.log(
        `  Step ${i + 1}: 🔧 ${tc.toolName}(${JSON.stringify(tc.args).substring(0, 100)}...)`,
      );
    });
  });
  console.log(`\n🤖 Summary: ${text}`);
}

// Example: scaffold an entire order management bounded context
runDDDAgent(
  'Create an "order-management" bounded context with an Order aggregate. ' +
    "Generate Value Objects for: OrderId (string, non-empty), " +
    "Money (number, must be positive), and CustomerEmail (string, must be valid email). " +
    "Put Value Objects in src/order-management/domain/value-objects/",
);
```

**Run it:**

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your-key npx ts-node src/ddd-agent.ts
```

**Expected output:**

```
🧠 DDD Agent Task: "Create an order-management bounded context..."

📋 Completed in 4 step(s)
  Step 1: 🔧 scaffoldBoundedContext({"contextName":"order-management","aggregates":["Order"]}...)
  Step 2: 🔧 createValueObject({"name":"OrderId","primitiveType":"string",...})
  Step 3: 🔧 createValueObject({"name":"Money","primitiveType":"number",...})
  Step 4: 🔧 createValueObject({"name":"CustomerEmail","primitiveType":"string",...})

🤖 Summary: Created the order-management bounded context with 11 directories,
   an Order aggregate skeleton, and 3 Value Objects (OrderId, Money, CustomerEmail)
   with validation rules.
```

### Key Tools & Frameworks

| Tool         | Package                                | Purpose                                                                                             |
| ------------ | -------------------------------------- | --------------------------------------------------------------------------------------------------- |
| VoltAgent    | `@voltagent/core`                      | TypeScript AI Agent Platform: Memory, RAG, Guardrails, Tools, MCP, Workflows, Multi-Agent (7.5k ⭐) |
| AI Providers | `@ai-sdk/openai` / `@ai-sdk/anthropic` | LLM providers for agent reasoning                                                                   |
| VoltOps      | Console                                | Agent observability, deployment, evals                                                              |

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

### Demo Code: DDD RAG Pipeline

```typescript
// src/ddd-rag-pipeline.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { readFileSync, readdirSync } from "fs";
import { randomUUID } from "crypto";
import { join } from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});
const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const qdrant = new QdrantClient({ url: "http://localhost:6333" });

const COLLECTION = "ddd-knowledge-base";
const VECTOR_SIZE = 768;

// Step 1: Ingest DDD library source code and docs
async function ingestDDDLibrary(libPath: string) {
  const files = readdirSync(libPath, { recursive: true, withFileTypes: true })
    .filter((f) => f.isFile() && /\.(ts|md)$/.test(f.name))
    .map((f) => join(String(f.parentPath ?? f.path), f.name));

  console.log(`📚 Found ${files.length} files to index`);

  try {
    await qdrant.deleteCollection(COLLECTION);
  } catch {}
  await qdrant.createCollection(COLLECTION, {
    vectors: { size: VECTOR_SIZE, distance: "Cosine" },
  });

  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    const chunks = content.match(/.{1,800}/gs) ?? [content];

    const points = await Promise.all(
      chunks.map(async (chunk) => {
        const result = await embeddingModel.embedContent(chunk);
        return {
          id: randomUUID(),
          vector: result.embedding.values,
          payload: {
            content: chunk,
            source: file,
            type: file.endsWith(".md") ? "documentation" : "source_code",
          },
        };
      }),
    );
    await qdrant.upsert(COLLECTION, { points });
    console.log(`  ✅ Indexed: ${file} (${chunks.length} chunks)`);
  }
}

// Step 2: RAG-powered DDD guidance tool (for agents to call)
async function getDDDGuidance(question: string): Promise<string> {
  const queryResult = await embeddingModel.embedContent(question);
  const hits = await qdrant.search(COLLECTION, {
    vector: queryResult.embedding.values,
    limit: 5,
    with_payload: true,
  });

  const context = hits
    .map((h) => {
      const p = h.payload as { content: string; source: string; type: string };
      return `[${p.type}: ${p.source}]\n${p.content}`;
    })
    .join("\n---\n");

  const response = await chatModel.generateContent(
    `You are a DDD expert using @nestjslatam/ddd-lib. Answer based on the library source code and docs below.

CONTEXT:
${context}

QUESTION: ${question}

Provide a concrete code example using the library's actual API.`,
  );

  return response.response.text();
}

// Example: ask the RAG system for DDD guidance
async function main() {
  // Ingest library (adjust path to your local ddd-lib clone)
  // await ingestDDDLibrary('./node_modules/@nestjslatam/ddd-lib');

  // Query examples
  const answer = await getDDDGuidance(
    "How do I create an AggregateRoot with business rules using @nestjslatam/ddd-lib?",
  );
  console.log("🤖 DDD Guidance:\n", answer);
}

main();
```

### Key Tools & Frameworks

| Tool                                               | Purpose                            |
| -------------------------------------------------- | ---------------------------------- |
| VoltAgent RAG (`@voltagent/core` retriever agents) | Knowledge retrieval for agents     |
| Qdrant / Pinecone                                  | Vector storage and semantic search |
| Gemini / OpenAI embedding models                   | Text-to-vector conversion          |

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

| Tool          | Package                  | Purpose                                              | Stars    |
| ------------- | ------------------------ | ---------------------------------------------------- | -------- |
| Mastra        | `@mastra/core`           | AI Framework: Agents, Workflows, MCP, RAG, Evals     | 22.8k ⭐ |
| CopilotKit    | `@copilotkit/react-core` | Agent-native frontend, Generative UI, AG-UI Protocol | 30k ⭐   |
| Vercel AI SDK | `ai`                     | Provider-agnostic AI toolkit, structured outputs     | 23.3k ⭐ |
| Context7      | `@upstash/context7-mcp`  | Docs for LLMs                                        | 51.9k ⭐ |

### Resources

- [Mastra Documentation](https://mastra.ai/docs)
- [CopilotKit Documentation](https://docs.copilotkit.ai)
- [Vercel AI SDK Documentation](https://ai-sdk.dev/docs) — _Note: SDK moved to ai-sdk.dev (v6)_

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
- **Free Course:** [Safe and Reliable AI via Guardrails (DeepLearning.AI)](https://www.deeplearning.ai/short-courses/safe-and-reliable-ai-via-guardrails/) — Build guardrails from scratch, mitigate hallucinations, PII. _Free, ~1.5h_

---

## Best AI Tools Ecosystem Reference

### MCP & Documentation Tools

| Tool                    | Package                     | Purpose                          | Stars    |
| ----------------------- | --------------------------- | -------------------------------- | -------- |
| **Context7**            | `@upstash/context7-mcp`     | Up-to-date library docs for LLMs | 51.9k ⭐ |
| **MCP Official SDK**    | `@modelcontextprotocol/sdk` | Build MCP servers in TypeScript  | Official |
| **Awesome MCP Servers** | —                           | Curated MCP server directory     | 35k+ ⭐  |

### Protocols & Standards

| Protocol                           | Purpose                                         | Status                                               |
| ---------------------------------- | ----------------------------------------------- | ---------------------------------------------------- |
| **MCP** (Model Context Protocol)   | Connects AI apps to external tools & data       | Open standard by Anthropic                           |
| **A2A** (Agent2Agent Protocol)     | Connects agents to each other across frameworks | Open standard by Google, donated to Linux Foundation |
| **AG-UI** (Agent-User Interaction) | Standardizes agent-to-frontend communication    | Backed by CopilotKit                                 |

### Agent Frameworks (TypeScript)

| Tool                            | Package                              | Purpose                                               | Stars    |
| ------------------------------- | ------------------------------------ | ----------------------------------------------------- | -------- |
| **VoltAgent**                   | `@voltagent/core`                    | AI Agent Platform: Memory, RAG, Tools, MCP, Workflows | 7.5k ⭐  |
| **Mastra**                      | `@mastra/core`                       | AI Framework: Agents, Workflows, MCP, Evals           | 22.8k ⭐ |
| **Vercel AI SDK**               | `ai`                                 | Provider-agnostic AI toolkit, structured outputs      | 23.3k ⭐ |
| **CopilotKit**                  | `@copilotkit/react-core`             | Agent-native frontend, Generative UI, AG-UI Protocol  | 30k ⭐   |
| **LangChain.js / LangGraph.js** | `langchain` / `@langchain/langgraph` | Chains, graphs, agentic workflows                     | 15k+ ⭐  |

### AI-Powered Development Tools

| Tool               | Purpose                           |
| ------------------ | --------------------------------- |
| **GitHub Copilot** | AI pair coding & agent mode       |
| **Cursor**         | AI-native IDE with MCP support    |
| **Claude Code**    | CLI coding agent with MCP support |
| **Antigravity**    | AI-native IDE                     |
| **Windsurf**       | AI-powered IDE by Codeium         |

### Observability & Operations

| Tool                | Purpose                                |
| ------------------- | -------------------------------------- |
| **VoltOps Console** | Agent observability, deployment, evals |
| **Langfuse**        | LLM observability & prompt management  |
| **Mastra Studio**   | Agent testing & debugging              |

---

## Key Library Files to Expose via AI Tooling

| Path                                         | Purpose                                    |
| -------------------------------------------- | ------------------------------------------ |
| `libs/ddd/src/core/`                         | Core DDD building blocks to expose via MCP |
| `libs/ddd/src/valueobjects/`                 | Base value object classes                  |
| `libs/ddd/src/aggregate-root.ts`             | AggregateRoot pattern to teach agents      |
| `libs/ddd/src/core/validator-rules/`         | Validation framework for guardrails        |
| `libs/ddd-valueobjects/src/implementations/` | 13+ concrete VOs as agent templates        |
| `docs/`                                      | Existing docs to feed into RAG pipeline    |

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

| #   | Course                                                                                                                                     | Applies to                     | Duration   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ | ---------- |
| 1   | [MCP: Build Rich-Context AI Apps with Anthropic](https://www.deeplearning.ai/short-courses/mcp-build-rich-context-ai-apps-with-anthropic/) | Sub-Phase 2A (MCP Server)      | ~1.8h      |
| 2   | [Build AI Apps with MCP Servers](https://www.deeplearning.ai/short-courses/build-ai-apps-with-mcp-server-working-with-box-files/)          | Sub-Phase 2A (MCP + A2A)       | ~36min     |
| 3   | [Agentic AI by Andrew Ng](https://www.deeplearning.ai/courses/agentic-ai/)                                                                 | Sub-Phase 2B (Agent patterns)  | Self-paced |
| 4   | [AI Agents in LangGraph](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/)                                                | Sub-Phase 2B (Agent framework) | ~1.5h      |
| 5   | [Agent Memory: Building Memory-Aware Agents](https://www.deeplearning.ai/short-courses/agent-memory-building-memory-aware-agents/)         | Sub-Phase 2B (Agent memory)    | ~2h        |
| 6   | [LangChain: Chat with Your Data](https://www.deeplearning.ai/short-courses/langchain-chat-with-your-data/)                                 | Sub-Phase 2C (RAG pipeline)    | ~1h        |
| 7   | [Multi AI Agent Systems with crewAI](https://www.deeplearning.ai/short-courses/multi-ai-agent-systems-with-crewai/)                        | Sub-Phase 2D (Multi-agent)     | ~2.5h      |
| 8   | [A2A: The Agent2Agent Protocol](https://www.deeplearning.ai/short-courses/a2a-the-agent2agent-protocol/)                                   | Sub-Phase 2D (Agent interop)   | ~1.5h      |
| 9   | [Safe and Reliable AI via Guardrails](https://www.deeplearning.ai/short-courses/safe-and-reliable-ai-via-guardrails/)                      | Sub-Phase 2E (Guardrails)      | ~1.5h      |

### Additional Official Documentation

- **Vercel AI SDK v6:** [ai-sdk.dev/docs](https://ai-sdk.dev/docs) — Agents, structured outputs, MCP tools, embeddings
- **Mastra Framework:** [mastra.ai/docs](https://mastra.ai/docs) — Agents, workflows, MCP server authoring
- **Context7:** [context7.com](https://context7.com) — Register libraries for AI doc delivery

---

## Architecture Decisions

| Decision                                 | Rationale                                                              |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| **VoltAgent** as primary agent framework | TypeScript-native, MCP-first, production observability via VoltOps     |
| **Mastra** as alternative/complement     | Workflow-heavy scenarios, Gatsby team backing, MCP server capabilities |
| **Context7** for documentation delivery  | Most popular docs-for-LLMs tool (51.9k ⭐), MCP-native                 |
| **MCP** as universal integration layer   | Open standard, supported by all major AI IDEs and tools                |
| **Scope: library-level tooling only**    | Focus on DDD library augmentation, not end-user application code       |
