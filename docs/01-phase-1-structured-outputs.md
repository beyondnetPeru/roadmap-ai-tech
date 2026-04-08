# Phase 1: Deterministic Control (Structured Outputs & Function Calling)

> **Goal:** Master how LLMs interact with production code. In a real system, an LLM must never return free-form text — it must return exact data structures or invoke functions from your backend. This phase teaches you to control AI output deterministically.

---

## Theoretical Concepts

### 1.1 Prompt Engineering for Code

**What it is:** The practice of crafting precise instructions (prompts) that guide an LLM to produce consistent, high-quality outputs for software engineering tasks. Unlike casual chat, code prompts require strict formatting, clear constraints, and reproducibility.

**Key techniques:**

| Technique                  | Description                                                                                                                             | When to use                                                   |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **System Prompt**          | A hidden instruction that sets the LLM's role, personality, and constraints before any user input. It persists across the conversation. | Always — defines behavior boundaries                          |
| **Few-Shot Prompting**     | Providing 2-5 input/output examples so the LLM learns the expected pattern by analogy.                                                  | When the output format is complex or ambiguous                |
| **Temperature control**    | A parameter (0.0–2.0) controlling output randomness. `0.0` = deterministic, `1.0` = creative, `>1.5` = chaotic.                         | `0.0–0.3` for code generation; `0.7–1.0` for creative content |
| **Chain-of-Thought (CoT)** | Asking the model to "think step by step" before producing the final answer. Improves reasoning accuracy.                                | Complex logic, multi-step problem solving                     |

