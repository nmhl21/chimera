#!/bin/bash
# M2 live test — Sourcify address path on ETH/BSC/ARB/OP + error paths.
# Run from ~/workspace/kiroween. Starts the server, curls each case, stops it.
set -u
cd ~/workspace/kiroween/app || exit 1
PORT=3000
LOG=/tmp/chimera-m2.log
: > "$LOG"
pkill -f "node server.js" 2>/dev/null; sleep 1
PORT=$PORT nohup node server.js >> "$LOG" 2>&1 &
SRV=$!
sleep 2
if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/ | grep -q 200; then
  echo "SERVER FAILED TO START"; cat "$LOG"; kill $SRV 2>/dev/null; exit 1
fi
echo "server up (pid $SRV)"

run_case() {
  local name="$1"; local payload="$2"
  echo "=== $name ==="
  curl -s --max-time 180 -X POST http://localhost:$PORT/api/analyze \
    -H 'Content-Type: application/json' -d "$payload" | python3 -c "
import json,sys
d=json.load(sys.stdin)
if 'error' in d: print('ERROR:', d['error'])
else:
    print('contract:', d['contract'], '| findings:', len(d['findings']), '| triageConfigured:', d['triageConfigured'])
    for f in d['findings'][:12]:
        print('  -', f['detector'], '|', f['severity'], '/', f['confidence'], '|', f['location'])
"
  echo
}

# Real verified contracts (USDC proxy family — single/multi-file, pragma ^0.8/^0.6)
run_case "ETH USDC"   '{"address":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48","chainId":1}'
run_case "BSC USDC"   '{"address":"0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d","chainId":56}'
run_case "ARB USDC"   '{"address":"0xaf88d065e77c8cC2239327C5EDb3A432268e5831","chainId":42161}'
run_case "OP USDC"    '{"address":"0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85","chainId":10}'
# Bonus: canonical WETH9 (pragma ^0.4.18 — solc 0.4 not installed, expect failure or fallback)
run_case "ETH WETH9"  '{"address":"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2","chainId":1}'
# Error paths
run_case "BAD ADDRESS" '{"address":"0x123","chainId":1}'
run_case "UNVERIFIED (EOA)" '{"address":"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045","chainId":1}'

kill $SRV 2>/dev/null
echo "server stopped"
