/**
 * Exercise 2 — Function Calling with Gemini Tools
 *
 * Goal:
 * Let the model decide when to call backend functions such as
 * `checkInventory` and `createOrder`.
 *
 * What this demonstrates:
 * 1. Expose function signatures to the model.
 * 2. Let Gemini request one or more tool calls.
 * 3. Execute those calls in your code and return the results.
 *
 * Run with: npm run exercise:2
 */
import {
  GoogleGenerativeAI,
  SchemaType,
  type FunctionDeclaration,
  type Tool,
} from "@google/generative-ai";

import { getGeminiApiKey } from "./utils/env";

type InventoryItem = {
  stock: number;
  price: number;
  warehouse: string;
};

// Simulated backend data source.
const inventoryDatabase: Record<string, InventoryItem> = {
  "SKU-001": { stock: 150, price: 29.99, warehouse: "US-West" },
  "SKU-002": { stock: 0, price: 49.99, warehouse: "EU-Central" },
  "SKU-003": { stock: 12, price: 199.99, warehouse: "US-East" },
};

function checkInventory(skuId: string) {
  const item = inventoryDatabase[skuId];

  if (!item) {
    return { error: `SKU ${skuId} not found` };
  }

  return {
    skuId,
    ...item,
    inStock: item.stock > 0,
  };
}

function createOrder(skuId: string, quantity: number) {
  const item = inventoryDatabase[skuId];

  if (!item || item.stock < quantity) {
    return { success: false, reason: "Insufficient stock" };
  }

  item.stock -= quantity;

  return {
    success: true,
    orderId: `ORD-${Date.now()}`,
    total: Number((item.price * quantity).toFixed(2)),
    remainingStock: item.stock,
  };
}

// Tool declarations are the only part visible to the model.
const functionDeclarations: FunctionDeclaration[] = [
  {
    name: "checkInventory",
    description: "Check stock availability and price for a product by SKU ID",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        skuId: {
          type: SchemaType.STRING,
          description: "Product SKU identifier (for example: SKU-001)",
        },
      },
      required: ["skuId"],
    },
  },
  {
    name: "createOrder",
    description:
      "Place an order for a product. Only call this after confirming the item is in stock.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        skuId: {
          type: SchemaType.STRING,
          description: "Product SKU identifier",
        },
        quantity: {
          type: SchemaType.NUMBER,
          description: "Number of units to order",
        },
      },
      required: ["skuId", "quantity"],
    },
  },
];

const tools: Tool[] = [
  {
    functionDeclarations,
  },
];

const functionMap: Record<string, (args: Record<string, unknown>) => unknown> =
  {
    checkInventory: (args) => checkInventory(String(args.skuId)),
    createOrder: (args) =>
      createOrder(String(args.skuId), Number(args.quantity)),
  };

const genAI = new GoogleGenerativeAI(getGeminiApiKey());
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  tools,
});

/**
 * Runs the Gemini tool loop until the model stops requesting function calls.
 */
async function handleUserQuery(query: string) {
  console.log(`\n🧑 User: ${query}`);

  const chat = model.startChat();
  let response = await chat.sendMessage(query);

  // Keep looping until Gemini stops asking to use tools.
  while (true) {
    const functionCalls = response.response.functionCalls() ?? [];

    if (functionCalls.length === 0) {
      break;
    }

    const functionResponses = functionCalls.map((call) => {
      console.log(`🔧 Tool call: ${call.name}(${JSON.stringify(call.args)})`);

      const args = (call.args ?? {}) as Record<string, unknown>;
      const result = functionMap[call.name]?.(args) ?? {
        error: `Unknown function: ${call.name}`,
      };

      console.log("📦 Result:", result);

      return {
        functionResponse: {
          name: call.name,
          response: result,
        },
      };
    });

    response = await chat.sendMessage(functionResponses);
  }

  console.log(`🤖 Assistant: ${response.response.text()}`);
}

handleUserQuery(
  "I need 5 units of SKU-001. Check if they are available and place the order.",
).catch((error) => {
  console.error("❌ Exercise 2 failed:", error);
  process.exit(1);
});