**Reference:** [Prompt Engineering Guide](https://www.promptingguide.ai/) — Comprehensive resource covering all prompting techniques with examples.

### 1.2 Structured Outputs

**What it is:** A mechanism that forces the LLM to return responses that conform to a strict JSON Schema. Instead of getting free-form text that you have to parse (fragile), the model is _constrained at the decoding level_ to only generate valid JSON matching your schema. This means the output is guaranteed to be parseable — no regex, no try/catch, no "almost JSON".

**How it works internally:** The LLM provider restricts token generation so that only tokens forming valid JSON according to your schema can be sampled. This is called _constrained decoding_ or _guided generation_.

**Why it matters for production:**

- Eliminates parsing errors — the response is always valid JSON
- Maps directly to TypeScript interfaces / Zod schemas
- Enables type-safe AI: `LLM response → Zod.parse() → TypeScript type`
- Required for any pipeline where AI output feeds into downstream code

**Reference:** [OpenAI Structured Outputs Guide](https://platform.openai.com/docs/guides/structured-outputs) — Definitive guide on schema-constrained generation.

### 1.3 Function Calling (Tools)

**What it is:** The mechanism by which you define function signatures (name, parameters, description) and provide them to the LLM. The model _does not execute code_ — it reasons about which function to call and returns a structured JSON "call request" with the function name and arguments. Your backend then executes the function and returns the result to the model, which can continue reasoning.

**The flow:**

```
User Query → LLM reasons → LLM emits tool_call{name, args} → Your backend executes function
→ Result returned to LLM → LLM continues or responds
```

**Why it matters:**

- LLMs can interact with databases, APIs, file systems — any backend capability
- The LLM _decides_ when to call a function based on the user's intent
- Multiple functions can be called in sequence (chaining) or in parallel
- This is the foundation of AI Agents (Phase 4)

**Reference:** [Google AI — Function Calling](https://ai.google.dev/gemini-api/docs/function-calling) — Official Gemini function calling documentation.

### 1.4 Zod Schema Validation

**What it is:** Zod is a TypeScript-first schema validation library. In the AI context, you define your expected output _once_ as a Zod schema, and it serves triple duty: (1) runtime validation of LLM responses, (2) TypeScript type inference, and (3) JSON Schema generation for the LLM provider.

**Why Zod specifically:**

- `z.infer<typeof schema>` gives you the TypeScript type automatically
- `zodToJsonSchema()` converts to JSON Schema for LLM providers
- `.parse()` throws on invalid data, `.safeParse()` returns a discriminated union
- First-class support in Vercel AI SDK, LangChain, and most AI frameworks

**Reference:** [Zod Documentation](https://zod.dev/) — TypeScript-first schema validation with static type inference.

---

## Hands-on Lab

### Prerequisites

```bash
mkdir phase-1-structured-outputs && cd phase-1-structured-outputs
npm init -y
npm install typescript ts-node @types/node zod
npm install @google/generative-ai    # Gemini SDK
npm install ai @ai-sdk/google        # Vercel AI SDK (alternative)
npx tsc --init --strict --target ES2022 --module commonjs --rootDir src --outDir dist
mkdir src
```

> **API Key:** Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com/apikey). Create a `.env` file with `GEMINI_API_KEY=your-key-here`. Add `.env` to `.gitignore`.

### Exercise 1: Structured Output with Zod + Gemini

**Goal:** Force Gemini to return a strict JSON object matching a TypeScript interface.

Create `src/exercise-1-structured-output.ts`:

```typescript
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { z } from "zod";

// 1. Define your expected output as a Zod schema
const ProductAnalysisSchema = z.object({
  productName: z.string().describe("Name of the product analyzed"),
  sentiment: z.enum(["positive", "negative", "neutral"]),
  confidence: z.number().min(0).max(1).describe("Confidence score 0-1"),
  keyFeatures: z.array(z.string()).describe("Top 3 features mentioned"),
  recommendation: z.enum(["buy", "skip", "wait_for_sale"]),
});

// TypeScript type is inferred automatically
type ProductAnalysis = z.infer<typeof ProductAnalysisSchema>;

// 2. Configure Gemini with JSON schema response
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        productName: { type: SchemaType.STRING },
        sentiment: {
          type: SchemaType.STRING,
          enum: ["positive", "negative", "neutral"],
        },
        confidence: { type: SchemaType.NUMBER },
        keyFeatures: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        recommendation: {
          type: SchemaType.STRING,
          enum: ["buy", "skip", "wait_for_sale"],
        },
      },
      required: [
        "productName",
        "sentiment",
        "confidence",
        "keyFeatures",
        "recommendation",
      ],
    },
    temperature: 0.1, // Low temperature for deterministic output
  },
});

async function analyzeProduct(review: string): Promise<ProductAnalysis> {
  const result = await model.generateContent(
    `Analyze this product review and extract structured data. Return exactly 3 key features.\n\nReview: "${review}"`,
  );

  const rawJson = JSON.parse(result.response.text());

  // 3. Validate with Zod — guarantees type safety at runtime
  const validated = ProductAnalysisSchema.parse(rawJson);
  console.log("✅ Validated output:", JSON.stringify(validated, null, 2));
  return validated;
}

// Run
analyzeProduct(
  "The Sony WH-1000XM5 headphones have incredible noise cancellation, " +
    "comfortable fit for long sessions, and 30-hour battery life. " +
    "Sound quality is superb. Only downside is the price at $350.",
);
```

**Run it:**

```bash
GEMINI_API_KEY=your-key npx ts-node src/exercise-1-structured-output.ts
```

**Expected output:**

```json
{
  "productName": "Sony WH-1000XM5",
  "sentiment": "positive",
  "confidence": 0.92,
  "keyFeatures": [
    "noise cancellation",
    "comfortable fit",
    "30-hour battery life"
  ],
  "recommendation": "buy"
}
```

### Exercise 2: Function Calling (Tools)

**Goal:** Define a tool, let Gemini decide when to call it, execute it on your backend, and return the result.

Create `src/exercise-2-function-calling.ts`:

```typescript
import {
  GoogleGenerativeAI,
  FunctionDeclarationSchemaType,
} from "@google/generative-ai";

// 1. Define your backend functions (these simulate real services)
const inventoryDatabase: Record<
  string,
  { stock: number; price: number; warehouse: string }
> = {
  "SKU-001": { stock: 150, price: 29.99, warehouse: "US-West" },
  "SKU-002": { stock: 0, price: 49.99, warehouse: "EU-Central" },
  "SKU-003": { stock: 12, price: 199.99, warehouse: "US-East" },
};

function checkInventory(skuId: string) {
  const item = inventoryDatabase[skuId];
  if (!item) return { error: `SKU ${skuId} not found` };
  return { skuId, ...item, inStock: item.stock > 0 };
}

function createOrder(skuId: string, quantity: number) {
  const item = inventoryDatabase[skuId];
  if (!item || item.stock < quantity)
    return { success: false, reason: "Insufficient stock" };
  return {
    success: true,
    orderId: `ORD-${Date.now()}`,
    total: item.price * quantity,
  };
}

// 2. Declare tools for the LLM (it only sees the signatures, not the code)
const tools = [
  {
    functionDeclarations: [
      {
        name: "checkInventory",
        description:
          "Check stock availability and price for a product by SKU ID",
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            skuId: {
              type: FunctionDeclarationSchemaType.STRING,
              description: "Product SKU identifier (e.g., SKU-001)",
            },
          },
          required: ["skuId"],
        },
      },
      {
        name: "createOrder",
        description:
          "Place an order for a product. Only call after confirming stock availability.",
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            skuId: {
              type: FunctionDeclarationSchemaType.STRING,
              description: "Product SKU identifier",
            },
            quantity: {
              type: FunctionDeclarationSchemaType.NUMBER,
              description: "Number of units to order",
            },
          },
          required: ["skuId", "quantity"],
        },
      },
    ],
  },
];

// 3. Map function names to implementations
const functionMap: Record<string, Function> = { checkInventory, createOrder };

// 4. Run the conversation with tool-use loop
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", tools });

async function handleUserQuery(query: string) {
  console.log(`\n🧑 User: ${query}`);
  const chat = model.startChat();
  let response = await chat.sendMessage(query);

  // Tool-use loop: keep going until the model stops requesting function calls
  while (
    response.response.candidates?.[0]?.content?.parts?.some(
      (p) => p.functionCall,
    )
  ) {
    const functionCalls = response.response.candidates[0].content.parts.filter(
      (p) => p.functionCall,
    );

    const functionResponses = functionCalls.map((part) => {
      const { name, args } = part.functionCall!;
      console.log(`🔧 Tool call: ${name}(${JSON.stringify(args)})`);
      const result = functionMap[name](
        ...Object.values(args as Record<string, unknown>),
      );
      console.log(`📦 Result:`, result);
      return { functionResponse: { name, response: result } };
    });

    response = await chat.sendMessage(functionResponses);
  }

  console.log(`🤖 Assistant: ${response.response.text()}`);
}

// Run — the LLM will decide to call checkInventory first, then createOrder
handleUserQuery(
  "I need 5 units of SKU-001. Check if they are available and place the order.",
);
```

**Run it:**

```bash
GEMINI_API_KEY=your-key npx ts-node src/exercise-2-function-calling.ts
```

**Expected flow:**

```
🧑 User: I need 5 units of SKU-001. Check if available and place the order.
🔧 Tool call: checkInventory({"skuId":"SKU-001"})
📦 Result: { skuId: 'SKU-001', stock: 150, price: 29.99, warehouse: 'US-West', inStock: true }
🔧 Tool call: createOrder({"skuId":"SKU-001","quantity":5})
📦 Result: { success: true, orderId: 'ORD-1712500000000', total: 149.95 }
🤖 Assistant: I've placed your order! 5 units of SKU-001 at $29.99 each, total $149.95.
```

### Exercise 3: Vercel AI SDK (Provider-Agnostic Alternative)

**Goal:** Same functionality using the Vercel AI SDK — which provides a unified API across OpenAI, Gemini, Anthropic, etc.

Create `src/exercise-3-vercel-ai-sdk.ts`:

```typescript
import { generateObject, generateText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

// 1. Structured Output with generateObject — Zod schema is the single source of truth
async function structuredOutput() {
  const { object } = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: z.object({
      productName: z.string(),
      sentiment: z.enum(["positive", "negative", "neutral"]),
      confidence: z.number().min(0).max(1),
      keyFeatures: z.array(z.string()).max(3),
      recommendation: z.enum(["buy", "skip", "wait_for_sale"]),
    }),
    prompt:
      'Analyze: "The MacBook Air M3 is blazing fast, incredibly thin, and has all-day battery. Best laptop under $1200."',
  });

  // `object` is fully typed — no casting needed
  console.log("✅ Structured output:", object);
  console.log(`   Recommendation: ${object.recommendation}`);
}

// 2. Function Calling with tools — cleaner syntax
async function functionCalling() {
  const { text, toolResults } = await generateText({
    model: google("gemini-2.0-flash"),
    tools: {
      checkInventory: tool({
        description: "Check stock availability for a product by SKU",
        parameters: z.object({ skuId: z.string() }),
        execute: async ({ skuId }) => {
          // Simulate database lookup
          const db: Record<string, { stock: number; price: number }> = {
            "SKU-100": { stock: 50, price: 79.99 },
          };
          return db[skuId] ?? { error: "Not found" };
        },
      }),
    },
    maxSteps: 5, // Allow up to 5 tool-call rounds
    prompt: "Check if SKU-100 is in stock.",
  });

  console.log("🔧 Tool results:", toolResults);
  console.log("🤖 Response:", text);
}

structuredOutput().then(() => functionCalling());
```

**Run it:**

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your-key npx ts-node src/exercise-3-vercel-ai-sdk.ts
```

---

## Key Takeaways

| Concept             | What you learned                                 | Production use case                            |
| ------------------- | ------------------------------------------------ | ---------------------------------------------- |
| Structured Outputs  | Force LLM → exact JSON schema                    | API responses, data extraction, form filling   |
| Function Calling    | LLM decides when to call your code               | Database queries, API orchestration, workflows |
| Zod validation      | Single source of truth for types + validation    | Input/output contracts across the entire stack |
| Temperature control | `0.0-0.3` for deterministic, `0.7+` for creative | Code gen = low temp, brainstorming = high temp |
| Vercel AI SDK       | Provider-agnostic AI toolkit                     | Swap providers without code changes            |

## Resources

### Official Documentation

- **Gemini Documentation:** [Function Calling](https://ai.google.dev/docs/function_calling)
- **OpenAI Documentation:** [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- **Zod Documentation:** [Zod — TypeScript-first schema validation](https://zod.dev/)

### Free Courses (DeepLearning.AI)

- **[ChatGPT Prompt Engineering for Developers](https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/)** — by Isa Fulford (OpenAI) & Andrew Ng. Best practices for System Prompts, Few-Shot Prompting, iterative prompt design. _Free, ~1.5h_
- **[Function Calling and Data Extraction with LLMs](https://www.deeplearning.ai/short-courses/function-calling-and-data-extraction-with-llms/)** — Parallel/nested function calls, structured data extraction, SQL generation via LLM. _Free, ~1h_
- **[LangChain for LLM Application Development](https://www.deeplearning.ai/short-courses/langchain-for-llm-application-development/)** — by Harrison Chase (LangChain) & Andrew Ng. Models, prompts, parsers, chains, agents, memory. _Free, ~1.5h_

### YouTube (Free)

- **[Gemini API Function Calling Tutorial](https://www.youtube.com/results?search_query=gemini+api+function+calling+typescript+tutorial)** — Search for up-to-date tutorials on Gemini function calling with TypeScript
- **[Vercel AI SDK Structured Outputs](https://www.youtube.com/results?search_query=vercel+ai+sdk+structured+outputs+zod)** — Practical examples using `ai` package with Zod schemas
