# Phase 0: Development Environment Setup — VS Code, Extensions & Best Practices

> **Complete this phase first.** A properly configured environment will accelerate every other phase of the roadmap.

This guide covers the essential VS Code extensions, CLI tools, settings, and coding best practices needed to work effectively across all phases — from prompt engineering to MCP servers, AI agents, and DDD library development.

---

## 1. VS Code Extensions

### AI Coding Assistants (pick your stack)

| Extension | Publisher | Installs | Why |
|-----------|-----------|----------|-----|
| **[GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)** | GitHub | 72.8M | AI pair programmer — inline completions, chat, agent mode, MCP support. *Essential for this roadmap.* |
| **[GitHub Copilot Chat](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat)** | GitHub | 70.3M | Chat interface for Copilot — ask questions, generate code, debug, explain. |
| **[Claude Code for VS Code](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code)** | Anthropic | 9.4M | Claude CLI agent integrated in VS Code — agentic coding with MCP. |
| **[Gemini Code Assist](https://marketplace.visualstudio.com/items?itemName=Google.geminicodeassist)** | Google | 3.7M | Google's Gemini in VS Code — useful for Phase 1 (Gemini API exercises). |

### MCP & AI Integration

| Extension | Publisher | Why |
|-----------|-----------|-----|
| **[Context7 MCP Server](https://marketplace.visualstudio.com/items?itemName=Upstash.context7-mcp)** | Upstash | Up-to-date library docs for LLMs. Essential for Phase 5 & 6. |
| **[Azure MCP Server](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azure-mcp-server)** | Microsoft | MCP server for Azure services integration. |

> **Note:** Mermaid diagram support is built into VS Code 1.109+ — no extension needed.

### TypeScript & JavaScript

| Extension | Publisher | Why |
|-----------|-----------|-----|
| **[ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)** | Microsoft | Linting and code quality enforcement. *Must-have.* |
| **[Prettier - Code Formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)** | Prettier | Consistent code formatting. *Must-have.* |
| **[Pretty TypeScript Errors](https://marketplace.visualstudio.com/items?itemName=yoavbls.pretty-ts-errors)** | yoavbls | Human-readable TypeScript errors — saves debugging time. |
| **[Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens)** | Alexander | Inline error/warning highlighting — see issues immediately. |
| **[JavaScript and TypeScript Nightly](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next)** | Microsoft | Latest TypeScript language features. |

### NestJS & Node.js

| Extension | Publisher | Why |
|-----------|-----------|-----|
| **[REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)** | Huachao Mao | Test HTTP endpoints directly from `.http` files — great for API dev. |
| **[Thunder Client](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client)** | Ranga Vadhineni | Lightweight API client inside VS Code (Postman alternative). |

> **Tip:** Use the NestJS CLI (`nest generate`) for scaffolding — it's always up to date: `nest g controller`, `nest g service`, `nest g module`, etc.

### Testing

| Extension | Publisher | Why |
|-----------|-----------|-----|
| **[Jest / Vitest Runner](https://marketplace.visualstudio.com/items?itemName=firsttris.vscode-jest-runner)** | firsttris | Run/debug individual Jest & Vitest tests from gutter icons. |
| **[Vitest](https://marketplace.visualstudio.com/items?itemName=vitest.explorer)** | Vitest | If using Vitest — test explorer with inline results. |

> **Note:** VS Code has a built-in Testing API (since v1.59) — no separate Test Explorer extension needed.

### Git & Collaboration

| Extension | Publisher | Why |
|-----------|-----------|-----|
| **[GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)** | GitKraken | Git blame, history, stash UI — essential for team workflows. |
| **[GitHub Pull Requests](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-pull-request-github)** | GitHub | Review and manage PRs without leaving VS Code. |
| **[Conventional Commits](https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits)** | vivaxy | Enforce conventional commit format for clean changelogs. |

### Code Quality & Productivity

| Extension | Publisher | Why |
|-----------|-----------|-----|
| **[SonarQube for IDE](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarlint-vscode)** | SonarSource | Static analysis — detect bugs, vulnerabilities, code smells. |
| **[Todo Tree](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree)** | Gruntfuggly | Find and list all TODOs/FIXMEs across the codebase. |
| **[Better Comments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments)** | Aaron Bond | Color-coded comments (TODOs, warnings, queries, highlights). |
| **[Path Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense)** | Christian Kohler | Autocomplete file paths in imports. |
| **[Auto Rename Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-rename-tag)** | Jun Han | Auto-rename paired HTML/JSX/TSX tags. |
| **[EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)** | EditorConfig | Consistent coding styles across editors and IDEs. |

### Databases & Vector Stores

| Extension | Publisher | Why |
|-----------|-----------|-----|
| **[MongoDB for VS Code](https://marketplace.visualstudio.com/items?itemName=mongodb.mongodb-vscode)** | MongoDB | Browse, query MongoDB databases (useful for embeddings storage). |
| **[SQLite Viewer](https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer)** | Florian Klampfer | View SQLite databases — used in DDD library examples. |
| **[Database Client](https://marketplace.visualstudio.com/items?itemName=cweijan.vscode-database-client2)** | Weijan Chen | Multi-database client: PostgreSQL, MySQL, SQLite, Redis. |

### Documentation & Visualization

| Extension | Publisher | Why |
|-----------|-----------|-----|
| **[Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one)** | Yu Zhang | Markdown shortcuts, TOC generation, preview — document everything. |
| **[Mermaid Preview](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid)** | Matt Bierner | Preview Mermaid diagrams in Markdown — architecture diagrams. |
| **[Draw.io Integration](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio)** | hediet | Create/edit diagrams directly in VS Code. |

### Docker & DevOps

| Extension | Publisher | Why |
|-----------|-----------|-----|
| **[Docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)** | Microsoft | Docker container management — run Qdrant, ChromaDB, Redis locally. |
| **[Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)** | Microsoft | Develop inside containers — reproducible environments. |

---

## 2. CLI Tools to Install

```bash
# Node.js (use nvm for version management)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
nvm install --lts

# Package managers
npm install -g pnpm          # Fast, disk-efficient package manager
npm install -g yarn           # Alternative to npm

# NestJS CLI
npm install -g @nestjs/cli

# TypeScript
npm install -g typescript ts-node

# AI & MCP tools
npx @anthropic-ai/claude-code # Claude Code CLI
npx @modelcontextprotocol/inspector  # MCP Inspector — test MCP servers
npx ctx7 setup                # Context7 — register library docs

# Testing
npm install -g jest

# Code quality
npm install -g eslint prettier

# Docker (install from https://docs.docker.com/get-docker/)
# Used for: Qdrant, ChromaDB, PostgreSQL, Redis
docker --version

# Git
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
git config --global init.defaultBranch main
```

---

## 3. Recommended VS Code Settings

Add to your User or Workspace `settings.json`:

```jsonc
{
  // Editor
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "editor.tabSize": 2,
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": "active",
  "editor.inlineSuggest.enabled": true,
  "editor.stickyScroll.enabled": true,

  // TypeScript
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },

  // Files
  "files.autoSave": "onFocusChange",
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  },

  // Terminal
  "terminal.integrated.defaultProfile.osx": "zsh",
  "terminal.integrated.fontSize": 13,

  // Git
  "git.autofetch": true,
  "git.confirmSync": false,

  // AI
  "github.copilot.enable": {
    "*": true,
    "markdown": true,
    "yaml": true
  },

  // Search
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true
  }
}
```

---

## 4. Project Configuration Files

Every project in this roadmap should include these configuration files:

### `.editorconfig`
```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

### `tsconfig.json` (base for all projects)
```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "exclude": ["node_modules", "dist", "test"]
}
```

### `.prettierrc`
```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

### `eslint.config.mjs` (flat config — ESLint 9+)
```js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    languageOptions: {
      parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'eslint.config.mjs'],
  },
);
```

> **Note:** ESLint 9+ uses flat config (`eslint.config.mjs`). The legacy `.eslintrc.*` format is deprecated. See the [migration guide](https://eslint.org/docs/latest/use/configure/migration-guide).

---

## 5. Copilot & AI Assistant Configuration

### `.github/copilot-instructions.md`
Create this file at the root of every project to give Copilot project-specific context:

```markdown
# Copilot Instructions

## Project Context
This is a TypeScript/NestJS project following DDD patterns.

## Conventions
- Use strict TypeScript (no `any`)
- Follow DDD patterns: Aggregates, Value Objects, Domain Events
- Use Zod for runtime validation
- Prefer functional patterns where appropriate
- All business logic in domain layer, never in controllers
- Use conventional commits

## Testing
- Jest for unit tests, colocated with source files (`*.spec.ts`)
- E2E tests in `test/` directory
- Aim for >80% coverage on domain logic
```

### `.instructions.md` (for Copilot Agent Mode)
```markdown
# Agent Instructions

- Always use TypeScript strict mode
- Prefer `const` over `let`, never use `var`
- Use explicit return types on public methods
- Validate inputs at boundaries with Zod
- Domain objects must be immutable (Value Objects)
- Use factory methods on Aggregates, not constructors directly
```

---

## 6. Best Practices Checklist

### Code Quality
- [ ] **Strict TypeScript** — Enable `"strict": true` in `tsconfig.json`. No `any` escapes.
- [ ] **ESLint + Prettier** — Format on save. No exceptions.
- [ ] **EditorConfig** — Consistent across collaborators and machines.
- [ ] **Conventional Commits** — `feat:`, `fix:`, `chore:`, `docs:` prefix on every commit.
- [ ] **Organize imports** — Auto-organize on save (remove unused imports).

### Architecture
- [ ] **DDD Layering** — Domain → Application → Infrastructure. Never import inward.
- [ ] **Single Responsibility** — One class/module per concern.
- [ ] **Dependency Injection** — Use NestJS DI container. No `new` for services.
- [ ] **Immutable Value Objects** — Extend from `@nestjslatam/ddd-lib` ValueObject base.
- [ ] **Validate at Boundaries** — Use Zod at API boundaries, Business Rules in domain.

### Testing
- [ ] **Test-driven** — Write tests before or alongside implementation.
- [ ] **Colocated tests** — `feature.service.ts` → `feature.service.spec.ts` in same folder.
- [ ] **Domain testing** — 100% coverage on business rules and value objects.
- [ ] **E2E tests** — Cover critical API flows.

### AI Development
- [ ] **MCP Inspector** — Test every MCP server with the inspector before integrating.
- [ ] **Copilot Instructions** — Keep `.github/copilot-instructions.md` updated per project.
- [ ] **Context7** — Register library docs for AI consumption (`npx ctx7 setup`).
- [ ] **Structured Outputs** — Always use Zod schemas when extracting data from LLMs.
- [ ] **Guardrails** — Add input/output validation on all agent tools.

### Security (OWASP-aligned)
- [ ] **No secrets in code** — Use `.env` files and `@nestjs/config`. Add `.env` to `.gitignore`.
- [ ] **Input validation** — Validate all external input (API, LLM outputs).
- [ ] **Dependency audit** — Run `npm audit` regularly. Keep dependencies updated.
- [ ] **Rate limiting** — On all AI-facing endpoints.

---

## 7. Quick Install Script

Run this to install all recommended VS Code extensions at once:

```bash
# AI Coding Assistants
code --install-extension GitHub.copilot
code --install-extension GitHub.copilot-chat
code --install-extension anthropic.claude-code

# MCP & AI Integration
code --install-extension Upstash.context7-mcp

# TypeScript & JavaScript
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension yoavbls.pretty-ts-errors
code --install-extension usernamehw.errorlens

# Testing
code --install-extension firsttris.vscode-jest-runner

# Git
code --install-extension eamodio.gitlens
code --install-extension GitHub.vscode-pull-request-github
code --install-extension vivaxy.vscode-conventional-commits

# Code Quality
code --install-extension SonarSource.sonarlint-vscode
code --install-extension Gruntfuggly.todo-tree
code --install-extension aaron-bond.better-comments
code --install-extension christian-kohler.path-intellisense
code --install-extension EditorConfig.EditorConfig

# Databases
code --install-extension mongodb.mongodb-vscode
code --install-extension qwtel.sqlite-viewer

# Documentation
code --install-extension yzhang.markdown-all-in-one
code --install-extension bierner.markdown-mermaid

# Docker
code --install-extension ms-azuretools.vscode-docker
code --install-extension ms-vscode-remote.remote-containers

# API Testing
code --install-extension humao.rest-client
```

---

## Resources

### VS Code Documentation
* **[VS Code Tips and Tricks](https://code.visualstudio.com/docs/getstarted/tips-and-tricks)**
* **[VS Code Key Bindings](https://code.visualstudio.com/docs/getstarted/keybindings)**
* **[MCP in VS Code](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)** — Configure MCP servers in VS Code

### TypeScript Best Practices
* **[TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)**
* **[NestJS Documentation](https://docs.nestjs.com/)**
* **[Zod Documentation](https://zod.dev/)**

### Free Courses
* **[ChatGPT Prompt Engineering for Developers](https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/)** — Start here for prompt engineering fundamentals. *Free, ~1.5h*
* **[Gemini CLI: Code & Create with an Open-Source Agent](https://www.deeplearning.ai/short-courses/gemini-cli-code-and-create-with-an-open-source-agent/)** — Learn CLI-based AI coding workflows. *Free*
