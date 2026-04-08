# Phase 5: Deep Integration and Model Context Protocol (MCP)

> **Goal:** Build MCP servers that let AI assistants (Copilot, Cursor, Claude) securely interact with your local systems — databases, APIs, file systems, and codebases — through a standardized protocol. MCP is the _USB-C of AI integration_: one protocol to connect any AI tool to any data source.

---

## Theoretical Concepts

### 5.1 What Is MCP?

**Definition:** The Model Context Protocol (MCP) is an open standard created by Anthropic that defines how AI assistants communicate with external systems. It provides a structured, secure way for LLMs to access your data without giving them raw access to your infrastructure.

**The problem MCP solves:**

```
Before MCP:
  Copilot → custom API → your database    (build integration per tool)
  Cursor  → different API → your database  (build ANOTHER integration)
  Claude  → yet another → your database    (and ANOTHER one)

After MCP:
  Copilot ─┐
  Cursor  ─┤→ MCP Protocol → Your MCP Server → your database, APIs, files
  Claude  ─┘
```

**Key insight:** You build ONE server that exposes your system's capabilities. ALL AI tools that support MCP can use it immediately.

**Reference:** [Model Context Protocol — Official Documentation](https://modelcontextprotocol.io/) — Complete specification, architecture, and SDK guides.

### 5.2 MCP Architecture

**Definition:** MCP uses a client-server model with three core primitives that expose different types of capabilities to AI assistants.

**The three primitives:**

| Primitive     | Controlled by                               | Description                                               | Example                                                     |
| ------------- | ------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------- |
| **Tools**     | Model (LLM decides when to call)            | Functions the AI can invoke — similar to function calling | `searchDatabase(query)`, `createTicket(title, body)`        |
| **Resources** | Application (exposed to the LLM as context) | Read-only data the AI can access for context              | Database schemas, config files, documentation               |
| **Prompts**   | User (selectable templates)                 | Pre-built prompt templates with arguments                 | "Summarize this PR", "Review this code for security issues" |

**Transport mechanisms:**

| Transport                    | How it works                                                | Use case                                |
| ---------------------------- | ----------------------------------------------------------- | --------------------------------------- |
| **stdio**                    | Server runs as a subprocess, communication via stdin/stdout | Local development, VS Code extensions   |
| **SSE (Server-Sent Events)** | HTTP-based streaming                                        | Remote servers, cloud deployments       |
| **Streamable HTTP**          | Latest transport — HTTP with bidirectional streaming        | Production remote servers (recommended) |

**Reference:** [MCP Architecture Overview](https://modelcontextprotocol.io/docs/concepts/architecture) — Deep dive into the client-server model.

### 5.3 MCP TypeScript SDK

**Definition:** The official `@modelcontextprotocol/sdk` package provides everything needed to build MCP servers and clients in TypeScript/Node.js.

**Key classes:**

| Class                  | Purpose                                                        |
| ---------------------- | -------------------------------------------------------------- |
| `McpServer`            | High-level server builder — register tools, resources, prompts |
| `StdioServerTransport` | Connect via stdin/stdout (for local IDE integration)           |
| `SSEServerTransport`   | Connect via HTTP/SSE (for remote servers)                      |
| `Client`               | MCP client for connecting to servers programmatically          |

**Reference:** [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) — Official SDK repository with examples.

### 5.4 MCP in VS Code / Cursor

**Definition:** Both VS Code (with GitHub Copilot) and Cursor natively support MCP servers. You configure them in your project, and the AI assistant can use your MCP tools during chat and agent mode.

**Configuration file:** `.vscode/mcp.json` (VS Code) or `.cursor/mcp.json` (Cursor):

```jsonc
{
  "servers": {
    "my-server": {
      "command": "npx",
      "args": ["ts-node", "src/mcp-server.ts"],
      "env": { "DATABASE_URL": "postgresql://localhost:5432/mydb" },
    },
  },
}
```

**Reference:** [MCP in VS Code](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) — Official VS Code MCP configuration guide.

---

## Hands-on Lab

### Prerequisites

```bash
mkdir phase-5-mcp && cd phase-5-mcp
npm init -y
npm install typescript ts-node @types/node
npm install @modelcontextprotocol/sdk zod        # MCP SDK
npm install @google/generative-ai                  # For the smart tool
npx tsc --init --strict --target ES2022 --module commonjs --rootDir src --outDir dist
mkdir src
```

### Exercise 1: Build Your First MCP Server

**Goal:** Create an MCP server that exposes tools, resources, and prompts for an e-commerce system.

Create `src/exercise-1-mcp-server.ts`:

```typescript
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Simulated e-commerce data
const products: Record<
  string,
  { name: string; price: number; stock: number; category: string }
> = {
  "SKU-001": {
    name: "Wireless Headphones",
    price: 79.99,
    stock: 150,
    category: "Electronics",
  },
  "SKU-002": {
    name: "Running Shoes",
    price: 129.99,
    stock: 45,
    category: "Sports",
  },
  "SKU-003": {
    name: "Coffee Maker",
    price: 49.99,
    stock: 0,
    category: "Kitchen",
  },
};

const orders: Record<
  string,
  { customerId: string; items: string[]; total: number; status: string }
> = {
  "ORD-100": {
    customerId: "CUST-001",
    items: ["SKU-001"],
    total: 79.99,
    status: "delivered",
  },
  "ORD-101": {
    customerId: "CUST-001",
    items: ["SKU-002", "SKU-003"],
    total: 179.98,
    status: "shipped",
  },
};

// ──────────────────────── CREATE MCP SERVER ────────────────────────

const server = new McpServer({
  name: "ecommerce-mcp",
  version: "1.0.0",
  description:
    "MCP server for e-commerce operations — product search, order management",
});

// ──────────────────────── TOOLS (model-controlled) ────────────────────────

// Tool 1: Search products
server.tool(
  "searchProducts",
  "Search products by name or category. Returns matching products with stock info.",
  {
    query: z.string().describe("Search term (product name or category)"),
    inStockOnly: z
      .boolean()
      .optional()
      .describe("Only return products with stock > 0"),
  },
  async ({ query, inStockOnly }) => {
    const results = Object.entries(products)
      .filter(([, p]) => {
        const matches =
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase());
        return matches && (!inStockOnly || p.stock > 0);
      })
      .map(([sku, p]) => ({ sku, ...p }));

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  },
);

// Tool 2: Get order details
server.tool(
  "getOrder",
  "Look up an order by ID. Returns order details including status and items.",
  { orderId: z.string().describe("Order ID (e.g., ORD-100)") },
  async ({ orderId }) => {
    const order = orders[orderId];
    if (!order) {
      return {
        content: [
          { type: "text" as const, text: `Order ${orderId} not found` },
        ],
      };
    }
    const itemDetails = order.items.map((sku) => ({
      sku,
      product: products[sku]?.name ?? "Unknown",
    }));
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ orderId, ...order, itemDetails }, null, 2),
        },
      ],
    };
  },
);

// Tool 3: Update stock
server.tool(
  "updateStock",
  "Update the stock quantity for a product. Use negative values to decrease stock.",
  {
    sku: z.string().describe("Product SKU (e.g., SKU-001)"),
    quantityChange: z
      .number()
      .describe("Amount to add (positive) or remove (negative)"),
  },
  async ({ sku, quantityChange }) => {
    const product = products[sku];
    if (!product) {
      return {
        content: [{ type: "text" as const, text: `Product ${sku} not found` }],
      };
    }
    const newStock = product.stock + quantityChange;
    if (newStock < 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Cannot reduce stock below 0. Current: ${product.stock}`,
          },
        ],
      };
    }
    product.stock = newStock;
    return {
      content: [
        {
          type: "text" as const,
          text: `Updated ${product.name}: stock ${product.stock - quantityChange} → ${newStock}`,
        },
      ],
    };
  },
);

