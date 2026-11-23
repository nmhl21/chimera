# Structure steering — Chimera

```
kiroween/
├── README.md / IDEAS.md / PLAN.md / LICENSE / .gitignore
├── .kiro/
│   ├── steering/   # product, tech, structure (this file)
│   ├── specs/audit-chimera/   # requirements.md, design.md, tasks.md
│   └── hooks/      # agent hooks (on-save audit draft — validate format
│                   # against kiro-cli docs once logged in)
└── app/
    ├── package.json
    ├── server.js        # zero-dep HTTP server + /api/analyze
    ├── lib/analyzer.js  # Sourcify fetch + Slither subprocess + LLM triage
    └── public/          # index.html + app.js (dashboard UI)
```

## Rules
- `app/` has no npm dependencies; `node server.js` must just work.
- `.kiro/` is committed to git and NEVER gitignored (Kiroween rule).
- Specs are the source of truth for behavior; code changes follow tasks.md.
- Secrets live only in env vars, never in files.
