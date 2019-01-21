//-----------WiFi Settings-----------
#include <ESP8266WiFi.h>
#include <math.h>
#include <ArduinoJson.h>
const char* ssid = "TP-LINK";
const char* wifiPass = "";
WiFiServer server(80);
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
const int ledPin[LED_COUNT] = {14, 5, 4}; //D5 D6 D7 on weMos d1 mini
int ledCurrentVal[LED_COUNT] = {0, 0, 0};   //the current value of leds
int ledFadeTo[LED_COUNT] = {0, 0, 0};       //the final value leds are fading towards
unsigned long currTime = 0;
int unavailableCount = 0;

//-----------Other Variables-----------
bool ewStatus = false;
const int ewPin = 13; //D8

//-------JSON-------
const int bufferLen = JSON_OBJECT_SIZE(3);
StaticJsonBuffer<100> jsonBuffer;
JsonObject& root = jsonBuffer.createObject();

void setup()
{
  Serial.begin(115200);
  delay(10);

  for(int i = 0; i < LED_COUNT; i++)
    pinMode(ledPin[i], OUTPUT);           //sets all led pins as output

  setupWifi();    //setting up and connecting to wifi
  delay(10);
  Serial.println(bufferLen);
}

void loop()
{
  //incrementLights();    //if led final values have changed, this funciton fades lights up or down

  //-----------Handles HTTP Requests-----------
  WiFiClient client = server.available();   //checking for client connection
  if (!client)
    return;   //restarts loop function

  currTime = millis();
  //waits until the client sends data
  unavailableCount = 0;
  while(!client.available() && unavailableCount < 9000)
  {
    unavailableCount++;
    delay(1);
    //Serial.print("...");
  }
  //request handling
  String inRequest = client.readStringUntil('\r');  //reads inRequest until end of line
  inRequest.toUpperCase();    //shifts string to upper letters to increase useablity
  Serial.print("incoming request:\t");
  reactToRequest(inRequest);  //reacts to information sent from client
  delay(10);
  //--------Creating JSON------------


  root["red"] = ledFadeTo[0];
  root["green"] = ledFadeTo[1];
  root["blue"] = ledFadeTo[2];

  char jsonBuffer[root.measureLength()+1];
  root.printTo(jsonBuffer, sizeof(jsonBuffer));
  //----------HTTP Headers-------------------
  client.flush();   //clears data from client
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: application/json");
  client.println("");
  root.printTo(Serial);
  Serial.println();
  root.printTo(client);

  incrementLights();
}

void reactToRequest(String inRequest)
{
  if (inRequest.indexOf("/FAVICON.ICO") != -1) //return if is a FAVICON
    return;
  Serial.println(inRequest);
  //turns off all lights
  if (inRequest.indexOf("/LED=OFF") != -1)
  {
    for(int i = 0; i < LED_COUNT; i++)
      ledFadeTo[i] = 0;
  }

  if(inRequest.indexOf("/ELWIRE") != -1)
  {

    ewStatus = !ewStatus;
  }
  //manually sets all incomming colors as colors the microcontroller is going to fade towards
  if(inRequest.indexOf("/&&") != -1) //e.g. 192.168.0.63/&&R=255G=255B=255
  {
    //indices for splitting individual values from data:
    int valueIndex[LED_COUNT];
    valueIndex[0] = inRequest.indexOf("R=");
    valueIndex[1] = inRequest.indexOf("G=");
    valueIndex[2] = inRequest.indexOf("B=");

    //saves invalues as led values to fade towards
    for(int i = 0; i < LED_COUNT; i++)
      ledFadeTo[i] = checkReadVal(inRequest.substring(valueIndex[i] + 2, valueIndex[i] + 5).toInt());
  }

  //slowly fades RGB values for ambience
  if(inRequest.indexOf("/LED=FADE") != -1)
  {
    //TODO fade
  }

}//end of function reactToRequest

int checkReadVal(int inVal) //check if are valid rgb values
{
  if(inVal > 255)
    return 255;
  else if (inVal < 0)
    return 0;
  else
    return inVal;
}

void incrementLights()    //if final led values have changed this funciton fades lights up or down
{
  bool isChanged = false;
  for(int i = 0; i < LED_COUNT; i++) //if value are changed
    if (ledCurrentVal[i] != ledFadeTo[i]){
      isChanged = true;
      break;
    }

  if (isChanged){ //if value has changed, fade to value for each color
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

void setupWifi()
{
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.hostname("wemos d1");
  WiFi.config(ip, gateway, subnet); //static configuration
  WiFi.begin(ssid, wifiPass);   //connecting to wifi
  WiFi.mode(WIFI_STA);

  while (WiFi.status() != WL_CONNECTED)
  {
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

  //WiFi.printDiag(Serial);
}
