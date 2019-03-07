//-----------WiFi Settings-----------
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <math.h>
#include <ArduinoJson.h>
const char* ssid = "TP-LINK";
const char* wifiPass = "123clienti";
ESP8266WebServer server(80);
//the three next lines are for static IP configuration
//if you activate this remember to uncomment the WiFi.config line in the setupWifi() function
IPAddress ip(192,168,1,220);       //static IP adress of device
IPAddress gateway(192,168,1,1);   //gateway
IPAddress subnet(255,255,255,0);  //network mask

//----------Libraries-----------
// http://arduino.esp8266.com/stable/package_esp8266com_index.json

//-----------LED Settings-----------
const int LED_COUNT = 3;      //3 for RGB leds, 5 for RGB + Cold and Warm leds
//arrays are set up to hold the values in the order: red blue green cold warm
const int ledPin[LED_COUNT] = {12, 4, 5}; //D5 D6 D7 on weMos d1 mini
int ledCurrentVal[LED_COUNT] = {0, 0, 0};   //the current value of leds
int ledFadeTo[LED_COUNT] = {0, 0, 0};       //the final value leds are fading towards
unsigned int unavailableCount = 0;

WiFiClient client;

//-----------Other Variables-----------
bool ewStatus = false;
const int ewPin = 1; //D6

//-------JSON-------
const int capacity = JSON_OBJECT_SIZE(10);
StaticJsonDocument<110> root;

void setup()
{
  Serial.begin(115200);

  for(int i = 0; i < LED_COUNT; i++)
    pinMode(ledPin[i], OUTPUT);           //sets all led pins as output

  setupWifi();    //setting up and connecting to wifi
  delay(10);
  //createJson
  root["red"] = 0;
  root["green"] = 0;
  root["blu"] = 0;
  root["lux"] = 0;
  root["ew"] = false;
}

void loop()
{
  server.handleClient();
  //MDNS.update();
  //incrementLights();
}

void handleRoot(){
  handleStatus();
}

void handleStatus(){ //responding with current status
  unsigned int start_time = millis();

  String out = "";
  serializeJson(root, out); //creating serialized json
  server.send(200, "application/json", out);

  Serial.print(out);
  Serial.print("\t in ");
  Serial.print(millis() - start_time);
  Serial.println("ms");

  incrementLights();
}

void handleElwire(){
  ewStatus = !ewStatus;
  root["ew"] = ewStatus;
  handleStatus();
}

void handleFade(){  //TODO fade
  handleStatus();
}

void handleLed(){ //handle led request reading parameters
  Serial.println("Handling led");
  updateLedValue(server.arg("lux"), 3);
  updateLedValue(server.arg("red"), 0);
  updateLedValue(server.arg("green"), 1);
  updateLedValue(server.arg("blu"), 2);
  handleStatus();
  delay(100);
}

void handleNotFound(){
  server.send(404, "text/plain", "Not Found");
}

int checkReadVal(int inVal){ //check if values are between 0 and 255
  if(inVal > 255)
    return 255;
  else if (inVal < 0)
    return 0;
  else
    return inVal;
}

void updateLedValue(String rawValue, int pos){ //update led value in json and fade to
  int value = checkReadVal(rawValue.toInt());
  int tmpLux = root["lux"];
  switch (pos) {
    case 0:
      root["red"] = value;
      ledFadeTo[pos] = value*tmpLux;
      break;
    case 1:
      root["green"] = value;
      ledFadeTo[pos] = value*tmpLux;
      break;
    case 2:
      root["blu"] = value;
      ledFadeTo[pos] = value*tmpLux;
      break;
    case 3:
      root["lux"] = value;
      break;
  }
}

void rawIncrementLights(){
  for (int i = 0; i < 3; i++){
    analogWrite(ledPin[i], ledFadeTo[i]);
    ledCurrentVal[i] = ledFadeTo[i];
  }
}

void incrementLights(){    //if final led values have changed this funciton fades lights up or down
  Serial.print("Fading to color in ");
  unsigned int start_time = millis();
  
  float fadeTime = 1020; //total ms to fade
  int deltaValue[LED_COUNT] = {0,0,0};
  float incrementValue[LED_COUNT] = {0,0,0};
  float fadeValue[LED_COUNT] = {ledCurrentVal[0],ledCurrentVal[1],ledCurrentVal[2]};

  for(int i = 0; i < LED_COUNT; i++){ //calculate how much increment value each time
    deltaValue[i] = (ledFadeTo[i]) - (ledCurrentVal[i]);
    incrementValue[i] = deltaValue[i]/fadeTime;
  }
  for(int i = 0; i < fadeTime; i++){
    for(int j = 0; j < LED_COUNT; j++){ //fade to value
        fadeValue[j] += incrementValue[j];//increment value
        analogWrite(ledPin[j], (int) fadeValue[j]);
      }
    delay(1);
  }

  Serial.print(millis() - start_time - (int)fadeTime);
  Serial.println("ms");
  Serial.println("####################");
  
  for(int i = 0; i < LED_COUNT; i++){ //final value
    /*
    if(abs(ledFadeTo[i] - fadeValue[i]) > 10){
      Serial.println("Error in fading to value");
      Serial.print(fadeValue[i]);
      Serial.println(ledFadeTo[i]);
    }
    */
    ledCurrentVal[i] = ledFadeTo[i];
    analogWrite(ledPin[i], ledCurrentVal[i]);
  }
  
}

void setupWifi(){
  unsigned int start_time = millis();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.hostname("wemos d1");
  WiFi.config(ip, gateway, subnet); //static configuration
  WiFi.begin(ssid, wifiPass);   //connecting to wifi
  WiFi.mode(WIFI_STA);

  while (WiFi.status() != WL_CONNECTED){
    Serial.print(".");
    delay(100);
  }
  Serial.println("\nWiFi connected");
  
  
  Serial.println("Server started");
  Serial.print("Local IP adress: ");
  Serial.println(WiFi.localIP());
  Serial.println(ip);
  Serial.println("");
  
  if (MDNS.begin("wifi_ledstrip")){
    Serial.println("MDNS responder started");
  } else {
    Serial.println("Error setting up MDNS responder!");
  }

  server.on("/", handleRoot);
  server.on("/led", handleLed);
  server.on("/status", handleStatus);
  server.on("/ew", handleElwire);
  server.on("/fade", handleFade);
  server.onNotFound(handleNotFound);

  server.begin();   //starting server on ESP8266

  Serial.print("Server setup compleated in ");
  Serial.println(millis() - start_time);
  //WiFi.printDiag(Serial);
}
