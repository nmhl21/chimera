// Chimera analyzer — Sourcify fetch + Slither subprocess + LLM triage adapter.
// Input: { address?, chainId?, source? }  (address XOR source)
// Output: { contract, chainId, findings: [...], triageConfigured: bool } or { error }
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const CHAINS = { 1: 'Ethereum', 56: 'BSC', 42161: 'Arbitrum', 10: 'Optimism' };
const SLITHER = process.env.SLITHER_BIN || '/home/hatch/workspace/bug-bounty/audit-venv/bin/slither';
const SVM_DIR = '/home/hatch/.svm';
const TIMEOUT_MS = 15_000;

// Slither needs a solc binary; this VM keeps them under ~/.svm/<version>/solc-<version>.
// Prefer the exact compiler version from Sourcify metadata when installed,
// else the newest installed version satisfying the pragma, else newest available.
import { readdir } from 'node:fs/promises';
async function resolveSolc(code, exactVersion = null) {
  const pragma = code.match(/pragma\s+solidity\s*[^;]*?(\d+\.\d+\.\d+)/)?.[1];
  try {
    const versions = (await readdir(SVM_DIR)).filter((v) => /^\d+\.\d+\.\d+$/.test(v)).sort();
    if (!versions.length) return null;
    if (exactVersion && versions.includes(exactVersion)) return `${SVM_DIR}/${exactVersion}/solc-${exactVersion}`;
    if (pragma && versions.includes(pragma)) return `${SVM_DIR}/${pragma}/solc-${pragma}`;
    const [major, minor] = pragma ? pragma.split('.').map(Number) : [0, 8];
    const compatible = versions.filter((v) => {
      const [ma, mi] = v.split('.').map(Number);
      return ma === major && mi >= minor;
    });
    const pick = compatible[0] || versions[versions.length - 1];
    return `${SVM_DIR}/${pick}/solc-${pick}`;
  } catch { return null; }
}

export async function analyze({ address, chainId = 1, source }) {
  let files;
  let entry;
  let solcVersion = null;
  let contractName = 'pasted source';
  if (address) {
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) return { error: 'Invalid address' };
    if (!CHAINS[chainId]) return { error: `Unsupported chainId ${chainId}` };
    const fetched = await fetchSource(address, chainId);
    if (fetched.error) return fetched;
    files = fetched.files;
    entry = fetched.entry;
    solcVersion = fetched.solcVersion;
    contractName = `${address} (${CHAINS[chainId]})`;
  } else {
    if (!source || !source.trim()) return { error: 'No Solidity source to analyze' };
    files = { 'Target.sol': source };
    entry = 'Target.sol';
  }

  const findings = await runSlither(files, entry, solcVersion);
  if (findings.error) return findings;

  const triageConfigured = Boolean(process.env.LLM_API_KEY && process.env.LLM_BASE_URL);
  if (triageConfigured) {
    await triageFindings(findings.list);
  }
  return { contract: contractName, chainId, findings: findings.list, triageConfigured };
}

// Sourcify v2: GET /v2/contract/{chainId}/{address} returns only match metadata
// by default — source files need ?fields=sources,metadata (stdJson is NOT a
// valid field on this server version; /std-json and /files sub-routes 404).
// Response shape: { sources: { "path.sol": { content } }, metadata: { compiler: { version } } }
// Address must be lowercased — the server rejects some EIP-55 checksums (400).
async function fetchSource(address, chainId) {
  const url = `https://sourcify.dev/server/v2/contract/${chainId}/${address.toLowerCase()}?fields=sources,metadata`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (res.status === 404) return { error: 'Contract source not verified on Sourcify for this chain' };
    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try { const e = await res.json(); if (e.message) detail += ` — ${e.message}`; } catch {}
      return { error: `Sourcify request failed (${detail})` };
    }
    const data = await res.json();
    const sources = data?.sources || {};
    const entries = Object.entries(sources).filter(([p, f]) => p.endsWith('.sol') && typeof f?.content === 'string' && f.content.trim());
    if (!entries.length) return { error: 'Sourcify returned no Solidity source content' };
    // Sanitize paths (no absolute paths, no .. escapes) and keep relative layout.
    const files = {};
    for (const [p, f] of entries) {
      const clean = p.replace(/^\/+/, '').split('/').filter((seg) => seg && seg !== '.' && seg !== '..').join('/');
      if (clean) files[clean] = f.content;
    }
    if (!Object.keys(files).length) return { error: 'Sourcify returned no usable source files' };
    const entry = pickEntry(files);
    const solcVersion = data?.metadata?.compiler?.version?.match(/(\d+\.\d+\.\d+)/)?.[1] || null;
    return { files, entry, solcVersion };
  } catch (err) {
    return { error: `Sourcify fetch failed: ${err.message}` };
  }
}

