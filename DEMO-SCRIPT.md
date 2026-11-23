# Chimera — demo video script (<3 min, public YouTube)

Target length: **~2:30**. No copyrighted music; record the screen + voiceover.
Record at 1280x720, browser zoom 100%, dark theme (the app is dark by default).
Before recording: start the server (`cd app && node server.js`), have the
Vault source and the USDC address ready to paste.

## 0:00–0:15 — Hook
- **On screen:** dashboard home, cursor on the title.
- **Say:** "Chimera is a smart-contract audit copilot. Paste a contract address or
  Solidity source, and it stitches Slither static analysis, live on-chain source
  from Sourcify, and an AI triage agent into one readable audit report — built
  for Kiroween 2026 in the Frankenstein category."

## 0:15–0:50 — Demo 1: real contract by address
- **On screen:** paste `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` (USDC, Ethereum),
  chain = Ethereum, click Analyze. Wait for the 18 findings to load.
- **Say:** "First, a real contract. USDC on Ethereum — Chimera fetches its verified
  source from Sourcify and runs Slither on it. Eighteen findings, each with a
  severity, confidence, and file location."
- **Show:** scroll through two or three findings (constant-function-asm, shadowing-local).

## 0:50–1:25 — Demo 2: vulnerable source + AI triage
- **On screen:** clear the address, paste the Vault contract (reentrancy), Analyze.
  Point at the `reentrancy-eth — High` card and its AI triage box (explanation + fix).
- **Say:** "Now a vulnerable contract. Slither flags reentrancy as High — and the
  AI triage agent explains it in plain language and suggests the fix:
  checks-effects-interactions. Same for every finding, or raw Slither output
  when no AI key is configured."
- **Show:** the triage box on the High finding; note the "AI triage not configured"
  fallback line only if triage is off in this take (prefer a take with triage on).

## 1:25–1:55 — Filter + export
- **On screen:** click the High filter (count badge drops to the High findings),
  then All again; click "Export report (.md)" and open the downloaded file.
- **Say:** "Filter by severity, and export the whole report as Markdown — the same
  report you'd hand to a developer."

## 1:55–2:20 — How it's built (the Frankenstein bit)
- **On screen:** quick cuts — terminal `node server.js`, the repo tree showing
  `.kiro/specs`, `app/lib/analyzer.js`; no long code reading.
- **Say:** "Under the hood: a zero-dependency Node server, Slither as a subprocess,
  Sourcify for verified source on Ethereum, BSC, Arbitrum and Optimism, and an
  OpenAI-compatible triage adapter. It was built spec-first with Kiro — specs,
  steering docs, and a custom triage agent in `.kiro/`."

## 2:20–2:30 — Close
- **On screen:** dashboard + repo URL on screen.
- **Say:** "Chimera — four tools that don't belong together, one audit copilot.
  Links in the description."

## Shot checklist (record in this order)
1. [ ] Dashboard idle, address field empty
2. [ ] USDC analyze run, full findings list visible
3. [ ] Vault paste + analyze, reentrancy High + triage box visible
4. [ ] Severity filter click (High → All), export click + .md file open
5. [ ] Repo tree / `.kiro` + server terminal (2–3 second cuts)
6. [ ] Voiceover recorded clean (no background noise), captions optional

## Notes
- If AI triage is off during recording (no LLM key), say so on camera instead of
  faking it — the app shows "AI triage not configured" honestly.
- Keep the app URL out of the video (localhost only); the public deployment URL
  goes in the Devpost submission, not the recording.
- Upload as Public (not Unlisted) — Devpost requires a public YouTube link.