// ──────────────────────── RESOURCES (application-controlled context) ────────────────────────

// Static resource: product catalog summary
server.resource(
  "catalog-summary",
  "ecommerce://catalog/summary",
  {
    description:
      "Summary of the product catalog with categories and stock levels",
  },
  async () => {
    const summary = Object.entries(products).map(([sku, p]) => ({
      sku,
      name: p.name,
      price: `$${p.price}`,
      stock: p.stock,
      available: p.stock > 0,
    }));
    return {
      contents: [
        {
          uri: "ecommerce://catalog/summary",
          mimeType: "application/json",
          text: JSON.stringify(summary, null, 2),
        },
      ],
    };
  },
);

// Dynamic resource template: individual product details
server.resource(
  "product-detail",
  new ResourceTemplate("ecommerce://products/{sku}", { list: undefined }),
  { description: "Detailed information about a specific product by SKU" },
  async (uri, { sku }) => {
    const product = products[sku as string];
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: product
            ? JSON.stringify({ sku, ...product }, null, 2)
            : `Product ${sku} not found`,
        },
      ],
    };
  },
);

// ──────────────────────── PROMPTS (user-controlled templates) ────────────────────────

server.prompt(
  "analyze-inventory",
  "Analyze current inventory levels and suggest reorder actions",
  {},
  async () => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Analyze our current inventory and recommend actions:

${JSON.stringify(
  Object.entries(products).map(([sku, p]) => ({
    sku,
    name: p.name,
    stock: p.stock,
    price: p.price,
  })),
  null,
  2,
)}

For each product:
1. Flag if stock is critically low (< 10 units) or out of stock
2. Recommend reorder quantity based on the price tier
3. Estimate reorder cost`,
        },
      },
    ],
  }),
);

// ──────────────────────── START SERVER ────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🚀 E-Commerce MCP Server running on stdio"); // stderr so it doesn't mix with MCP protocol
}

main();
```

**Test with MCP Inspector:**

```bash
npx @modelcontextprotocol/inspector npx ts-node src/exercise-1-mcp-server.ts
```

This opens a web UI at `http://localhost:6274` where you can:

- See all registered tools, resources, and prompts
- Test each tool with sample inputs
- Inspect JSON-RPC messages

### Exercise 2: Connect MCP Server to VS Code

**Goal:** Wire your MCP server into VS Code so GitHub Copilot can use your tools.

Create `.vscode/mcp.json` in your project root:

```jsonc
{
  "servers": {
    "ecommerce": {
      "command": "npx",
      "args": ["ts-node", "src/exercise-1-mcp-server.ts"],
      "cwd": "${workspaceFolder}",
    },
  },
}
```

**How to use:**

1. Open VS Code in the `phase-5-mcp` folder
2. Open Copilot Chat (Ctrl+Shift+I or Cmd+Shift+I)
3. Switch to **Agent mode** (select "Agent" in the chat mode dropdown)
4. Ask: _"Search for electronics products that are in stock"_
5. Copilot will discover your `searchProducts` tool and call it automatically

**You'll see in the chat:**

```
🔧 Used tool: searchProducts({ query: "electronics", inStockOnly: true })
→ Found 1 product: Wireless Headphones (SKU-001, $79.99, 150 in stock)
```

### Exercise 3: Build an MCP Client (Programmatic Access)

**Goal:** Build a TypeScript program that connects to your MCP server as a client — useful for testing, CI/CD, and building AI apps that consume MCP servers.

Create `src/exercise-3-mcp-client.ts`:

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  // 1. Spawn the MCP server as a subprocess and connect via stdio
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["ts-node", "src/exercise-1-mcp-server.ts"],
  });

  const client = new Client({ name: "test-client", version: "1.0.0" });
  await client.connect(transport);
  console.log("✅ Connected to MCP server\n");

  // 2. List available tools
  const { tools } = await client.listTools();
  console.log("🔧 Available tools:");
  tools.forEach((t) => console.log(`   - ${t.name}: ${t.description}`));

  // 3. List available resources
  const { resources } = await client.listResources();
  console.log("\n📄 Available resources:");
  resources.forEach((r) => console.log(`   - ${r.uri}: ${r.description}`));

  // 4. List available prompts
  const { prompts } = await client.listPrompts();
  console.log("\n💬 Available prompts:");
  prompts.forEach((p) => console.log(`   - ${p.name}: ${p.description}`));

  // 5. Call a tool
  console.log("\n── Calling searchProducts ──");
  const searchResult = await client.callTool({
    name: "searchProducts",
    arguments: { query: "Electronics", inStockOnly: true },
  });
  console.log("Result:", searchResult.content);

  // 6. Read a resource
  console.log("\n── Reading catalog summary ──");
  const resource = await client.readResource({
    uri: "ecommerce://catalog/summary",
  });
  console.log("Catalog:", resource.contents[0].text);

  // 7. Get a prompt
  console.log("\n── Getting analyze-inventory prompt ──");
  const prompt = await client.getPrompt({ name: "analyze-inventory" });
  console.log(
    "Prompt message:",
    (prompt.messages[0].content as { text: string }).text.substring(0, 200) +
      "...",
  );

  await client.close();
  console.log("\n✅ Client disconnected");
}

