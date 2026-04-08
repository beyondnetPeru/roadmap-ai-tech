/**
 * Exercise 3 — Provider-Agnostic Version with the Vercel AI SDK
 *
 * Goal:
 * Recreate the same concepts from Exercises 1 and 2 using a unified SDK.
 *
 * What this demonstrates:
 * - `generateText()` + `Output.object()` for typed structured outputs
 * - `generateText()` + `tool()` for tool calling
 * - a provider-agnostic API that can be swapped later
 *
 * Run with: npm run exercise:3
 */
import { google } from "@ai-sdk/google";
import { generateText, Output, stepCountIs, tool } from "ai";
import { z } from "zod";

import { getGeminiApiKey } from "./utils/env";

/**
 * Structured output example using `generateText` + `Output.object`.
 */
async function structuredOutput() {
  getGeminiApiKey();

  const { output } = await generateText({
    model: google("gemini-2.0-flash"),
    output: Output.object({
      schema: z.object({
        productName: z.string(),
        sentiment: z.enum(["positive", "negative", "neutral"]),
        confidence: z.number().min(0).max(1),
        keyFeatures: z.array(z.string()).max(3),
        recommendation: z.enum(["buy", "skip", "wait_for_sale"]),
      }),
    }),
    prompt:
      'Analyze: "The MacBook Air M3 is blazing fast, incredibly thin, and has all-day battery. Best laptop under $1200."',
  });

  console.log("✅ Structured output:", output);
  console.log(`   Recommendation: ${output.recommendation}`);
}

/**
 * Tool-calling example using the Vercel AI SDK.
 */
async function functionCalling() {
  getGeminiApiKey();

  const result = await generateText({
    model: google("gemini-2.0-flash"),
    tools: {
      checkInventory: tool({
        description: "Check stock availability for a product by SKU",
        inputSchema: z.object({
          skuId: z.string().describe("Product SKU identifier"),
        }),
        execute: async ({ skuId }: { skuId: string }) => {
          const db: Record<string, { stock: number; price: number }> = {
            "SKU-100": { stock: 50, price: 79.99 },
          };

          return db[skuId] ?? { error: "Not found" };
        },
      }),
    },
    stopWhen: stepCountIs(5),
    prompt: "Check if SKU-100 is in stock and summarize the result.",
  });

  console.log("🔧 Tool results:", result.toolResults);
  console.log("🤖 Response:", result.text);
}

/**
 * Runs both examples sequentially so you can compare their output.
 */
async function main() {
  await structuredOutput();
  await functionCalling();
}

main().catch((error) => {
  console.error("❌ Exercise 3 failed:", error);
  process.exit(1);
});
