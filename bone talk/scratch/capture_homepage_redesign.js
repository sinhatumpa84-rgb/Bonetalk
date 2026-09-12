import fs from 'fs';

async function run() {
  const list = await fetch('http://127.0.0.1:9222/json/list').then(r => r.json());
  let page = list.find(p => p.type === 'page' && p.url.includes('localhost:5173/experience'));
  if (!page) {
    page = list.find(p => p.type === 'page' && p.url.includes('localhost:5173'));
  }
  if (!page) {
    console.error('No localhost page found');
    return;
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise(r => ws.onopen = r);

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const reqId = id++;
      pending.set(reqId, { resolve, reject });
      ws.send(JSON.stringify({ id: reqId, method, params }));
    });
  }

  // Navigate to /
  console.log('Navigating to http://localhost:5173/ ...');
  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Desktop 1440px - Dark Mode
  console.log('Setting viewport 1440x900 (dark)...');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Runtime.evaluate', {
    expression: `
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('bonetalk-theme', 'dark');
      window.scrollTo(0, 0);
    `
  });
  await new Promise(r => setTimeout(r, 800));

  let snap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/sinha/.gemini/antigravity-ide/brain/88aa0799-18cf-401d-b43b-fa770c05222f/homepage_dark_1440.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved homepage_dark_1440.png');

  // 2. Desktop 1440px - Light Mode
  console.log('Switching to Light Mode...');
  await send('Runtime.evaluate', {
    expression: `
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('bonetalk-theme', 'light');
      window.scrollTo(0, 0);
    `
  });
  await new Promise(r => setTimeout(r, 800));

  snap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/sinha/.gemini/antigravity-ide/brain/88aa0799-18cf-401d-b43b-fa770c05222f/homepage_light_1440.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved homepage_light_1440.png');

  // 3. Tablet 1024px
  console.log('Setting viewport 1024x800...');
  await send('Emulation.setDeviceMetricsOverride', { width: 1024, height: 800, deviceScaleFactor: 1, mobile: false });
  await new Promise(r => setTimeout(r, 600));

  snap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/sinha/.gemini/antigravity-ide/brain/88aa0799-18cf-401d-b43b-fa770c05222f/homepage_tablet_1024.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved homepage_tablet_1024.png');

  // 4. Mobile 390px - Closed
  console.log('Setting viewport 390x844 (mobile)...');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await new Promise(r => setTimeout(r, 600));

  snap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/sinha/.gemini/antigravity-ide/brain/88aa0799-18cf-401d-b43b-fa770c05222f/homepage_mobile_closed.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved homepage_mobile_closed.png');

  // 5. Mobile 390px - Drawer Opened
  console.log('Opening mobile menu drawer...');
  await send('Runtime.evaluate', {
    expression: `
      const btn = document.querySelector('button[aria-label="Open menu"]');
      if (btn) btn.click();
    `
  });
  await new Promise(r => setTimeout(r, 600));

  snap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/sinha/.gemini/antigravity-ide/brain/88aa0799-18cf-401d-b43b-fa770c05222f/homepage_mobile_drawer.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved homepage_mobile_drawer.png');

  ws.close();
  console.log('Verification captures complete!');
}

run().catch(console.error);
