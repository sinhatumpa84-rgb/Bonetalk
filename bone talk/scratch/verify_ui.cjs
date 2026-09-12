const fs = require('fs');

async function verifyUI() {
  const list = await fetch('http://127.0.0.1:9222/json/list').then(r => r.json());
  let target = list.find(p => p.type === 'page' && p.url.includes('localhost:5173/model-control'));
  if (!target) {
    target = list.find(p => p.type === 'page' && p.url.includes('localhost:5173'));
  }
  if (!target) {
    console.error('No localhost page found');
    return;
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
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

  // Set viewport
  await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 850, deviceScaleFactor: 1, mobile: false });

  // Navigate to model-control
  await send('Runtime.evaluate', { expression: 'location.href = "http://localhost:5173/model-control";' });
  await new Promise(r => setTimeout(r, 2000));

  // Capture screenshot of model-control with offline indicator
  const snap1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/sinha/.gemini/antigravity-ide/brain/88aa0799-18cf-401d-b43b-fa770c05222f/model_control_offline.png', Buffer.from(snap1.data, 'base64'));
  console.log('Saved model_control_offline.png');

  // Click the indicator button to open diagnostics popover
  await send('Runtime.evaluate', {
    expression: `
      const btn = document.querySelector('[data-testid="realtime-status-pill"], button:has(.lucide-wifi), button:has(.lucide-radio)');
      if (btn) btn.click();
    `
  });
  await new Promise(r => setTimeout(r, 600));

  const snap2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/sinha/.gemini/antigravity-ide/brain/88aa0799-18cf-401d-b43b-fa770c05222f/model_control_popover.png', Buffer.from(snap2.data, 'base64'));
  console.log('Saved model_control_popover.png');

  // Navigate to home /
  await send('Runtime.evaluate', { expression: 'location.href = "http://localhost:5173/";' });
  await new Promise(r => setTimeout(r, 1500));

  const snap3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/sinha/.gemini/antigravity-ide/brain/88aa0799-18cf-401d-b43b-fa770c05222f/homepage_indicator.png', Buffer.from(snap3.data, 'base64'));
  console.log('Saved homepage_indicator.png');

  ws.close();
}

verifyUI().catch(console.error);
