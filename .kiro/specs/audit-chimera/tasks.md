# Tasks — Chimera

## M1 — Scaffold (done 19 Nov)
- [x] Repo layout, README / IDEAS / PLAN / LICENSE / .gitignore
- [x] `.kiro/` steering + specs + hooks draft
- [x] App skeleton: zero-dep server, UI stub, analyzer stub

## M2 — Analyzer wiring (done 19 Nov, verified live)
- [x] Sourcify fetch by address+chain (ETH/BSC/ARB/OP), unverified-contract path
- [x] Slither subprocess with `--json`, parse detectors → finding model
- [x] Pasted-source path (temp file, cleaned up after analysis)
- [x] Error paths: Slither missing, Sourcify timeout, bad address
- Verified: ETH USDC 18 findings, BSC USDC 27, ARB USDC 21, OP USDC 21, ETH WETH9 6;
  bad address + unverified EOA return clean errors. Fixes found live: Sourcify v2
  needs `?fields=sources,metadata` (default response has no sources; `/std-json`
  and `/files` 404); addresses must be lowercased (BSC BUSD 400); multi-file
  contracts need import-graph entry selection + `cwd`=temp dir for bare imports;
  exact solc from metadata (installed 0.4.26 + 0.6.4 via solc-select).
  BUSD on BSC is NOT verified on Sourcify (404) — BSC USDC used instead.

## M3 — LLM triage adapter (done 19 Nov, verified against mock endpoint)
- [x] OpenAI-compatible client from env (`LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`)
- [x] Per-finding prompt: severity / explanation / fix, JSON output
- [x] Graceful fallback when unset; never fake triage output
- Verified: mock OpenAI endpoint → 3/3 findings triaged on the Vault test;
  dead endpoint → 3 findings returned, 0 triaged, no crash. Default model is
  `free/deepseek-v4.1-flash` when base URL is APInex.
- LIVE PROVIDER NOT YET VERIFIED: APInex free returns HTTP 402 on all 3 free
  models tested 19 Nov (deepseek-v4.1-flash, gemini-3.8-flash, glm-5.3-flash);
  subscription shows 0 tokens remaining, `allowed: false`, resets 2026-11-20
  00:00 UTC (08:00 WITA). Retry the live call after the reset; do NOT spend a
  paid key on this.

## M4 — UI + export (done 19 Nov, verified live in headless Chromium)
- [x] Findings table with severity filter + detail view
- [x] Markdown report export
- [x] Polish: dark theme, loading states, error display
- Verified via Playwright (scripts/test-m4-ui.mjs): Vault → 3 findings rendered,
  badges All=3 High=1, summary "1 High · 2 Informational", High filter shows 1,
  All shows 3, export .md (43 lines) contains all 3 detectors even while filtered,
  empty-input error styled red, zero page errors.
- Kiro session record (honest): 2 non-interactive `kiro-cli chat` sessions tried
  19 Nov — both died with `ServerConnectionResetError` (code -32000, TRANSIENT).
  Session 1: no files changed. Session 2: index.html filter UI landed (kept,
  verified), but app.js was left TRUNCATED at 20 lines (syntax error) — restored
  and completed locally. Do NOT rely on Kiro CLI sessions on this VM until the
  connection is stable; the free-tier spend bought two disconnects, not a session.

## M5 — Kiro-driven session (needs user's `kiro-cli login`)
- [x] Login done 19 Nov (Builder ID, ramamanasia50@gmail.com) — see M4 note for
  session outcome: Kiro CLI connects but its backend sessions reset on this VM.
- [ ] Validate `.kiro/hooks/` format against kiro-cli docs — BLOCKED on a stable
  Kiro session (hook file is a draft; format unvalidated).
- [ ] Record actual Kiro usage for the submission write-up — see README "Kiro usage".

## M6 — Video + submission
- [x] Demo script (<3 min): address → analysis → triaged findings → export
  — DEMO-SCRIPT.md (timings, narration, shot checklist).
- [ ] Record + upload to YouTube (public) — user-side / later
- [ ] Devpost submission (repo, app URL, video, Kiro write-up) before 5 Dec 06:00 WITA
