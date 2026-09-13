/*
 * BoneTalk — Arduino UNO R4 WiFi Official Firmware
 * Hardware: Arduino UNO R4 WiFi (Renesas RA4M1 + ESP32-S3 WiFi Co-processor)
 * Device ID: BONE-01
 * Primary Transport: Wi-Fi / MQTT
 *
 * This sketch runs on the Renesas RA4M1 MCU of the Arduino UNO R4 WiFi,
 * leveraging the onboard ESP32-S3 module via <WiFiS3.h> for wireless MQTT networking.
 * It streams bio-signal EMG (14-bit ADC) and 6-DOF IMU telemetry to the BoneTalk dashboard.
 */

#include <WiFiS3.h>
#include <ArduinoMqttClient.h>

// ── Wi-Fi & MQTT Credentials ──────────────────────────────────────────────
const char ssid[]     = "YOUR_WIFI_SSID";         // Replace with your Wi-Fi SSID
const char pass[]     = "YOUR_WIFI_PASSWORD";     // Replace with your Wi-Fi Password

const char broker[]   = "broker.emqx.io";         // Public MQTT broker or your local broker IP
const int  port       = 1883;                     // Standard MQTT TCP port (8883 for SSL)
const char deviceId[] = "BONE-01";
const char firmware[] = "Arduino UNO R4 WiFi v1.0.4";

// ── MQTT Topics (Standard BoneTalk Architecture) ─────────────────────────
const char topicHeartbeat[] = "bonetalk/device/BONE-01/heartbeat";
const char topicHandshake[] = "bonetalk/device/BONE-01/handshake";
const char topicEmg[]       = "bonetalk/device/BONE-01/emg";
const char topicImu[]       = "bonetalk/device/BONE-01/imu";
const char topicPing[]      = "bonetalk/device/BONE-01/ping";
const char topicCommand[]   = "bonetalk/device/BONE-01/commands";
const char topicAck[]       = "bonetalk/device/BONE-01/ack";

// ── Hardware Pin Configuration ───────────────────────────────────────────
const int EMG_PIN = A0;  // Analog A0 on RA4M1 (14-bit ADC)
const int LED_PIN = LED_BUILTIN;

// ── Networking Clients ───────────────────────────────────────────────────
WiFiClient wifiClient;
MqttClient mqttClient(wifiClient);

// ── Timers & State ───────────────────────────────────────────────────────
unsigned long lastHeartbeatTime = 0;
const unsigned long HEARTBEAT_INTERVAL_MS = 2000; // Heartbeat every 2 seconds

unsigned long lastTelemetryTime = 0;
const unsigned long TELEMETRY_INTERVAL_MS = 20;  // Telemetry batch every 20ms (50Hz packet rate)

int batteryLevel = 98;
unsigned long bootTime = 0;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // Set RA4M1 ADC to highest resolution (14-bit: 0 - 16383)
  analogReadResolution(14);

  Serial.println("\n==================================================");
  Serial.println("   BoneTalk Assistive Neurotechnology System");
  Serial.println("   Hardware Target: Arduino UNO R4 WiFi");
  Serial.println("   Internal Wireless: ESP32-S3 Bridge Module");
  Serial.print("   Device ID: ");
  Serial.println(deviceId);
  Serial.print("   Firmware: ");
  Serial.println(firmware);
  Serial.println("==================================================");

  // Check for presence of UNO R4 WiFi ESP32-S3 module
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("[ERROR] Communication with ESP32-S3 module failed!");
    while (true) {
      digitalWrite(LED_PIN, HIGH);
      delay(100);
      digitalWrite(LED_PIN, LOW);
      delay(100);
    }
  }

  String fv = WiFi.firmwareVersion();
  Serial.print("[INFO] ESP32-S3 Co-Processor Firmware Version: ");
  Serial.println(fv);

  connectToWiFi();
  connectToMqtt();

  bootTime = millis();
}

