# Product steering — Chimera

## What Chimera is
A smart-contract audit copilot. A developer or auditor pastes a contract address
(any EVM chain) or Solidity source, and Chimera returns a readable first-pass
audit report: static-analysis findings triaged by an AI agent into severity,
plain-language explanation, and a suggested fix.

## Who it is for
Solidity developers shipping contracts and auditors doing triage. They need a fast,
honest first pass — not a replacement for a full audit, and the product must never
claim otherwise.

## Non-goals
- Not a full audit replacement; findings are "leads to verify", never verdicts.
- No wallet connection, no transactions, no signing. Read-only analysis.
- No paywall. The app stays free for judging and afterwards.

## Tone of the product
Direct, technical, honest about uncertainty. A finding always shows its detector,
its confidence, and its location. If the AI triage is unavailable, say so —
never fake triage output.
