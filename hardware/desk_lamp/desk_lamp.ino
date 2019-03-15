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
bool status = false;
uint8_t buttonStatus;
uint8_t lux = 0;

unsigned long timer = 0;

void setup()
{
  Serial.begin(115200);
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(lightPin, OUTPUT);
  buttonStatus = digitalRead(buttonPin);
  //attachInterrupt(digitalPinToInterrupt(buttonPin), toggle, CHANGE);
  setupWifi();    //setting up and connecting to wifi

  Serial.println(F("Setup compleated\n##################"));
}

void loop()
{
  server.handleClient();
  if ((millis() - timer) > 5000){
    timer = millis();
    MDNS.update();
  }
  if (digitalRead(buttonPin) != buttonStatus){
    buttonStatus = digitalRead(buttonPin);
    toggle();
  }
}

void handleRoot(){ //handle / as status
  handleStatus();
}

void handleStatus(){ //responding with current status
  unsigned int start_time = millis();
  String val = (status)? "true" : "false";
  String s = "{ \"status\" : "+val+"}";
  server.send(200, "application/json", s); //sending server response

  Serial.print(s); //printing log
  Serial.print(" in ");
  Serial.print(millis() - start_time);
  Serial.println("ms");
}

void handleLed(){
  toggle();
  handleStatus();
}

void toggle(){
  status = !status;
  Serial.println(status);
  digitalWrite(lightPin, (status)? HIGH : LOW);
}

void setupWifi(){
  unsigned int start_time = millis();
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
  //server.onNotFound(handleNotFound);

  server.begin();   //starting server on ESP8266
  MDNS.addService("http", "tcp", 80); //MDNS service

  Serial.print(F("Server setup compleated in "));
  Serial.println(millis() - start_time);
  //WiFi.printDiag(Serial);
}
