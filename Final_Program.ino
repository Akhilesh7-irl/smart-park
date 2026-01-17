#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>

// ================== WIFI + FIREBASE ==================

#define WIFI_SSID "iQOO Z6"
#define WIFI_PASSWORD "123456789"

#define FIREBASE_HOST "smart-parking-8ad9c-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "FCl2JmyluI57soynwvX0sDTeTBpLqJ0sH5aVx4th"

// ================== SENSOR PINS ==================

#define TRIG_PIN D1
#define ECHO_PIN D2

FirebaseData firebaseData;

// ================== SETUP ==================

void setup() {
  Serial.begin(9600);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }

  Serial.println("\nWiFi Connected");

  // Firebase
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);

  Serial.println("Firebase Connected");
}

// ================== LOOP ==================

void loop() {
  long duration;
  int distance;

  // Trigger ultrasonic sensor
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  duration = pulseIn(ECHO_PIN, HIGH, 30000); // timeout safety
  distance = (duration / 2) / 29.1;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  // Slot logic
  String status;
  if (distance > 0 && distance < 10) {
    status = "OCCUPIED";
  } else {
    status = "FREE";
  }

  // ================== FIREBASE UPDATES ==================

  Firebase.setString(firebaseData,
                     "/ParkingSlots/Slot1/status",
                     status);

  Firebase.setInt(firebaseData,
                  "/ParkingSlots/Slot1/distance",
                  distance);

  Firebase.setInt(firebaseData,
                  "/ParkingSlots/Slot1/lastUpdated",
                  millis());

  if (firebaseData.httpCode() != 200) {
    Serial.print("Firebase error: ");
    Serial.println(firebaseData.errorReason());
  } else {
    Serial.println("Firebase updated successfully");
  }

  delay(1000); // 1 second update interval
}