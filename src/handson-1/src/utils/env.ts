import "dotenv/config";

export function getGeminiApiKey(): string {
  const apiKey =
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing Gemini API key. Add GEMINI_API_KEY to .env or export it in your shell.",
    );
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
  }

  return apiKey;
}
