# Chimera — Smart-Contract Audit Copilot (Kiroween 2026)

**Category:** Frankenstein · **Hackathon:** [Kiroween 2026](https://kiroween.devpost.com/) (Kiro/AWS on Devpost)
**Deadline:** Sat 5 Dec 2026, 06:00 WITA · **Prizes:** $100,000 cash (1st $30k / 2nd $20k / 3rd $10k, $5k per category, $20k bonus)

Chimera stitches four incompatible pieces into one working tool:

1. **Static analysis** — Slither, run locally against pasted Solidity or a deployed contract's verified source.
2. **Live on-chain data** — contract source/bytecode fetched from Sourcify (no API key).
3. **An AI triage agent** — an LLM reads the raw findings and returns severity, a plain-language explanation, and a fix suggestion per finding.
4. **A web dashboard** — paste an address or source, get a readable audit report, export it.

The Frankenstein angle is the point: a Python static analyzer, an LLM agent, live EVM RPC data, and a web UI — technologies that don't belong together, combined into one tool that solves a real problem for a real audience (developers and auditors who need a fast first-pass audit).

## Status (verified live 19 Nov 2026)

- [x] Scaffold: spec-driven structure under `.kiro/`, app skeleton
- [x] Analyzer wiring: Slither JSON parsing + Sourcify fetch by address (ETH/BSC/ARB/OP)
  — ETH USDC 18 findings, BSC USDC 27, ARB USDC 21, OP USDC 21, ETH WETH9 6
- [x] LLM triage adapter: OpenAI-compatible, per-finding severity/explanation/fix;
  verified against a mock endpoint (3/3 triaged) + graceful fallback when the
  endpoint is down. **Live via Gemini (gemini-3-flash-preview): verified 20 Nov
  and 23 Nov 2026 — ETH USDC → HTTP 200, 18 findings, 18/18 triaged.**
  Launch with `python3 run-gemini.py` (key resolved from the Secure Vault at
  runtime, never stored in the repo).
- [ ] UI polish + report export (in progress — severity filter, export)
- [ ] Kiro-driven build session (login done 19 Nov; first Kiro session: UI polish)
- [ ] Demo video (<3 min, YouTube) + Devpost submission — script in [DEMO-SCRIPT.md](DEMO-SCRIPT.md)

See [PLAN.md](PLAN.md) for the timeline and [IDEAS.md](IDEAS.md) for why this idea was picked.

## Run it

```bash
cd app
node server.js
# open http://localhost:3000
```

No dependencies — Node 18+ only (uses built-in `http` + `fetch`).
Optional env for AI triage (OpenAI-compatible endpoint, e.g. APInex):

```bash
LLM_BASE_URL=https://api.apinex.bond/v1
LLM_API_KEY=...
LLM_MODEL=...
```

Without those, the app still runs Slither + on-chain fetch; findings are shown with "AI triage not configured".

## Kiro usage (honest record, 19 Nov 2026)

Kiro CLI 3.5.0 is installed and logged in (Builder ID, ramamanasia50@gmail.com).
Spec-driven development lives in `.kiro/specs/audit-chimera/` (requirements →
design → tasks), steering docs in `.kiro/steering/`, hooks in `.kiro/hooks/`
(draft — format unvalidated, see below).
**Do NOT add `.kiro` to `.gitignore` — that disqualifies the submission.**

What Kiro actually did vs local tooling:
- Specs, steering, scaffold, analyzer (M2), triage adapter (M3), demo script (M6):
  built and verified locally with the standard toolchain (Node, Slither, Sourcify).
- UI polish (M4): two non-interactive `kiro-cli chat` sessions were attempted;
  both died mid-run with `ServerConnectionResetError` (transient backend disconnect).
  The second attempt's `index.html` filter UI survived and was kept; its `app.js`
  was left truncated and was restored + finished locally. No Kiro session has yet
  completed end-to-end on this VM — retry only once the connection is stable, and
  never claim a Kiro session did work it did not do.
- `.kiro/hooks/on-save-audit.json` is still a draft: its format must be validated
  against kiro-cli docs once a stable session exists.
