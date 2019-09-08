//-----------Library-----------
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
//-----------Wifi Server----------------
HTTPClient http;
ESP8266WebServer server(80);
const char* ssid = "TP-LINK";
const char* wifiPass = "123clienti";
IPAddress ip(192, 168, 1, 230);    //static IP adress of device
IPAddress gateway(192, 168, 1, 1); //gateway
IPAddress subnet(255, 255, 255, 0); //network mask

//-----------LED Settings-----------
uint8_t lightPin = 14;
uint8_t ewPin = 10;
bool lamp_status = false;
bool ew_status = false;
uint16_t lux = 0;

unsigned long timer = 0;

void setup() {
  Serial.begin(115200);
  pinMode(lightPin, OUTPUT);
  pinMode(ewPin, OUTPUT);

  analogWrite(lightPin, 100);
  delay(100);
  setupWifi();    //setting up and connecting to wifi

  digitalWrite(lightPin, LOW);
  Serial.println(F("Setup compleated\n##################"));
}

void loop() {
  server.handleClient();
  delay(100);
}

void httpGet() {
  http.begin("http://192.168.1.225/toggle");
  http.setTimeout(200);
  http.GET();
  http.end();
  server.send(200);
}

void handleEw() {
  if (ew_status) {
    digitalWrite( ewPin, LOW);
  } else {
    digitalWrite( ewPin, HIGH);
  }
  ew_status = !ew_status;
  handleStatus();
}

void toggleButton() {
  if (lamp_status && lux > 250) {
    setLamp(0);
  } else {
    setLamp(255);
  }
}

void handleStatus() { //responding with current status
  String val = (lamp_status) ? "true" : "false";
  String tmp = (ew_status) ? "true" : "false";
  String s = "{ \"ambient\" : " + val + ", \"lux\" : " + lux + ", \"ew\" : " + tmp + "}";
  server.send(200, "application/json", s); //sending server response
}

void handleToggle() {
  toggle();
  handleStatus();
}

void handleLux() {
  setLamp(server.arg("lux").toInt());
  handleStatus();
}

void toggle() {
  if (lamp_status) {
    setLamp(0);
  } else {
    setLamp(255);
  }
}

void setLamp(int val) {
  Serial.println(val);
  if (val > 249) {
    lamp_status = true;
    lux = 255;
    digitalWrite(lightPin, HIGH);
  } else if ( val < 1) {
    lux = 0;
    lamp_status = false;
    digitalWrite(lightPin, LOW);
  } else {
    lux = val;
    analogWrite(lightPin, lux);
    lamp_status = true;
  }
}

void setupWifi() {
  Serial.println("");
  Serial.print(F("Connecting to "));
  Serial.print(ssid);
  WiFi.config(ip, gateway, subnet); //static configuration
  WiFi.begin(ssid, wifiPass);   //connecting to wifi
  WiFi.mode(WIFI_STA);

  while (WiFi.status() != WL_CONNECTED) { //wait wifi for connect
    Serial.print(".");
    delay(100);
  }
  Serial.println(F("\nWiFi connected"));

  Serial.println(F("Server started"));
  Serial.print(F("Local IP adress: "));
  Serial.println(WiFi.localIP());
  Serial.println(ip);
  Serial.println("");

  server.on("/", handleStatus);  //handle routes
  server.on("/toggle", handleToggle);
  server.on("/status", handleStatus);
  server.on("/lux", handleLux);
  server.on("/ew", handleEw);
  server.on("/test", httpGet);

  server.begin();   //starting server on ESP8266
}
