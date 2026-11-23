# Kiroween 2026 — Build plan (Chimera, Frankenstein)

All times WITA (UTC+8). Submission deadline: **Sat 5 Dec 2026, 06:00 WITA**.
Winners announced ~Thu 4 Feb 2027, 01:00 WITA.

## User-side steps (only Nur can do these)

| # | Step | Deadline | Link / note |
|---|------|----------|-------------|
| 1 | Create a Devpost account + register for Kiroween | ASAP (reg closes 5 Dec 06:00 WITA) | https://kiroween.devpost.com/ |
| 2 | Request the 4,000 free Kiro credits via the Credit Request Form (Google Forms, linked on the rules page / Resources tab). Needs his Kiro user ID or AWS account ID. Allow 48 business hours for review. | **Wed 2 Dec 2026, 04:00 WITA** | https://kiroween.devpost.com/rules |
| 3 | One-time Kiro CLI login on this VM: `kiro-cli login --use-device-flow` (or `--social google`), complete auth on his phone. No AWS account needed; Google/GitHub/AWS Builder ID all work. | Before the Kiro-driven build session | binary: `/home/hatch/.local/bin/kiro-cli` (v3.5.0, verified working) |
| 4 | Create the public GitHub repo (nmhl21), MIT license, push this project. `/.kiro` must be committed — do NOT gitignore it. | Before submission | repo must be public + open source |
| 5 | Record the demo video (<3 min, public on YouTube, no copyrighted music) | Before 5 Dec 06:00 WITA | show the app working end-to-end |
| 6 | Submit on Devpost (repo link, app URL, video, Kiro-usage write-up) | **Sat 5 Dec 2026, 06:00 WITA** | keep the app live + free until judging ends (~30 Jan 2027) |

## Build milestones (agent-side, this VM)

- **M1 — Scaffold (19 Nov, done):** repo layout, `.kiro/` specs/steering/hooks,
  app skeleton (zero-dep Node server + UI), analyzer stub.
- **M2 — Analyzer wiring (19 Nov, done + verified live):** Slither JSON parsing
  (audit-venv has Slither 0.11.6), Sourcify source fetch by address, chain selector
  (ETH/BSC/ARB/OP), error paths. ETH USDC 18 findings, BSC USDC 27, ARB USDC 21,
  OP USDC 21, ETH WETH9 6. Fixes found live: Sourcify v2 needs
  `?fields=sources,metadata`; addresses lowercased; import-graph entry selection;
  exact solc from metadata (0.4.26 + 0.6.4 installed).
- **M3 — LLM triage adapter (19 Nov, done, mock-verified):** OpenAI-compatible call
  (APInex default), per-finding severity/explanation/fix, graceful fallback when no
  key is set. Verified 3/3 triaged against a mock endpoint + 0-triaged fallback on
  dead endpoint. **Live provider NOT verified:** APInex free 402 on 19 Nov (pool
  exhausted, resets 2026-11-20 00:00 UTC) — retry live after reset, never a paid key.
- **M4 — UI + export (19 Nov, done + verified in headless Chromium):** severity
  filter with count badges, severity summary, Markdown export (all findings),
  error styling, Optimization severity styling. Playwright test
  (scripts/test-m4-ui.mjs) passed: 3 findings, High filter → 1 visible,
  export .md contains all 3 detectors, zero page errors. Kiro CLI sessions
  attempted twice, both died on transient ServerConnectionResetError; the
  surviving index.html filter UI was kept, truncated app.js restored locally.
- **M5 — Repo prep (19 Nov, done):** README (status + honest Kiro-usage record),
  MIT LICENSE, `.gitignore` that does NOT ignore `.kiro` — all verified. Git repo
  creation + push is user-side. `.kiro/hooks/` format still unvalidated (needs a
  stable Kiro session).
- **M6 — Video + submission prep (script done 19 Nov):** demo script + shot list in
  [DEMO-SCRIPT.md](DEMO-SCRIPT.md) (<3 min). Recording + YouTube upload + Devpost
  submission are user-side / later.

## Notes / risks

- Kiro Free tier = 50 credits/month; the 4,000 hackathon credits are the usable
  pool — request them early (step 2), not at the deadline.
- RAM on this VM is tight (~430 MiB free at last check); keep agent sessions
  focused and avoid running Slither + Kiro + server all at once if memory strains.
- Judging is 5 criteria × 20%: Impact, Technological Implementation, Design,
  Innovation, Presentation. The write-up + video carry 40% of the score combined
  (Design + Presentation) — don't leave them to the last night.
- Bonus Blog Prize: top 100 scoring submissions with a public blog post get
  2,000 bonus Kiro credits × 100 winners (credits, not cash — nice-to-have only).
