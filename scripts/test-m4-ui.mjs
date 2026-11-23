// M4 end-to-end UI test — Playwright headless shell against the live server.
// Covers: analyze render, severity badges, filter (High -> 1 visible), export
// downloads ALL findings, empty-input error styling. Test tooling only.
import { chromium } from '/home/hatch/workspace/makefun-token-radar/shot/node_modules/playwright-core/index.mjs';
import fs from 'node:fs';

const VAULT = `pragma solidity ^0.8.0;
contract Vault {
    mapping(address => uint256) public balances;
    function deposit() public payable { balances[msg.sender] += msg.value; }
    function withdraw() public {
        uint256 amount = balances[msg.sender];
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok);
        balances[msg.sender] = 0;
    }
}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
await page.fill('#source', VAULT);
await page.click('#analyzeBtn');
await page.waitForSelector('.finding', { timeout: 120000 });
const total = await page.locator('.finding').count();
const badgeAll = await page.textContent('#badge-All');
const badgeHigh = await page.textContent('#badge-High');
const summary = await page.textContent('#severitySummary');
console.log(`rendered: ${total} findings | badge All=${badgeAll} High=${badgeHigh} | summary: ${summary}`);

await page.click('.filter-btn[data-sev="High"]');
await page.waitForTimeout(300);
const highVisible = await page.locator('.finding:visible').count();
console.log(`after High filter: ${highVisible} visible (expect 1)`);
await page.click('.filter-btn[data-sev="All"]');
await page.waitForTimeout(300);
console.log(`after All filter: ${await page.locator('.finding:visible').count()} visible (expect 3)`);

// Export -> download, verify ALL findings are in the .md even while filtered.
await page.click('.filter-btn[data-sev="High"]');
await page.waitForTimeout(200);
const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
await page.click('#exportBtn');
const download = await downloadPromise;
const path = '/tmp/chimera-report-test.md';
await download.saveAs(path);
const md = fs.readFileSync(path, 'utf8');
console.log(`export file: ${md.split('\n').length} lines | has reentrancy-eth: ${md.includes('reentrancy-eth')} | has solc-version: ${md.includes('solc-version')} | has low-level-calls: ${md.includes('low-level-calls')}`);

// Error path: empty inputs -> red error status.
await page.fill('#source', '');
await page.fill('#address', '');
await page.click('#analyzeBtn');
await page.waitForTimeout(300);
const errClass = await page.getAttribute('#status', 'class');
const errText = await page.textContent('#status');
console.log(`empty-input error: class='${errClass}' text='${errText}'`);

console.log('page errors:', errors.length ? errors : 'none');
await browser.close();
console.log('M4 UI TEST DONE');
