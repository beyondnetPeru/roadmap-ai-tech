import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { z } from "zod";

import { getGeminiApiKey } from "./utils/env";

const ProductAnalysisSchema = z.object({
  productName: z.string().describe("Name of the product analyzed"),
  sentiment: z.enum(["positive", "negative", "neutral"]),
  confidence: z.number().min(0).max(1).describe("Confidence score from 0 to 1"),
  keyFeatures: z
    .array(z.string())
    .length(3)
    .describe("Exactly three key product features"),
  recommendation: z.enum(["buy", "skip", "wait_for_sale"]),
});

type ProductAnalysis = z.infer<typeof ProductAnalysisSchema>;

const genAI = new GoogleGenerativeAI(getGeminiApiKey());

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
          format: "enum",
          enum: ["positive", "negative", "neutral"],
        },
        confidence: { type: SchemaType.NUMBER },
        keyFeatures: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        recommendation: {
          type: SchemaType.STRING,
          format: "enum",
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
    temperature: 0.1,
  },
});

async function analyzeProduct(review: string): Promise<ProductAnalysis> {
  const result = await model.generateContent(
    `Analyze this product review and extract structured data. Return exactly 3 key features.\n\nReview: "${review}"`,
  );

  const rawJson = JSON.parse(result.response.text());
  return ProductAnalysisSchema.parse(rawJson);
}

async function main() {
  const review =
    "The Sony WH-1000XM5 headphones have incredible noise cancellation, " +
    "comfortable fit for long sessions, and 30-hour battery life. " +
    "Sound quality is superb. Only downside is the price at $350.";

  const analysis = await analyzeProduct(review);

  console.log("✅ Validated output:");
  console.log(JSON.stringify(analysis, null, 2));
}

main().catch((error) => {
  console.error("❌ Exercise 1 failed:", error);
  process.exit(1);
});
