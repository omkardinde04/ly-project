/**
 * Real Chrome Browser E2E Test Suite for NeuroBridge Chrome Extension
 * 
 * Uses Chrome DevTools Protocol (CDP) to drive actual Google Chrome
 * with the unpacked extension loaded.
 */

const { spawn } = require('child_process');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Simple CDP client over native Node WebSocket
class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.pending = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression, awaitPromise = true) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text || res.exceptionDetails.exception?.description || 'Evaluation error');
    }
    return res.result?.value;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runBrowserTests() {
  console.log('================================================================');
  console.log('   STARTING ACTUAL CHROME BROWSER E2E TESTS (CHROME 156)');
  console.log('================================================================\n');

  const profileDir = '/tmp/chrome-nb-real-test';
  fs.rmSync(profileDir, { recursive: true, force: true });
  fs.mkdirSync(profileDir, { recursive: true });

  const extDir = '/Users/omkardinde/Downloads/neurobridge-extension-main';

  // 1. Launch Chrome with unpacked extension
  console.log('[Step 1] Launching Google Chrome binary with unpacked extension...');
  const chromeProcess = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--remote-debugging-port=9222',
    `--user-data-dir=${profileDir}`,
    `--load-extension=${extDir}`,
    '--no-first-run',
    '--no-default-browser-check'
  ], { stdio: 'ignore' });

  await sleep(3000);

  try {
    // 2. Open website tab to awaken content script and service worker
    console.log('[Step 2] Opening website (https://ly-project-nine.vercel.app/) in Chrome...');
    const newTabRes = await fetch('http://127.0.0.1:9222/json/new?https://ly-project-nine.vercel.app/', { method: 'PUT' });
    const newTabData = await newTabRes.json();
    await sleep(4000); // Allow content scripts to inject and awaken service worker

    // Query targets to find both the page and the extension service worker
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const targets = await listRes.json();

    const swTarget = targets.find(t => t.type === 'service_worker' && t.url.includes('background.js'));
    if (!swTarget) {
      console.log('Available targets:', targets.map(t => ({ type: t.type, url: t.url, title: t.title })));
      throw new Error('Service Worker for NeuroBridge extension not found in Chrome targets!');
    }
    console.log('[Step 2 Result] Service worker started:');
    console.log('               - URL:', swTarget.url);
    console.log('               - Target ID:', swTarget.id);

    // Connect to Service Worker via CDP
    const swClient = new CDPClient(swTarget.webSocketDebuggerUrl);
    await swClient.connect();
    console.log('[Step 2] Connected to Extension Service Worker via CDP.');

    // Connect to Webpage tab via CDP
    const pageClient = new CDPClient(newTabData.webSocketDebuggerUrl);
    await pageClient.connect();
    console.log('[Step 3] Connected to Webpage tab via CDP.');

    // 4. Verify extension detection on the webpage
    console.log('\n[Step 4] Checking extension detection in DOM (content/bridge.js)...');
    const extVersionOnPage = await pageClient.evaluate(`document.documentElement.dataset.neurobridgeExtension`);
    console.log('[Step 4 Result] documentElement.dataset.neurobridgeExtension:', extVersionOnPage);
    if (!extVersionOnPage) {
      throw new Error('Extension DOM marker was not set by content/bridge.js on production website!');
    }

    // 5. Send assessment profile from page to extension via window.postMessage
    console.log('\n[Step 5 & 6] Transferring assessment reading profile via bridge...');
    const syncResult = await pageClient.evaluate(`
      new Promise((resolve) => {
        let done = false;
        const handleApplied = (e) => {
          if (e.data && e.data.type === 'NEUROBRIDGE_APPLIED') {
            done = true;
            window.removeEventListener('message', handleApplied);
            resolve({ ok: true, label: e.data.label, level: e.data.level, enabled: e.data.enabled });
          }
        };
        window.addEventListener('message', handleApplied);

        window.postMessage({
          type: 'NEUROBRIDGE_RESULT',
          result: {
            severity: 50,
            letterConfusion: 60,
            crowding: 55,
            tracking: 45,
            visualStress: 25,
            accuracy: 65
          }
        }, window.location.origin);

        setTimeout(() => {
          if (!done) {
            window.removeEventListener('message', handleApplied);
            resolve({ ok: false, error: 'Timeout waiting for NEUROBRIDGE_APPLIED' });
          }
        }, 3000);
      });
    `);

    console.log('[Step 6 Result] Profile sync acknowledgment:', syncResult);
    if (!syncResult.ok) {
      throw new Error('Profile transfer failed: ' + syncResult.error);
    }

    // 7 & 8. Verify Extension Storage inside the real Service Worker
    console.log('\n[Step 7 & 8] Inspecting Chrome Storage inside Extension Service Worker...');
    const localData = await swClient.evaluate(`
      new Promise(r => chrome.storage.local.get(null, r))
    `);
    const syncData = await swClient.evaluate(`
      new Promise(r => chrome.storage.sync.get(null, r))
    `);

    console.log('         - chrome.storage.local assessmentDone:', localData.assessmentDone);
    console.log('         - chrome.storage.local profile label:', localData.profile?.label);
    console.log('         - chrome.storage.sync font:', syncData.font);
    console.log('         - chrome.storage.sync fontSize:', syncData.fontSize);
    console.log('         - chrome.storage.sync letterSpacing:', syncData.letterSpacing);

    // 9. Confirm the extension remains OFF
    console.log('\n[Step 9] Confirming extension enabled state remains OFF...');
    console.log('         - chrome.storage.sync.enabled:', syncData.enabled);
    if (syncData.enabled !== false) {
      throw new Error('CRITICAL BUG: Extension was automatically turned ON upon receiving profile!');
    }
    console.log('[Step 9 PASS] Extension verified strictly OFF (enabled === false).');

    // 10. Switch ON and verify actual webpage typography changes
    console.log('\n[Step 10] Switching extension ON via storage and verifying webpage style changes...');
    await swClient.evaluate(`
      new Promise(r => chrome.storage.sync.set({ enabled: true }, r))
    `);
    await sleep(1000);

    const hasStyleWhenEnabled = await pageClient.evaluate(`
      !!document.getElementById('neurobridge-style')
    `);
    const styleContent = await pageClient.evaluate(`
      document.getElementById('neurobridge-style')?.textContent.slice(0, 200) || ''
    `);
    console.log('[Step 10 Result] Style tag #neurobridge-style present:', hasStyleWhenEnabled);
    console.log('                 Style excerpt:', styleContent.replace(/\\n/g, ' '));
    if (!hasStyleWhenEnabled) {
      throw new Error('display.js failed to inject #neurobridge-style when extension was switched ON!');
    }

    // 11. Switch OFF and verify original styles return
    console.log('\n[Step 11] Switching extension OFF and verifying styles are removed...');
    await swClient.evaluate(`
      new Promise(r => chrome.storage.sync.set({ enabled: false }, r))
    `);
    await sleep(1000);

    const hasStyleWhenDisabled = await pageClient.evaluate(`
      !!document.getElementById('neurobridge-style')
    `);
    console.log('[Step 11 Result] Style tag #neurobridge-style present after switch OFF:', hasStyleWhenDisabled);
    if (hasStyleWhenDisabled) {
      throw new Error('#neurobridge-style was NOT removed when extension was switched OFF!');
    }
    console.log('[Step 11 PASS] Original styles cleanly restored.');

    // 12. Reload webpage and check state
    console.log('\n[Step 12] Reloading webpage and checking persistence...');
    await pageClient.send('Page.reload');
    await sleep(3000);

    const reloadExtVersion = await pageClient.evaluate(`document.documentElement.dataset.neurobridgeExtension`);
    console.log('[Step 12 Result] Extension detected after reload:', reloadExtVersion);
    if (!reloadExtVersion) throw new Error('Extension detection failed after reload!');

    // Clean up
    pageClient.close();
    swClient.close();
    chromeProcess.kill();

    // 13. Restart Chrome and verify storage persistence
    console.log('\n[Step 13] Restarting Chrome with same user-data-dir to verify persistence...');
    const chromeProcess2 = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
      '--remote-debugging-port=9222',
      `--user-data-dir=${profileDir}`,
      `--load-extension=${extDir}`,
      '--no-first-run',
      '--no-default-browser-check'
    ], { stdio: 'ignore' });

    await sleep(3000);

    // Open tab to wake service worker
    await fetch('http://127.0.0.1:9222/json/new?https://ly-project-nine.vercel.app/', { method: 'PUT' });
    await sleep(3000);

    const listRes2 = await fetch('http://127.0.0.1:9222/json/list');
    const targets2 = await listRes2.json();
    const swTarget2 = targets2.find(t => t.type === 'service_worker' && t.url.includes('background.js'));
    const swClient2 = new CDPClient(swTarget2.webSocketDebuggerUrl);
    await swClient2.connect();

    const persistedLocal = await swClient2.evaluate(`new Promise(r => chrome.storage.local.get(null, r))`);
    const persistedSync = await swClient2.evaluate(`new Promise(r => chrome.storage.sync.get(null, r))`);

    console.log('[Step 13 Result] Persisted assessmentDone:', persistedLocal.assessmentDone);
    console.log('                  Persisted font:', persistedSync.font);
    console.log('                  Persisted enabled state:', persistedSync.enabled);

    if (!persistedLocal.assessmentDone || persistedSync.font !== 'opendyslexic') {
      throw new Error('Settings failed to persist across browser restart!');
    }

    swClient2.close();
    chromeProcess2.kill();

    console.log('\n================================================================');
    console.log('   ALL 13 ACTUAL CHROME BROWSER TESTS PASSED SUCCESSFULLY!      ');
    console.log('================================================================');

  } catch (err) {
    console.error('\n❌ BROWSER TEST FAILED:', err);
    chromeProcess.kill();
    process.exit(1);
  }
}

runBrowserTests();