// Entry file: the import-graph root — a file no other source file imports
// (the deployed contract; its dependencies are imported by it, not vice versa).
// Among roots, take the largest. Fall back to the largest file overall.
function pickEntry(files) {
  const paths = Object.keys(files);
  const imported = new Set();
  const importRe = /import\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g;
  for (const [p, content] of Object.entries(files)) {
    const dir = p.split('/').slice(0, -1);
    for (const m of content.matchAll(importRe)) {
      const target = m[1];
      // Relative imports resolve from the importing file's dir; bare imports
      // (@openzeppelin/…) resolve from the fetched tree root.
      const base = target.startsWith('.') ? dir : [];
      const parts = [...base, ...target.split('/')];
      const resolved = [];
      for (const seg of parts) {
        if (seg === '.' || seg === '') continue;
        if (seg === '..') resolved.pop();
        else resolved.push(seg);
      }
      const hit = resolved.join('/');
      if (files[hit]) imported.add(hit);
    }
  }
  const roots = paths.filter((p) => !imported.has(p));
  const pool = roots.length ? roots : paths;
  return pool.reduce((best, p) => (files[p].length > files[best].length ? p : best), pool[0]);
}

function runSlither(files, entry, solcVersion) {
  return new Promise(async (resolve) => {
    let dir;
    try {
      dir = await mkdtemp(path.join(tmpdir(), 'chimera-'));
      for (const [rel, content] of Object.entries(files)) {
        const file = path.join(dir, rel);
        await mkdir(path.dirname(file), { recursive: true });
        await writeFile(file, content);
      }
      const entryPath = path.join(dir, entry);
      const mainCode = files[entry] || '';
      const solc = await resolveSolc(mainCode, solcVersion);
      const args = solc ? [entryPath, '--solc', solc, '--json', '-'] : [entryPath, '--json', '-'];
      // Run with cwd = temp dir so bare imports (@openzeppelin/…) resolve
      // against the fetched tree root.
      execFile(SLITHER, args, { cwd: dir, timeout: 120_000, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
        rm(dir, { recursive: true, force: true }).catch(() => {});
        // Slither exits non-zero when findings exist; stdout still carries JSON.
        let parsed;
        try { parsed = JSON.parse(stdout); } catch {
          const why = (stderr || '').trim().split('\n').slice(-3).join(' ') || (err && err.message) || 'unknown error';
          return resolve({ error: `Slither failed: ${why}` });
        }
        const detectors = parsed?.results?.detectors || [];
        const list = detectors.map((d) => ({
          detector: d.check,
          severity: capitalize(d.impact || 'Informational'),
          confidence: capitalize(d.confidence || 'Medium'),
          description: d.description,
          location: firstLocation(d),
          triage: null,
        }));
        resolve({ list });
      });
    } catch (err) {
      if (dir) await rm(dir, { recursive: true, force: true }).catch(() => {});
      resolve({ error: `Analyzer failed: ${err.message}` });
    }
  });
}

async function triageFindings(list) {
  // One batched LLM call: severity / plain-language explanation / fix per finding.
  const prompt = `You are a smart-contract audit triage agent. For each Slither finding below, reply with a JSON array of objects {index, severity, explanation, fix}. Keep each explanation to 2 sentences max, in plain language.\n\n${list.map((f, i) => `[${i}] ${f.detector} (${f.severity}/${f.confidence}) — ${f.description} @ ${f.location}`).join('\n')}`;
  try {
    const res = await fetch(`${process.env.LLM_BASE_URL.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.LLM_API_KEY}` },
      body: JSON.stringify({
        // APInex has no gpt-4o-mini; default to a free model there.
        model: process.env.LLM_MODEL || (process.env.LLM_BASE_URL.includes('apinex') ? 'free/deepseek-v4.1-flash' : 'gpt-4o-mini'),
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) return; // leave findings untriaged; UI shows the note
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || '';
    // Models often wrap the array in a ```json fence; slice from the first
    // '[' to the last ']' so trailing fences do not break the parse.
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']');
    if (jsonStart < 0 || jsonEnd <= jsonStart) return;
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    for (const item of parsed) {
      const f = list[item.index];
      if (f) f.triage = { severity: item.severity, explanation: item.explanation, fix: item.fix };
    }
  } catch { /* leave findings untriaged */ }
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }
function firstLocation(d) {
  const el = d?.elements?.[0];
  if (!el) return 'unknown';
  const raw = el.source_mapping?.filename_relative || el.source_mapping?.filename || '';
  const src = raw.split('/').pop(); // strip temp-dir prefix, show Target.sol
  const lines = el.source_mapping?.lines || [];
  return src ? `${src}:${lines[0] ?? '?'}` : 'unknown';
}
