//-----------Library-----------
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <math.h>
#include <ArduinoJson.h>

//-----------Wifi Server----------------
WiFiClient client;
ESP8266WebServer server(80);
const char* ssid = "TP-LINK";
const char* wifiPass = "123clienti";
IPAddress ip(192,168,1,220);       //static IP adress of device
IPAddress gateway(192,168,1,1);   //gateway
IPAddress subnet(255,255,255,0);  //network mask

//-----------LED Settings-----------
const uint8_t N_LED = 3;
const uint8_t ledPin[N_LED] = {12, 4, 5}; //D5 D6 D7 on weMos d1 mini
uint8_t ledCurrentVal[N_LED] = {0, 0, 0};   //the current value of leds
uint8_t ledFadeTo[N_LED] = {0, 0, 0};       //the final value leds are fading towards

//-----------ElWire Variables-----------
bool ewStatus = false;
const uint8_t ewPin = 1; //D6

//-------JSON--------
StaticJsonDocument<110> root;

void setup()
{
  Serial.begin(115200);
  for(int i = 0; i < N_LED; i++)
    pinMode(ledPin[i], OUTPUT);           //sets all led pins as output

  setupWifi();    //setting up and connecting to wifi
  
  root["red"] = 0; //createJson
  root["green"] = 0;
  root["blu"] = 0;
  root["lux"] = 0;
  root["ew"] = false;

  Serial.println(F("Setup compleated\n##################"));
}

void loop()
{
  server.handleClient();
  //MDNS.update();
}

void handleRoot(){ //handle / as status
  handleStatus();
}

void handleStatus(){ //responding with current status
  unsigned int start_time = millis();
  int len = measureJson(root)+1;
  char out[len];
  serializeJson(root, out, len); //creating serialized json
  
  server.send(200, "application/json", out); //sending server response

  Serial.print(out); //printing log
  Serial.print(" in ");
  Serial.print(millis() - start_time);
  Serial.println("ms");

  incrementLights();
}

void handleElwire(){ //elwire handling
  ewStatus = !ewStatus;
  root["ew"] = ewStatus;
  handleStatus();
}

void handleFade(){  //TODO fade
  handleStatus();
}

void handleLed(){ //handle led request reading parameters 
  //Serial.println(F("Handling led"));
  updateLedValue(server.arg("lux"), 3); //update led values
  updateLedValue(server.arg("red"), 0);
  updateLedValue(server.arg("green"), 1);
  updateLedValue(server.arg("blu"), 2);
  handleStatus();
  delay(100);
}

void handleNotFound(){ //handle not found url request
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
  int value = checkReadVal(rawValue.toInt()); //converting parameter to int
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

void rawIncrementLights(){ //fast fade to light value
  for (int i = 0; i < 3; i++){
    analogWrite(ledPin[i], ledFadeTo[i]);
    ledCurrentVal[i] = ledFadeTo[i];
  }
}

void incrementLights(){    //if final led values have changed this funciton fades lights up or down
  Serial.print(F("Fading to color in "));
  unsigned int start_time = millis();
  
  float fadeTime = 1020; //total ms to fade
  int deltaValue[N_LED] = {0,0,0};
  float incrementValue[N_LED] = {0,0,0};
  float fadeValue[N_LED] = {ledCurrentVal[0],ledCurrentVal[1],ledCurrentVal[2]};

  for(int i = 0; i < N_LED; i++){ //calculate how much increment value each time
    deltaValue[i] = (ledFadeTo[i]) - (ledCurrentVal[i]);
    incrementValue[i] = deltaValue[i]/fadeTime;
  }
  for(int i = 0; i < fadeTime; i++){
    for(int j = 0; j < N_LED; j++){ //fade to value
        fadeValue[j] += incrementValue[j];//increment value
        analogWrite(ledPin[j], (int) fadeValue[j]);
      }
    delay(1);
  }

  Serial.print(millis() - start_time - (int)fadeTime);  //printing log time
  Serial.println(F("ms"));
  Serial.println(F("####################"));
  
  for(int i = 0; i < N_LED; i++){ //final value
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
  Serial.print(F("Connecting to "));
  Serial.println(ssid);
  WiFi.hostname(F("wemos d1"));
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
  
  if (MDNS.begin("wifi_ledstrip")){  //MDNS started
    Serial.println(F("MDNS responder started"));
  } else {
    Serial.println(F("Error setting up MDNS responder!"));
  }

  server.on("/", handleRoot);  //handle routes
  server.on("/led", handleLed);
  server.on("/status", handleStatus);
  server.on("/ew", handleElwire);
  server.on("/fade", handleFade);
  server.onNotFound(handleNotFound);

  server.begin();   //starting server on ESP8266

  Serial.print(F("Server setup compleated in "));
  Serial.println(millis() - start_time);
  //WiFi.printDiag(Serial);
}
