// Mock OpenAI-compatible endpoint for testing the Chimera triage adapter.
// Returns a canned triage JSON for whatever findings the prompt contains.
// NOT part of the shipped app — test tooling only.
import { createServer } from 'node:http';

const PORT = 3101;
const server = createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/v1/chat/completions') {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => {
      const body = JSON.parse(data);
      const prompt = body.messages?.[0]?.content || '';
      const count = (prompt.match(/^\[\d+\]/gm) || []).length;
      const items = [];
      for (let i = 0; i < count; i++) {
        items.push({
          index: i,
          severity: 'High',
          explanation: `Mock triage for finding ${i}: this is a test explanation in plain language.`,
          fix: `Mock fix for finding ${i}: apply the checks-effects-interactions pattern.`,
        });
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        choices: [{ message: { content: JSON.stringify(items) } }],
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
      }));
    });
    return;
  }
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});
server.listen(PORT, () => console.log(`mock LLM on http://localhost:${PORT}`));
