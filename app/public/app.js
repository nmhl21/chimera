// Chimera dashboard — calls POST /api/analyze and renders findings.
// M4: severity filter (client-side, no re-fetch), per-severity counts,
// severity summary line, error styling, Markdown export of ALL findings.
let lastResult = null;
let activeFilter = 'All';
const SEVERITIES = ['High', 'Medium', 'Low', 'Informational', 'Optimization'];

const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');
const filterRow = document.getElementById('filterRow');
const summaryEl = document.getElementById('severitySummary');
const exportBtn = document.getElementById('exportBtn');

document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const btn = document.getElementById('analyzeBtn');
  const address = document.getElementById('address').value.trim();
  const source = document.getElementById('source').value.trim();
  const chainId = Number(document.getElementById('chain').value);
  if (!address && !source) {
    statusEl.className = 'error';
    statusEl.textContent = 'Enter an address or paste source first.';
    return;
  }
  btn.disabled = true;
  statusEl.className = '';
  statusEl.textContent = 'Analyzing… (Slither + triage can take up to a minute)';
  summaryEl.textContent = '';
  resultsEl.innerHTML = '';
  exportBtn.hidden = true;
  filterRow.style.display = 'none';
  setFilter('All');
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: address || undefined, chainId, source: source || undefined }),
    });
    const data = await res.json();
    if (!res.ok) {
      statusEl.className = 'error';
      statusEl.textContent = `Error: ${data.error || res.status}`;
      return;
    }
    lastResult = data;
    statusEl.className = '';
    statusEl.textContent = `${data.findings.length} finding(s) for ${data.contract}` +
      (data.triageConfigured ? '' : ' — AI triage not configured, showing raw Slither output.');
    updateCounts(data.findings);
    summaryEl.textContent = severitySummary(data.findings);
    filterRow.style.display = 'flex';
    exportBtn.hidden = false;
    renderFindings();
  } catch (err) {
    statusEl.className = 'error';
    statusEl.textContent = `Request failed: ${err.message}`;
  } finally {
    btn.disabled = false;
  }
});

filterRow.addEventListener('click', (ev) => {
  const btn = ev.target.closest('.filter-btn');
  if (!btn) return;
  setFilter(btn.dataset.sev);
  renderFindings();
});

function setFilter(sev) {
  activeFilter = sev;
  for (const b of filterRow.querySelectorAll('.filter-btn')) {
    b.classList.toggle('active', b.dataset.sev === sev);
  }
}

function updateCounts(findings) {
  const counts = { All: findings.length };
  for (const s of SEVERITIES) counts[s] = 0;
  for (const f of findings) counts[f.severity] = (counts[f.severity] || 0) + 1;
  for (const [sev, n] of Object.entries(counts)) {
    const badge = document.getElementById(`badge-${sev}`);
    if (badge) badge.textContent = String(n);
  }
}

function severitySummary(findings) {
  const parts = SEVERITIES
    .map((s) => `${findings.filter((f) => f.severity === s).length} ${s}`)
    .filter((p) => !p.startsWith('0 '));
  return parts.length ? parts.join(' · ') : 'No findings — Slither reports this contract clean.';
}

function renderFindings() {
  if (!lastResult) return;
  const list = lastResult.findings.filter((f) => activeFilter === 'All' || f.severity === activeFilter);
  resultsEl.innerHTML = list.map((f) => `
    <div class="finding ${f.severity}">
      <h3>${escapeHtml(f.detector)} — ${f.severity} <span class="meta">(${f.confidence} confidence · ${escapeHtml(f.location)})</span></h3>
      <p>${escapeHtml(f.description)}</p>
      ${f.triage ? `<div class="triage"><strong>AI triage (${f.triage.severity}):</strong> ${escapeHtml(f.triage.explanation)}<br><strong>Fix:</strong> ${escapeHtml(f.triage.fix)}</div>` : ''}
    </div>`).join('') || '<p>No findings match this filter.</p>';
}

// Export exports ALL findings from the last analysis, not just the visible filter.
exportBtn.addEventListener('click', () => {
  if (!lastResult) return;
  const lines = [`# Chimera audit report — ${lastResult.contract}`, ''];
  for (const f of lastResult.findings) {
    lines.push(`## ${f.detector} (${f.severity}, ${f.confidence})`, '', f.description, '', `Location: ${f.location}`, '');
    if (f.triage) lines.push(`**AI triage (${f.triage.severity}):** ${f.triage.explanation}`, '', `**Fix:** ${f.triage.fix}`, '');
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'chimera-report.md';
  a.click();
});

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
