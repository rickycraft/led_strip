//-----------Library-----------
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <math.h>
//-----------Wifi Server----------------
WiFiClient client;
ESP8266WebServer server(80);
const char* ssid = "TP-LINK";
const char* wifiPass = "123clienti";
IPAddress ip(192,168,1,225);       //static IP adress of device
IPAddress gateway(192,168,1,1);   //gateway
IPAddress subnet(255,255,255,0);  //network mask

//-----------LED Settings-----------
uint8_t buttonPin = 0;
uint8_t lightPin = 12;
bool lamp_status = false;
uint8_t buttonStatus;
uint16_t lux = 0;

unsigned long timer = 0;

void setup(){
  Serial.begin(115200);
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(lightPin, OUTPUT);
  analogWrite(lightPin, 100);
  delay(100);
  buttonStatus = digitalRead(buttonPin);
  //attachInterrupt(digitalPinToInterrupt(buttonPin), toggle, CHANGE);
  setupWifi();    //setting up and connecting to wifi

  digitalWrite(lightPin, LOW);
  Serial.println(F("Setup compleated\n##################"));
}

void loop(){
  server.handleClient();
  if ((millis() - timer) > 5000){
    timer = millis();
    MDNS.update();
  }
  if (digitalRead(buttonPin) != buttonStatus){
    buttonStatus = digitalRead(buttonPin);
    toggleButton();
    delay(100);
  }
}

void toggleButton(){
  if (lamp_status && lux > 250){
    setLamp(0);
  } else {
    setLamp(255);
  }
}

void handleRoot(){ //handle / as status
  handleStatus();
}

void handleStatus(){ //responding with current status
  unsigned int start_time = millis();
  String val = (lamp_status)? "true" : "false";
  String s = "{ \"status\" : "+val+", \"lux\" : "+lux+"}";
  server.send(200, "application/json", s); //sending server response

  Serial.print(s); Serial.print(" in ");
  Serial.print(millis() - start_time); Serial.println("ms");
}

void handleLed(){
  toggle();
  handleStatus();
}

void handleButton(){
  server.send(200, "text/plain", String(digitalRead(buttonPin)));
}

void handleLux(){
  setLamp(server.arg("lux").toInt());
  handleStatus();
}

void toggle(){
  if (lamp_status) {
    setLamp(0);
  } else {
    setLamp(255);
  }
}

void setLamp(int val){
  if (val > 249){
    lamp_status = true;
    lux = 255;
    digitalWrite(lightPin, HIGH);
    Serial.println("lamp high");
  } else if ( val < 1){
    lux = 0;
    lamp_status = false;
    digitalWrite(lightPin, LOW);
    Serial.println("lamp low");
  } else {
    lux = val;
    analogWrite(lightPin, lux);
    lamp_status = true;
    Serial.print("lamp at");
    Serial.println(lux);
  }
}

void setupWifi(){
  Serial.print(F("Connecting to "));
  Serial.println(ssid);
  //WiFi.hostname(F("wemos"));
  WiFi.config(ip, gateway, subnet); //static configuration
  WiFi.begin(ssid, wifiPass);   //connecting to wifi
  WiFi.mode(WIFI_STA);

  while (WiFi.status() != WL_CONNECTED){  //wait wifi for connect
    Serial.print(".");
    delay(100);
  }
  Serial.println(F("\nWiFi connected"));

  Serial.println(F("Server started"));
  Serial.print(F("Local IP adress: "));
  Serial.println(WiFi.localIP());
  Serial.println(ip);
  Serial.println("");

  if (MDNS.begin("lamp")){  //MDNS started
    Serial.println(F("MDNS responder started"));
  } else {
    Serial.println(F("Error setting up MDNS responder!"));
  }

  server.on("/", handleRoot);  //handle routes
  server.on("/led", handleLed);
  server.on("/status", handleStatus);
  server.on("/lux", handleLux);
  server.on("/button", handleButton);
  //server.onNotFound(handleNotFound);

  server.begin();   //starting server on ESP8266
  MDNS.addService("http", "tcp", 80); //MDNS service
}
