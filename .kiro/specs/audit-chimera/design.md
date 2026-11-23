# Design — Chimera

## Architecture
```
Browser (public/index.html + app.js)
   │  POST /api/analyze { address?, chainId?, source? }
   ▼
Node server (server.js, zero deps)
   ├─► Sourcify v2 API  (fetch verified source by address+chain)
   ├─► Slither subprocess (audit-venv, --json) → detectors
   └─► LLM triage adapter (OpenAI-compatible, env-configured)
   ▼
JSON findings → dashboard render + Markdown export
```

## Data model (finding)
```json
{
  "detector": "reentrancy-eth",
  "severity": "High",
  "confidence": "Medium",
  "description": "…",
  "location": "Token.sol:42",
  "triage": { "severity": "High", "explanation": "…", "fix": "…" }
}
```

## Key decisions
- Zero npm dependencies in `app/` so `node server.js` just works anywhere.
- Slither via subprocess, not a library, so the analyzer stays swappable
  (Aderyn later, same JSON shape).
- LLM triage is an adapter, not a core dependency: the app is useful without it.
- Sourcify first (no key); Etherscan as a later optional source (needs a key).

## Kiro usage (for the submission write-up)
- Spec-driven development: this spec set (requirements → design → tasks).
- Steering docs: product / tech / structure in `.kiro/steering/`.
- Custom triage agent + hooks (on-save analysis draft in `.kiro/hooks/` —
  validate format against kiro-cli docs once logged in).
- MCP-style tool wiring: analyzer + Sourcify as tools the agent calls.
