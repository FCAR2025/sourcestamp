// SourceStamp E2E: fixture page -> select -> Alt+S -> panel -> type case -> Enter -> storage readback via popup
import crypto from 'node:crypto';
import http from 'node:http';

const EXT_PATH = '/home/info/sourcestamp';
const DEBUG_PORT = 9351;
const FIXTURE_URL = 'http://127.0.0.1:8899/test/fixture.html';

const getJson = (url) => new Promise((res, rej) => {
  http.get(url, (r) => { let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => res(JSON.parse(d))); }).on('error', rej);
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { webSocketDebuggerUrl } = await getJson(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
const ws = new WebSocket(webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));

let msgId = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const id = ++msgId;
  pending.set(id, (m) => (m.error ? rej(new Error(method + ': ' + JSON.stringify(m.error))) : res(m.result)));
  ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
});

const openTab = async (url) => {
  const { targetId } = await send('Target.createTarget', { url });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Runtime.enable', {}, sessionId);
  await send('Page.enable', {}, sessionId);
  return { targetId, sessionId };
};
const evalJs = async (sessionId, expression, awaitPromise = false) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise }, sessionId);
  if (r.exceptionDetails) throw new Error('page eval: ' + JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  return r.result.value;
};

// 1. fixture tab
const loadResult = await send('Extensions.loadUnpacked', { path: EXT_PATH });
const EXT_ID = loadResult.id;
console.log('EXT_ID:', EXT_ID);
const page = (await openTab(FIXTURE_URL)).sessionId;
const pageTarget = (await send('Target.getTargets')).targetInfos.find((t) => t.url === FIXTURE_URL)?.targetId;
await sleep(1500);

// 2. select the surplus table cell text
const selected = await evalJs(page, `(() => {
  const td = document.querySelector('table tr td');
  if (!td) return null;
  const r = document.createRange(); r.selectNodeContents(td);
  const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  return s.toString();
})()`);
console.log('SELECTED:', JSON.stringify(selected));

// 3. fire Alt+S keydown (content-script listener path)
const globals = await evalJs(page, "typeof SourceStampCaptureUI + ' | ' + typeof SourceStampReceipt + ' | table:' + !!document.querySelector('table')");
console.log('GLOBALS:', globals);
await evalJs(page, `document.dispatchEvent(new KeyboardEvent('keydown', {altKey:true, code:'KeyS', key:'s', bubbles:true, cancelable:true})), 'fired'`);
await sleep(700);
const hostFound = await evalJs(page, `!!document.querySelector('sourcestamp-capture-panel')`);
console.log('PANEL_HOST:', hostFound);
if (!hostFound) { console.log('E2E FAIL: capture panel did not open'); process.exit(1); }

// 4. activate tab, screenshot panel, click into input area, type, Enter
if (pageTarget) await send('Target.activateTarget', { targetId: pageTarget });
await sleep(300);
const hostRect = await evalJs(page, `JSON.parse(JSON.stringify(document.querySelector('sourcestamp-capture-panel').getBoundingClientRect()))`);
console.log('HOST_RECT:', JSON.stringify(hostRect));
const shot = await send('Page.captureScreenshot', { format: 'png' }, page);
await import('node:fs').then((fs) => fs.writeFileSync('/tmp/ss-panel.png', Buffer.from(shot.data, 'base64')));
// click the "New case label" label area (focuses input via for=), ~75% down the panel
const clickAt = async (x, y) => {
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }, page);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 }, page);
};
await clickAt(Math.round(hostRect.x + hostRect.width / 2), Math.round(hostRect.y + hostRect.height * 0.63));
await sleep(200);
const typeChar = async (ch) => {
  await send('Input.dispatchKeyEvent', { type: 'char', text: ch, key: ch }, page);
};
for (const ch of 'E2E Case') await typeChar(ch);
const shot2 = await send('Page.captureScreenshot', { format: 'png' }, page);
await import('node:fs').then((fs) => fs.writeFileSync('/tmp/ss-panel2.png', Buffer.from(shot2.data, 'base64')));
// click "Save receipt" (bottom-right of panel)
await clickAt(Math.round(hostRect.x + hostRect.width * 0.71), Math.round(hostRect.y + hostRect.height * 0.89));
await sleep(1000);
const panelGone = await evalJs(page, `!document.querySelector('sourcestamp-capture-panel')`);
console.log('PANEL_CLOSED_AFTER_SAVE:', panelGone);

// 5. readback via popup extension page
const pop = (await openTab(`chrome-extension://${EXT_ID}/popup/popup.html`)).sessionId;
await sleep(1200);
const stored = await evalJs(pop, `new Promise((res) => chrome.storage.local.get(null, res))`, true);
const keys = Object.keys(stored || {});
console.log('STORAGE_KEYS:', JSON.stringify(keys));
const receiptKey = keys.find((k) => k.startsWith('receipts:'));
const receipt = receiptKey ? stored[receiptKey][0] : null;
console.log('RECEIPT:', JSON.stringify(receipt, null, 1));

const ok = receipt && receipt.selection && receipt.url.includes('fixture.html') && receipt.page_title
  && receipt.captured_at && receipt.context && Array.isArray(receipt.table_row) && receipt.case_label === 'E2E Case'
  && receipt.fragment?.startsWith('#:~:text=') && receipt.table_row.includes('$42,500.00');
console.log(ok ? 'E2E PASS' : 'E2E FAIL: receipt fields incomplete');
process.exit(ok ? 0 : 1);
