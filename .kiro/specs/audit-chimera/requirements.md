# Requirements — Chimera (Kiroween 2026, Frankenstein)

## 1. Analyze by address
- User enters an EVM contract address + chain (Ethereum, BSC, Arbitrum, Optimism).
- The app fetches verified source from Sourcify; if unverified, it reports that
  clearly and offers bytecode-only analysis as a fallback note (not a silent fail).

## 2. Analyze pasted source
- User pastes Solidity source directly; the app analyzes it without any on-chain call.

## 3. Static analysis
- Slither runs against the source and returns structured detectors with severity,
  confidence, description, and file:line location. A Slither failure is surfaced
  as an error, never as an empty "clean" result.

## 4. AI triage
- Each finding gets an LLM triage: confirmed severity, plain-language explanation,
  suggested fix. If no LLM endpoint is configured, findings are shown untriaged
  with an explicit "AI triage not configured" note.

## 5. Report
- Results render as a readable dashboard (severity filter, finding detail) and
  export as Markdown.

## 6. Honesty + safety
- Read-only: no wallet, no transactions, no signing. No keys in logs or files.
- Every external call times out (15 s) with a clear error message.
