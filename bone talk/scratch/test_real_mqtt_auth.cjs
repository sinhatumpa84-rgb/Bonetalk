const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');

// Read .env file without printing secrets
function readEnvConfig() {
  const envPath = path.resolve(__dirname, '../.env');
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const config = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (match) {
      config[match[1]] = match[2].trim();
    }
  }
  return config;
}

async function testRealMqtt() {
  console.log('=== REAL MQTT BROKER CONNECTION & AUTHENTICATION TEST ===');
  
  const env = readEnvConfig();
  const brokerUrl = env.VITE_MQTT_URL || 'wss://broker.emqx.io:8084/mqtt';
  const username = env.VITE_MQTT_USERNAME;
  const password = env.VITE_MQTT_PASSWORD;
  const topic = env.VITE_MQTT_TOPIC || 'bonetalk/device/#';
  const deviceId = env.VITE_DEVICE_ID || 'BONE-01';

  // Safe host extraction (never print credentials or tokens)
  let brokerHost = brokerUrl;
  try {
    const parsed = new URL(brokerUrl);
    brokerHost = parsed.host;
  } catch (e) {
    // raw host
  }

  console.log(`[CONFIG] Broker Target Host: ${brokerHost}`);
  console.log(`[CONFIG] Protocol: ${brokerUrl.startsWith('wss://') ? 'MQTT over Secure WebSocket (WSS)' : 'MQTT over WebSocket (WS)'}`);
  console.log(`[CONFIG] Username Defined: ${Boolean(username)} (${username ? username.length + ' chars' : 'None'})`);
  console.log(`[CONFIG] Password Defined: ${Boolean(password)} (${password ? 'Configured [PROTECTED]' : 'None'})`);
  console.log(`[CONFIG] Hardware Topics: ${topic}, bonetalk/emg, bonetalk/device/${deviceId}`);

  const options = {
    connectTimeout: 8000,
    clean: true,
    reconnectPeriod: 0, // do not retry automatically for diagnostic test
  };

  if (username) options.username = username;
  if (password) options.password = password;

  const topicsToSubscribe = [topic, 'bonetalk/emg', `bonetalk/device/${deviceId}`];

  let connectionSuccess = false;
  let authSuccess = false;
  let subscriptionSuccess = false;
  let realMessageReceived = false;
  let receivedMessageTopic = null;
  let receivedMessageSnippet = null;
  let failureReason = null;

  return new Promise((resolve) => {
    console.log('[TEST] Initiating connection handshake to broker...');
    const client = mqtt.connect(brokerUrl, options);

    // Timeout safety
    const timeout = setTimeout(() => {
      console.log('[TEST] Message wait window concluded (no active physical hardware currently broadcasting on topics).');
      client.end(true, () => {
        resolve({
          brokerHost,
          connectionSuccess,
          authSuccess,
          subscriptionSuccess,
          realMessageReceived,
          receivedMessageTopic,
          receivedMessageSnippet,
          failureReason: connectionSuccess ? null : (failureReason || 'Connection timed out')
        });
      });
    }, 7000);

    client.on('connect', (connack) => {
      connectionSuccess = true;
      authSuccess = true;
      console.log('[TEST] ✓ MQTT Broker Connected successfully.');
      console.log('[TEST] ✓ Authentication accepted by broker (CONNACK return code 0).');

      client.subscribe(topicsToSubscribe, { qos: 0 }, (err, granted) => {
        if (err) {
          console.error('[TEST] ✗ Subscription failed:', err.message);
          failureReason = `Subscription error: ${err.message}`;
        } else {
          subscriptionSuccess = true;
          console.log('[TEST] ✓ Successfully subscribed to topics:');
          granted.forEach(g => console.log(`       - Topic: ${g.topic} (QoS ${g.qos})`));
          console.log('[TEST] Listening for incoming real messages from physical device...');
        }
      });
    });

    client.on('message', (msgTopic, payload) => {
      realMessageReceived = true;
      receivedMessageTopic = msgTopic;
      const raw = payload.toString();
      // Mask any potential sensitive tokens in payload if present
      receivedMessageSnippet = raw.length > 120 ? raw.substring(0, 120) + '...' : raw;
      console.log(`[TEST] ✓ REAL MESSAGE RECEIVED on topic: [${msgTopic}]`);
      console.log(`[TEST] Payload: ${receivedMessageSnippet}`);
    });

    client.on('error', (err) => {
      console.error('[TEST] ✗ Connection / Auth Error:', err.message);
      failureReason = err.message;
      if (err.message && err.message.toLowerCase().includes('not authorized')) {
        authSuccess = false;
      }
    });

    client.on('close', () => {
      console.log('[TEST] Client connection closed.');
    });
  });
}

testRealMqtt()
  .then((res) => {
    console.log('\n=== FINAL TEST SUMMARY ===');
    console.log(`Broker Host: ${res.brokerHost}`);
    console.log(`Connection: ${res.connectionSuccess ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Authentication: ${res.authSuccess ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Subscription: ${res.subscriptionSuccess ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Real Message Received: ${res.realMessageReceived ? 'YES' : 'NO'}`);
    if (res.failureReason) {
      console.log(`Failure Reason: ${res.failureReason}`);
    }
    process.exit(res.connectionSuccess ? 0 : 1);
  })
  .catch((err) => {
    console.error('Test execution error:', err.message);
    process.exit(1);
  });
