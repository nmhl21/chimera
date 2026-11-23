// Chimera — zero-dependency HTTP server.
// Serves the dashboard and exposes POST /api/analyze.
// Run: node server.js  →  http://localhost:3000
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { analyze } from './lib/analyzer.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, 'public');
const PORT = process.env.PORT || 3000;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/analyze') {
      const body = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (c) => { data += c; if (data.length > 1_000_000) req.destroy(); });
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });
      let input;
      try { input = JSON.parse(body); } catch { return send(res, 400, { error: 'Invalid JSON body' }); }
      const result = await analyze(input);
      return send(res, result.error ? 400 : 200, result);
    }
    // Static files
    const urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    const file = path.join(PUBLIC, path.normalize(urlPath).replace(/^(\.\.[/\\])+/, ''));
    if (!file.startsWith(PUBLIC)) return send(res, 403, { error: 'Forbidden' });
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(content);
  } catch (err) {
    if (err.code === 'ENOENT') return send(res, 404, { error: 'Not found' });
    console.error(err);
    return send(res, 500, { error: 'Internal error' });
  }
});

function send(res, status, obj) {
  const body = typeof obj === 'string' ? obj : JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(body);
}

server.listen(PORT, () => console.log(`Chimera listening on http://localhost:${PORT}`));
