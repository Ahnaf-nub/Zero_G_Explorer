#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <BleGamepad.h>

Adafruit_MPU6050 mpu;
BleGamepad bleGamepad;

void setup() {
  Serial.begin(115200);
  bleGamepad.begin();
  Serial.println("BLE Gamepad initialized");
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1);
  }
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
}

void loop() {
  if (bleGamepad.isConnected()) {
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);

    // Calculate pitch angle (leaning)
    float pitch = atan2(a.acceleration.y, a.acceleration.z) * 180 / PI;

    Serial.print("Pitch angle: ");
    Serial.println(pitch);

    int16_t joystickY = (int16_t)pitch;
    bleGamepad.setAxes(0, joystickY, 0, 0, 0, 0);  // Set joystick Y-axis based on raw pitch value

    delay(100);
  }
}
