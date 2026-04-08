# 🧪 Handson 1 — Structured Outputs & Function Calling

This directory contains the runnable TypeScript lab for **Phase 1** of the roadmap:

- **Exercise 1:** Structured output with `@google/generative-ai` + `zod`
- **Exercise 2:** Function calling with Gemini tools
- **Exercise 3:** Provider-agnostic examples with the Vercel AI SDK

## Files

```text
src/handson-1/
├── src/
│   ├── exercise-1-structured-output.ts
│   ├── exercise-2-function-calling.ts
│   ├── exercise-3-vercel-ai-sdk.ts
│   └── utils/env.ts
├── .env.example
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js 20+
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

## Setup

```bash
cd src/handson-1
npm install
cp .env.example .env
```

Add your API key to `.env`:

```env
GEMINI_API_KEY=your-key-here
```

## Run the exercises

```bash
npm run exercise:1
npm run exercise:2
npm run exercise:3
```

## Validation

```bash
npm run typecheck
npm run build
```

## Related documentation

- Phase guide: [`docs/01-phase-1-structured-outputs.md`](../../docs/01-phase-1-structured-outputs.md)
- Main repository guide: [`README.md`](../../README.md)
