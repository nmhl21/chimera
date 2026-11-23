#!/bin/bash
# M3 live test — triage adapter against a local mock OpenAI endpoint, plus the
# graceful-failure path (LLM endpoint dead -> findings still returned, untriaged).
set -u
cd ~/workspace/kiroween || exit 1
pkill -f "node scripts/mock-llm.js" 2>/dev/null
pkill -f "node server.js" 2>/dev/null
sleep 1

VAULT='pragma solidity ^0.8.0;
contract Vault {
    mapping(address => uint256) public balances;
    function deposit() public payable { balances[msg.sender] += msg.value; }
    function withdraw() public {
        uint256 amount = balances[msg.sender];
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok);
        balances[msg.sender] = 0;
    }
}'
PAYLOAD=$(python3 -c "import json,sys; print(json.dumps({'source': sys.argv[1]}))" "$VAULT")

echo "=== M3a: mock LLM live ==="
node scripts/mock-llm.js > /tmp/mock-llm.log 2>&1 &
MOCK=$!
(cd app && LLM_API_KEY=mock-key LLM_BASE_URL=http://localhost:3101/v1 LLM_MODEL=free/deepseek-v4.1-flash PORT=3000 nohup node server.js > /tmp/chimera-m3.log 2>&1 &)
sleep 2
curl -s --max-time 180 -X POST http://localhost:3000/api/analyze \
  -H 'Content-Type: application/json' -d "$PAYLOAD" | python3 -c "
import json,sys
d=json.load(sys.stdin)
if 'error' in d: print('ERROR:', d['error']); sys.exit(1)
print('findings:', len(d['findings']), '| triageConfigured:', d['triageConfigured'])
triaged = sum(1 for f in d['findings'] if f.get('triage'))
print('triaged:', triaged, '/', len(d['findings']))
for f in d['findings']:
    t = f.get('triage') or {}
    print(' -', f['detector'], '|', f['severity'], '| triage:', t.get('severity'), '|', (t.get('explanation') or '')[:60])
"
kill $MOCK 2>/dev/null
pkill -f "node server.js" 2>/dev/null
sleep 1

echo "=== M3b: LLM endpoint dead (graceful fallback) ==="
(cd app && LLM_API_KEY=x LLM_BASE_URL=http://localhost:3999/v1 LLM_MODEL=free/deepseek-v4.1-flash PORT=3000 nohup node server.js > /tmp/chimera-m3b.log 2>&1 &)
sleep 2
curl -s --max-time 180 -X POST http://localhost:3000/api/analyze \
  -H 'Content-Type: application/json' -d "$PAYLOAD" | python3 -c "
import json,sys
d=json.load(sys.stdin)
if 'error' in d: print('ERROR:', d['error']); sys.exit(1)
print('findings:', len(d['findings']), '| triageConfigured:', d['triageConfigured'])
print('triaged:', sum(1 for f in d['findings'] if f.get('triage')), '(expect 0 — endpoint dead)')
print('first finding:', d['findings'][0]['detector'], '|', d['findings'][0]['severity'])
"
pkill -f "node server.js" 2>/dev/null
echo "servers stopped"