main();
```

**Run it:**

```bash
npx ts-node src/exercise-3-mcp-client.ts
```

**Expected output:**

```
✅ Connected to MCP server

🔧 Available tools:
   - searchProducts: Search products by name or category...
   - getOrder: Look up an order by ID...
   - updateStock: Update the stock quantity for a product...

📄 Available resources:
   - ecommerce://catalog/summary: Summary of the product catalog...

💬 Available prompts:
   - analyze-inventory: Analyze current inventory levels...

── Calling searchProducts ──
Result: [{ sku: "SKU-001", name: "Wireless Headphones", price: 79.99, stock: 150 }]

── Reading catalog summary ──
Catalog: [{ sku: "SKU-001", ... }, { sku: "SKU-002", ... }, ...]

✅ Client disconnected
```

---

## Key Takeaways

| Concept            | What you learned                                | Production use case                              |
| ------------------ | ----------------------------------------------- | ------------------------------------------------ |
| MCP protocol       | Standardized AI ↔ external system communication | Build once, use in Copilot, Cursor, Claude, etc. |
| Tools              | Functions the LLM decides when to call          | Database queries, API calls, CRUD operations     |
| Resources          | Read-only context exposed to the LLM            | Schemas, docs, configs, catalogs                 |
| Prompts            | Reusable prompt templates with arguments        | Standardized workflows, team best practices      |
| MCP Inspector      | Interactive testing of MCP servers              | Development, debugging, CI validation            |
| `.vscode/mcp.json` | Wire MCP servers into VS Code/Copilot           | Team-wide AI tool sharing via repository config  |

## Resources

### Official Documentation

- **Official Documentation:** [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- **TypeScript SDK:** [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- **TS Examples:** [Anthropic MCP Official Repository](https://github.com/modelcontextprotocol)
- **Awesome MCP Servers:** [Curated MCP Server Directory](https://github.com/punkpeye/awesome-mcp-servers) — 35k+ ⭐
- **Vercel AI SDK + MCP:** [MCP Tools Integration](https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools) — Use MCP tools directly in AI SDK v6 apps

### Free Courses (DeepLearning.AI)

- **[MCP: Build Rich-Context AI Apps with Anthropic](https://www.deeplearning.ai/short-courses/mcp-build-rich-context-ai-apps-with-anthropic/)** — by Elie Schoppik (Anthropic). MCP architecture, build server with FastMCP, create clients, connect to reference servers, deploy remote servers, configure Claude Desktop. _Free, ~1.8h_
- **[Build AI Apps with MCP Servers: Working with Box Files](https://www.deeplearning.ai/short-courses/build-ai-apps-with-mcp-server-working-with-box-files/)** — MCP + A2A integration, multi-agent system with Google ADK. _Free, ~36min_
- **[A2A: The Agent2Agent Protocol](https://www.deeplearning.ai/short-courses/a2a-the-agent2agent-protocol/)** — A2A complements MCP: MCP connects agents to data systems, A2A connects agents to each other. _Free, ~1.5h_

### YouTube (Free)

- **[Build an MCP Server in TypeScript](https://www.youtube.com/results?search_query=build+MCP+server+typescript+tutorial)** — Step-by-step MCP server creation
- **[MCP Explained — Model Context Protocol](https://www.youtube.com/results?search_query=model+context+protocol+MCP+explained)** — Architecture and concepts
- **[Connect MCP to Cursor / VS Code](https://www.youtube.com/results?search_query=MCP+cursor+vscode+setup+tutorial)** — Practical IDE integration