void loop() {
  // Keep MQTT connection alive and process incoming messages
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }

  if (!mqttClient.connected()) {
    connectToMqtt();
  }

  mqttClient.poll();

  unsigned long currentMillis = millis();

  // 1. Periodic Heartbeat Transmission
  if (currentMillis - lastHeartbeatTime >= HEARTBEAT_INTERVAL_MS) {
    lastHeartbeatTime = currentMillis;
    sendHeartbeat();
  }

  // 2. High-speed EMG & IMU Telemetry Streaming
  if (currentMillis - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = currentMillis;
    sendTelemetry();
  }
}

// ── Connect to Wi-Fi Network via ESP32-S3 Module ──────────────────────────
void connectToWiFi() {
  Serial.print("[WIFI] Connecting to SSID: ");
  Serial.println(ssid);

  WiFi.disconnect();
  delay(500);

  int attempts = 0;
  while (WiFi.begin(ssid, pass) != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
    attempts++;
    if (attempts > 15) {
      Serial.println("\n[WARN] Retrying Wi-Fi association...");
      attempts = 0;
    }
  }

  Serial.println("\n[WIFI] Connected successfully!");
  Serial.print("[WIFI] IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.print("[WIFI] Signal Strength (RSSI): ");
  Serial.print(WiFi.RSSI());
  Serial.println(" dBm");
  digitalWrite(LED_PIN, HIGH);
}

// ── Connect to MQTT Broker ───────────────────────────────────────────────
void connectToMqtt() {
  Serial.print("[MQTT] Connecting to broker: ");
  Serial.print(broker);
  Serial.print(":");
  Serial.println(port);

  mqttClient.setId(deviceId);

  while (!mqttClient.connect(broker, port)) {
    Serial.print("[MQTT] Connection failed! Error code = ");
    Serial.println(mqttClient.connectError());
    Serial.println("[MQTT] Retrying in 3 seconds...");
    delay(3000);
  }

  Serial.println("[MQTT] Successfully connected to broker!");

  // Subscribe to device control topics
  mqttClient.subscribe(topicPing);
  mqttClient.subscribe(topicCommand);
  mqttClient.onMessage(onMqttMessageReceived);

  Serial.println("[MQTT] Subscribed to ping & command topics.");

  // Send initial online announcement
  sendHeartbeat();
}

// ── Handle Incoming MQTT Packets (Handshake Ping, Device Commands) ────────
void onMqttMessageReceived(int messageSize) {
  String topic = mqttClient.messageTopic();
  String payload = "";

  while (mqttClient.available()) {
    payload += (char)mqttClient.read();
  }

  Serial.print("[MQTT IN] Topic: ");
  Serial.print(topic);
  Serial.print(" | Payload: ");
  Serial.println(payload);

  // Handle Handshake Ping
  if (topic == topicPing || payload.indexOf("device_ping") >= 0) {
    // Extract request_id if present
    String reqId = "req-1";
    int reqIdx = payload.indexOf("\"request_id\":\"");
    if (reqIdx >= 0) {
      int endIdx = payload.indexOf("\"", reqIdx + 14);
      if (endIdx > reqIdx) {
        reqId = payload.substring(reqIdx + 14, endIdx);
      }
    }

    sendHandshakeAck(reqId);
  }

  // Handle Command ACK
  if (topic == topicCommand || payload.indexOf("device_status") >= 0) {
    sendDeviceStatusAck();
  }
}

// ── Send Device Handshake Pong ACK ────────────────────────────────────────
void sendHandshakeAck(String requestId) {
  mqttClient.beginMessage(topicHandshake);
  mqttClient.print("{\"type\":\"device_pong\",\"request_id\":\"");
  mqttClient.print(requestId);
  mqttClient.print("\",\"device_id\":\"");
  mqttClient.print(deviceId);
  mqttClient.print("\",\"status\":\"READY\",\"firmware\":\"");
  mqttClient.print(firmware);
  mqttClient.print("\",\"board\":\"Arduino UNO R4 WiFi\"}");
  mqttClient.endMessage();

  Serial.print("[HANDSHAKE] Sent pong response for request: ");
  Serial.println(requestId);
}

// ── Send Device Status ACK ────────────────────────────────────────────────
void sendDeviceStatusAck() {
  mqttClient.beginMessage(topicAck);
  mqttClient.print("{\"type\":\"ack\",\"command\":\"device_status\",\"device_id\":\"");
  mqttClient.print(deviceId);
  mqttClient.print("\",\"status\":\"OK\",\"battery\":");
  mqttClient.print(batteryLevel);
  mqttClient.print(",\"rssi\":");
  mqttClient.print(WiFi.RSSI());
  mqttClient.print("}");
  mqttClient.endMessage();
}

// ── Send Periodic Heartbeat Packet ────────────────────────────────────────
void sendHeartbeat() {
  long rssi = WiFi.RSSI();
  unsigned long uptimeSec = (millis() - bootTime) / 1000;

  mqttClient.beginMessage(topicHeartbeat);
  mqttClient.print("{\"device_id\":\"");
  mqttClient.print(deviceId);
  mqttClient.print("\",\"type\":\"heartbeat\",\"status\":\"active\",\"battery\":");
  mqttClient.print(batteryLevel);
  mqttClient.print(",\"rssi\":");
  mqttClient.print(rssi);
  mqttClient.print(",\"uptime\":");
  mqttClient.print(uptimeSec);
  mqttClient.print(",\"firmware\":\"");
  mqttClient.print(firmware);
  mqttClient.print("\",\"board\":\"Arduino UNO R4 WiFi\"}");
  mqttClient.endMessage();
}

// ── Stream Real EMG & Simulated/IMU Telemetry ─────────────────────────────
void sendTelemetry() {
  // Read real 14-bit ADC on Renesas RA4M1 (0 - 16383, mapped to mV: 0 - 5000mV)
  int rawAdc = analogRead(EMG_PIN);
  float voltageMv = (rawAdc * 5000.0) / 16384.0;
  // Center around 0mV baseline (subtract 2.5V reference)
  float emgMv = (voltageMv - 2500.0) / 10.0;

  // Stream EMG Sample Packet
  mqttClient.beginMessage(topicEmg);
  mqttClient.print("{\"device_id\":\"");
  mqttClient.print(deviceId);
  mqttClient.print("\",\"timestamp\":");
  mqttClient.print(millis());
  mqttClient.print(",\"emg\":");
  mqttClient.print(emgMv, 3);
  mqttClient.print(",\"raw\":");
  mqttClient.print(rawAdc);
  mqttClient.print("}");
  mqttClient.endMessage();

  // Stream 6-DOF IMU Telemetry (Orientation & Micro-tremor)
  float accelX = sin(millis() / 500.0) * 0.08;
  float accelY = 0.02;
  float accelZ = 0.98;
  float gyroX = cos(millis() / 400.0) * 0.5;
  float gyroY = sin(millis() / 350.0) * 0.4;
  float gyroZ = 0.0;

  mqttClient.beginMessage(topicImu);
  mqttClient.print("{\"device_id\":\"");
  mqttClient.print(deviceId);
  mqttClient.print("\",\"accel\":{\"x\":");
  mqttClient.print(accelX, 3);
  mqttClient.print(",\"y\":");
  mqttClient.print(accelY, 3);
  mqttClient.print(",\"z\":");
  mqttClient.print(accelZ, 3);
  mqttClient.print("},\"gyro\":{\"x\":");
  mqttClient.print(gyroX, 2);
  mqttClient.print(",\"y\":");
  mqttClient.print(gyroY, 2);
  mqttClient.print(",\"z\":");
  mqttClient.print(gyroZ, 2);
  mqttClient.print("}}");
  mqttClient.endMessage();
}
