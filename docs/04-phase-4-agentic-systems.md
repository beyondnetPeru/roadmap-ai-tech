# Phase 4: Agentic Systems, Rules, and Complex Orchestration

This is where classical software architecture (DDD, CQRS) and AI converge. We transition from linear flows to autonomous systems that make decisions in a loop.

## Theoretical Concepts

* **ReAct Pattern (Reason + Act):** The cognitive cycle of agents. They analyze the goal, select a tool from your code, execute it, observe the response, and determine the next logical step.
* **Multi-Agent Systems:** Orchestration where different models assume specific roles (e.g., Validator Agent vs. Executor Agent).
* **Rules (Guardrails):** Implementation of strict algorithmic constraints to ensure the AI complies with regulations and does not execute destructive commands.

## Hands-on (Practice)

1. Implement **LangGraph** (the current leading framework in TS for agentic workflows).
2. Design a cyclic graph where an agent receives an event (e.g., from Azure Service Bus), uses *Tools* to query your databases, validates the information against a set of security *Rules*, and issues an autonomous resolution. Use GitHub Copilot to streamline the writing of the graph nodes.

## Resources

### Official Documentation
* **Framework:** [Introduction to LangGraph.js](https://langchain-ai.github.io/langgraphjs/)
* **Advanced Concepts:** [Microsoft Learn: AI Agent Orchestration](https://learn.microsoft.com/en-us/semantic-kernel/agents/)
* **Vercel AI SDK Agents:** [Building Agents](https://ai-sdk.dev/docs/agents/building-agents) — Loop control, memory, subagents, workflow patterns
* **A2A Protocol:** [Agent2Agent Protocol](https://google.github.io/A2A/) — Open standard for agent-to-agent communication (complements MCP)

### Free Courses (DeepLearning.AI)
* **[Agentic AI](https://www.deeplearning.ai/courses/agentic-ai/)** — by Andrew Ng. 5 modules covering all 4 agentic design patterns: Reflection, Tool Use (incl. MCP), Planning, Multi-Agent. Capstone: Research Agent. *Self-paced, Intermediate*
* **[AI Agents in LangGraph](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/)** — by Harrison Chase (LangChain) & Rotem Weiss (Tavily). Build agents from scratch, LangGraph components, persistence, human-in-the-loop, essay writer agent. *Free, ~1.5h*
* **[Multi AI Agent Systems with crewAI](https://www.deeplearning.ai/short-courses/multi-ai-agent-systems-with-crewai/)** — by João Moura (crewAI). Role-playing, memory, tools, guardrails, cooperation. 6 business process automations. *Free, ~2.5h*
* **[Safe and Reliable AI via Guardrails](https://www.deeplearning.ai/short-courses/safe-and-reliable-ai-via-guardrails/)** — by Shreya Rajpal (GuardrailsAI). Mitigate hallucinations, PII leaks, off-topic responses. Build guardrails from scratch for RAG chatbot. *Free, ~1.5h*
* **[Agent Memory: Building Memory-Aware Agents](https://www.deeplearning.ai/short-courses/agent-memory-building-memory-aware-agents/)** — by Richmond Alake (Oracle). Memory-first architecture, semantic tool retrieval, write-back loops, fully stateful agents. *Free, ~2h*
* **[A2A: The Agent2Agent Protocol](https://www.deeplearning.ai/short-courses/a2a-the-agent2agent-protocol/)** — by Google Cloud & IBM Research. Build A2A servers/clients, sequential & hierarchical agent orchestration, A2A + MCP combined. *Free, ~1.5h*

### YouTube (Free)
* **[LangGraph Tutorial — Build AI Agents](https://www.youtube.com/results?search_query=langgraph+tutorial+ai+agents+typescript)** — Practical LangGraph implementations
* **[ReAct Pattern Explained](https://www.youtube.com/results?search_query=ReAct+pattern+AI+agents+explained)** — Understanding the Reason+Act cognitive loop
* **[Multi-Agent Systems Tutorial](https://www.youtube.com/results?search_query=multi+agent+systems+AI+tutorial)** — Building multi-agent orchestrations
