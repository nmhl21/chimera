# Tech steering — Chimera

## Stack
- **Runtime:** Node.js 18+ (zero npm dependencies in `app/` — built-in `http` + `fetch` only).
- **Analyzer:** Slither 0.11.6 (local, `~/workspace/bug-bounty/audit-venv/bin/slither`),
  invoked as a subprocess with `--json` output.
- **On-chain data:** Sourcify v2 API (no key) for verified source by address;
  chain IDs: 1 (Ethereum), 56 (BSC), 42161 (Arbitrum), 10 (Optimism).
- **AI triage:** OpenAI-compatible chat completions endpoint, configured by env
  (`LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`). Default route is the user's
  APInex key. The triage adapter must degrade gracefully when unset.
- **Frontend:** plain HTML/CSS/JS, no framework. Dark theme, readable tables.

## Conventions
- ES modules (`"type": "module"`), no build step.
- Every finding carries: detector, severity, confidence, description, location
  (file:line), and triage (explanation + suggested fix) when available.
- Never log API keys. Never write user-supplied source to disk outside a
  temp dir that is cleaned up after analysis.
- All external calls have a timeout (15 s) and a clear error message on failure.
