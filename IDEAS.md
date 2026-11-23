# Kiroween 2026 — Idea shortlist

Verified rules: 4 categories, judging = 5 criteria × 20% (Impact, Technological
Implementation, Design, Innovation, Presentation), submission = public GitHub repo +
`/.kiro` at root + working app URL + <3 min YouTube demo + Kiro-usage write-up.
New project 30 Oct–4 Dec 2026. Deadline Sat 5 Dec 2026, 06:00 WITA.

## 1. Chimera — Smart-Contract Audit Copilot ★ RECOMMENDED

- **Category:** Frankenstein
- **What:** paste a contract address or Solidity source → Slither static analysis +
  Sourcify on-chain fetch + LLM triage agent (severity, plain-language explanation,
  fix suggestion) → readable audit report in a web dashboard, exportable.
- **Why it wins:** his deepest skill is Solidity auditing, so the domain judgement is
  real, not faked. Frankenstein rewards unusual combinations, and this stitches four
  incompatible pieces (Python analyzer + LLM agent + live EVM data + web UI) into one
  tool. Real problem, real audience (devs/auditors), demonstrable end-to-end in a
  <3 min video. Strong Kiro story: specs, steering, custom triage agent, MCP-style
  tool wiring, hooks.
- **Risks:** crowded field (~16k entrants claimed, unverified); needs the LLM triage
  to actually add value over raw Slither output, or judges see a thin wrapper.

## 2. Agent-EVM Starter Kit

- **Category:** Skeleton Crew
- **What:** a lean, opinionated starter template for "AI agent + EVM dApp" (specs,
  steering, hooks, MCP wiring included), proven by building TWO distinct apps from
  it: (a) a bounty-triage dashboard, (b) a token-launch radar.
- **Why:** plays directly to the category brief and to Technological Implementation
  (the template IS the product). Reuses his make.fun experience.
- **Risks:** building two apps + a genuinely reusable template is the heaviest scope
  of the three; the template must be more than a scaffold or it scores low on Design.

## 3. DeadChain Revival

- **Category:** Resurrection
- **What:** resurrect abandoned/"dead" smart contracts — a tool that finds dead
  contracts holding stuck funds or dead token projects, diagnoses why they died,
  and drafts a revival plan (proxy upgrade path, rescue function, migration).
- **Why:** novel angle, and his Boba/Polygon hunt experience (stuck funds, bricked
  contracts) is directly relevant.
- **Risks:** "real problem, real audience" is harder to argue (most dead contracts
  are dead for good reasons); the revival-plan output risks reading as generic AI
  text rather than a working tool.

## Not pursued as a standalone idea

- **Costume Contest:** a spooky-UI wrapper around any of the above. Design-heavy
  judging and his design track record is unproven; better as a UI skin on the
  Frankenstein entry if time allows, not a category of its own.
