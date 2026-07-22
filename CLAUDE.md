# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A fork of **bolt.diy** (open-source Bolt.new): an AI agent that builds full-stack web apps in the browser. The user chats with an LLM; the LLM streams back "artifacts" containing shell commands and file writes that are executed inside a **WebContainer** (in-browser Node.js runtime). It runs as a Remix app on Cloudflare Pages, and also ships as an Electron desktop app.

## Commands

Package manager is **pnpm** (`pnpm@9.14.4`). Node `>=18.18.0`.

- `pnpm run dev` — dev server (runs `pre-start.cjs` first, then `remix vite:dev`)
- `pnpm test` — run Vitest once; `pnpm test:watch` for watch mode
- Run a single test: `pnpm vitest run app/lib/runtime/message-parser.spec.ts` (or `pnpm vitest -t "test name"`)
- `pnpm run typecheck` — `tsc` (no emit)
- `pnpm run lint` / `pnpm run lint:fix` — ESLint (+ Prettier on fix)
- `pnpm run build` — `remix vite:build`
- `pnpm run preview` — build then serve the production bundle via Wrangler (`pnpm start`)
- `pnpm run typegen` — regenerate Cloudflare binding types (`wrangler types`)
- `pnpm run electron:dev` — run the Electron desktop app in dev

Note: `pnpm start` runs the built app through Wrangler Pages (`start:windows` vs `start:unix` chosen automatically). Use it to test the Cloudflare Workers runtime locally, which differs from the Vite dev server.

## Verification expectations

A Husky pre-commit hook runs lint + typecheck. Before finishing changes, run `pnpm run lint` and `pnpm run typecheck`. Tests live next to code as `*.spec.ts`.

## Environment / secrets

Copy `.env.example` to `.env.local` (never commit it). API keys are read from three layers, in this precedence: client-supplied `apiKeys` → `serverEnv` (Cloudflare bindings) → `process.env` → `LLMManager.env` → provider config default. `VITE_LOG_LEVEL=debug` and `DEFAULT_NUM_CTX` (for Ollama) are useful toggles.

## Architecture

### Request flow
1. **`app/routes/api.chat.ts`** is the main endpoint. It receives messages, the current file map, `chatMode` (`'build'` | `'discuss'`), and options.
2. It optionally runs **context optimization** (`app/lib/.server/llm/select-context.ts`, `create-summary.ts`) to trim the file set / summarize history for the model.
3. **`app/lib/.server/llm/stream-text.ts`** builds the system prompt and calls the Vercel AI SDK `streamText`. `SwitchableStream` + `StreamRecoveryManager` handle multi-segment continuation (models that hit output limits get a `CONTINUE_PROMPT`) and timeout recovery.
4. The streamed response is parsed on the client by **`app/lib/runtime/message-parser.ts`**, which extracts `<boltArtifact>` / `<boltAction>` tags. Actions are `shell`, `file`, `start`, `supabase`, etc.
5. **`app/lib/runtime/action-runner.ts`** executes those actions against the **WebContainer** (`app/lib/webcontainer/`) — writing files and running commands.

### LLM provider system (`app/lib/modules/llm/`)
- Every provider extends **`BaseProvider`** (`base-provider.ts`) and is exported from **`registry.ts`**. **`LLMManager`** (`manager.ts`, singleton) auto-registers everything exported from the registry, merges static + dynamically-fetched model lists, and caches dynamic models.
- **To add a provider:** create `providers/your-provider.ts` extending `BaseProvider` (implement `getModelInstance`, declare `staticModels` and `config`), then add it to `registry.ts`. That's the only wiring needed — the manager discovers it.
- This fork adds non-upstream providers: `hcnsec`, `kilo`, `z-ai` alongside the standard set (OpenAI, Anthropic, Google, Groq, Bedrock, Ollama, LM Studio, OpenRouter, etc.).

### State (`app/lib/stores/`)
Uses **nanostores** (not Redux/Context). Key stores: `workbench.ts` (central editor/preview state), `files.ts`, `editor.ts`, `chat.ts`, `terminal.ts`, `previews.ts`, plus integration stores (`supabase`, `netlify`, `vercel`, `github`, `mcp`). WebContainer, terminals, and the file system are all coordinated through these.

### Persistence (`app/lib/persistence/`)
Chat history is stored in the browser via **IndexedDB** (`db.ts`, `useChatHistory.ts`). File/folder **locks** (`lockedFiles.ts`) are stored in localStorage, scoped per chat ID — locked files cannot be edited by the user or the AI.

### Prompts (`app/lib/common/prompts/`)
System prompts live here: `prompts.ts` (default + `CONTINUE_PROMPT`), `optimized.ts`, `new-prompt.ts`, `discuss-prompt.ts`. `prompt-library.ts` selects among them by `promptId`.

### Routes (`app/routes/`)
Remix flat-file routing. `api.*.ts` are server endpoints (chat, model listing, git proxy, deploy to Netlify/Vercel, Supabase, MCP, system diagnostics). UI routes: `_index.tsx`, `chat.$id.tsx`, `git.tsx`.

### Electron (`electron/`)
`main/` (main process), `preload/`, built separately via the `electron:build:*` scripts and `vite-electron.config.ts`.

## Conventions

- **No relative parent imports.** ESLint forbids `../` — always use the `~/` alias (maps to `app/`). This is enforced (except in `functions/` and `electron/`).
- TSX files enforce naming conventions (`@blitz` eslint plugin). `semi: always`, `curly: always`, unix linebreaks.
- Styling is **UnoCSS** (`uno.config.ts`) plus SCSS modules in `app/styles/`.
- Server-only code lives under `app/lib/.server/` (the `.server` directory is a Remix convention that keeps it out of the client bundle).
- The AI-facing artifact/action tags are literally `boltArtifact` / `boltAction` — don't rename these; the parser and system prompts depend on them.
