#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <WiFi.h>
#include <WebSocketsServer.h>

Adafruit_MPU6050 mpu;
WebSocketsServer webSocket = WebSocketsServer(81);

const char* ssid = "Mahir";
const char* password = "Ahnaf2007";

void setup() {
  Serial.begin(115200);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
  Serial.println(WiFi.localIP());  // Print the ESP32 IP address

  // Start WebSocket server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

  // Initialize MPU6050
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1)
      ;
  }
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
}

void loop() {
  webSocket.loop();

  // Read accelerometer and gyro data
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  // Calculate pitch angle (leaning forward/backward)
  float pitch = atan2(a.acceleration.y, a.acceleration.z) * 180 / PI;

  // Send pitch data via WebSocket
  String pitchData = String(pitch);
  webSocket.broadcastTXT(pitchData);

  delay(100);  // Send data every 100ms
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t* payload, size_t length) {
  // Handle WebSocket events
}
