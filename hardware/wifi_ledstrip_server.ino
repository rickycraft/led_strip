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
const int ledPin[LED_COUNT] = {4, 12, 5}; //D5 D6 D7 on weMos d1 mini
int ledCurrentVal[LED_COUNT] = {0, 0, 0};   //the current value of leds
int ledFadeTo[LED_COUNT] = {0, 0, 0};       //the final value leds are fading towards
unsigned int unavailableCount = 0;

WiFiClient client;

//-----------Other Variables-----------
bool ewStatus = false;
const int ewPin = 1; //D6

//-------JSON-------
const int capacity = JSON_OBJECT_SIZE(5);
StaticJsonDocument<capacity> root;

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
  delay(10);
  server.handleClient();
  MNDS.update();
  incrementLights();
}

void handleRoot(){
  handleStatus();
}

void handleStatus(){ //responding with current status
  String out = "";
  serializeJson(root, out); //creating serialized json
  Serial.println(out);
  server.send(200, "application/json", out);
}

void handleElwire(){
  ewStatus = !ewStatus;
  root["ew"] = ewStatus;
  handleStatus();
}

void handleFade(){  //TODO fade
  handleStatus();
}

void updateLedValue(int rawValue, int pos){ //update led value in json and fade to
  int value = checkReadVal(rawValue);
  case (pos) {
    case 0:
      root["red"] = value;
      ledFadeTo[pos] = value*root["lux"];
      break;
    case 1:
      root["green"] = value;
      ledFadeTo[pos] = value*root["lux"];
      break;
    case 2:
      root["blu"] = value;
      ledFadeTo[pos] = value*root["lux"];
      break;
    case 3:
      root["lux"] = value;
      break;
  }
}

void handleLed(){ //handle led request reading parameters
  if (server.hasArg("l"))
    updateLedValue(server.arg("l"), 3);
  if (server.hasArg("r"))
    updateLedValue(server.arg("r"), 0);
  if (server.hasArg("g"))
    updateLedValue(server.arg("g"), 1);
  if (server.hasArg("b"))
    updateLedValue(server.arg("b"), 2);
}

void handleNotFound(){
  server.send(404, "text/plain", "Not Found")
}

int checkReadVal(int inVal){ //check if values are between 0 and 255
  if(inVal > 255)
    return 255;
  else if (inVal < 0)
    return 0;
  else
    return inVal;
}

void incrementLights(){    //if final led values have changed this funciton fades lights up or down
  bool isChanged = false;
  for(int i = 0; i < LED_COUNT; i++) //if value are changed
    if (ledCurrentVal[i] != ledFadeTo[i]){
      isChanged = true;
      break;
    }

  if (isChanged){ //if value has changed, fade to value for each color
    Serial.println("fading to color");
    float fadeTime = 1020; //total ms to fade
    int deltaValue[LED_COUNT] = {0,0,0};
    float incrementValue[LED_COUNT] = {0,0,0};
    float fadeValue[LED_COUNT] = {ledCurrentVal[0],ledCurrentVal[1],ledCurrentVal[2]};

    for(int i = 0; i < LED_COUNT; i++){ //calculate how much increment value each time
      deltaValue[i] = (ledFadeTo[i]) - (ledCurrentVal[i]);
      incrementValue[i] = deltaValue[i]/fadeTime;
    }
    for(int i = 0; i < fadeTime; i++){ //fade to value
      for(int j = 0; j < LED_COUNT; j++){
        fadeValue[j] += incrementValue[j];//increment value
        analogWrite(ledPin[j], (int) fadeValue[j]);
      }
      delay(1);
    }
    for(int i = 0; i < LED_COUNT; i++){ //final value
      if(abs(ledFadeTo[i] - fadeValue[i]) > 10){
        Serial.println("Error in fading to value");
        Serial.print(fadeValue[i]);
        Serial.println(ledFadeTo[i]);
      }
      ledCurrentVal[i] = ledFadeTo[i];
      analogWrite(ledPin[i], ledCurrentVal[i]);
    }
  }
}

void setupWifi(){
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.hostname("wemos d1");
  WiFi.config(ip, gateway, subnet); //static configuration
  WiFi.begin(ssid, wifiPass);   //connecting to wifi
  WiFi.mode(WIFI_STA);

  while (WiFi.status() != WL_CONNECTED){
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nWiFi connected");

  server.begin();   //starting server on ESP8266
  Serial.println("Server started");
  Serial.print("Local IP adress: ");
  Serial.println(WiFi.localIP());
  Serial.println(ip);
  Serial.println("");

  if (MDNS.begin("esp8266")){
    Serial.println("MDNS responder started");
  }

  server.on("/", handleRoot);
  server.on("/led", handleLed);
  server.on("/status", handleStatus);
  server.on("/ew", handleElwire);
  server.on("/fade", handleFade);
  server.onNotFound(handleNotFound);

  Serial.println("Server setup compleated");
  //WiFi.printDiag(Serial);
}
