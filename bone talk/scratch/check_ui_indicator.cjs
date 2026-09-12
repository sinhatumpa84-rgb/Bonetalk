const fs = require('fs');

async function test() {
  try {
    const list = await fetch('http://127.0.0.1:9222/json/list').then(r => r.json());
    console.log('Open browser targets:', list.map(t => ({ title: t.title, url: t.url })));
  } catch (e) {
    console.log('CDP not running or port not open:', e.message);
  }
}

test();
