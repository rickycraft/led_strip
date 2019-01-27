//-----------WiFi Settings-----------
#include <ESP8266WiFi.h>
#include <math.h>
#include <ArduinoJson.h>
const char* ssid = "TP-LINK";
const char* wifiPass = "123clienti";
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
int lux = 0;
//arrays are set up to hold the values in the order: red blue green cold warm
const int ledPin[LED_COUNT] = {14, 5, 4}; //D5 D6 D7 on weMos d1 mini
int ledCurrentVal[LED_COUNT] = {0, 0, 0};   //the current value of leds
int ledFadeTo[LED_COUNT] = {0, 0, 0};       //the final value leds are fading towards
unsigned int unavailableCount = 0;

WiFiClient client;
String status200 = "HTTP/1.1 200 OK";

//-----------Other Variables-----------
bool ewStatus = false;
const int ewPin = 13; //D8

//-------JSON-------
StaticJsonBuffer<150> jsonBuffer;
JsonObject& root = jsonBuffer.createObject();

void setup()
{
  Serial.begin(115200);
  delay(10);

  for(int i = 0; i < LED_COUNT; i++)
    pinMode(ledPin[i], OUTPUT);           //sets all led pins as output

  setupWifi();    //setting up and connecting to wifi
  delay(10);
  //createJson
  setValues(0,0,0,0);
  root["ew"] = false;
}

void loop()
{
  incrementLights(); //fade to value
  //-----------Handles HTTP Requests-----------
  client = server.available();   //checking for client connection
  if (!client){
    return;   //restarts loop function
  }

  unavailableCount = 0;
  while(!client.available() && unavailableCount < 9000) //waits until the client sends data
  {
    unavailableCount++;
    delay(1);
  }
  //request handling
  String inRequest = client.readStringUntil('H');
  inRequest.toUpperCase();  //reads inRequest until end of line
  //inRequest.substring(inRequest.indexOf("/"));
  Serial.print("incoming request:\t");Serial.println(inRequest);

  reactToRequest(inRequest);  //reacts to information sent from client
}

void setValues(int r, int g, int b, int l){
  root["red"] = r;
  root["green"] = g;
  root["blu"] = b;
  root["lux"] = l;
}

void response(){
  char jsonBuffer[root.measureLength()+1];
  root.printTo(jsonBuffer, sizeof(jsonBuffer));
  //----------HTTP Headers-------------------
  client.flush();   //clears data from client
  client.println(status200);
  client.println("Content-Type: application/json");
  client.println("");
  root.printTo(client);
  root.printTo(Serial); Serial.println();
}

void reactToRequest(String req)
{
    if(req.indexOf("/STATUS") != -1){
      Serial.println("Status requested");

    } else if (req.indexOf("/LED/OFF") != -1) //turns off all lights
    {
      for(int i = 0; i < LED_COUNT; i++)
        ledFadeTo[i] = 0;
      setValues(0,0,0,0);

    } else if(req.indexOf("/LED/&") != -1) //ex. 192.168.1.220/led/&25:25:25:10
    {
      int ind = req.indexOf('&')+1; //start index
      int ledVal[LED_COUNT] = { //storing rgb values
        req.substring(ind, ind +2).toInt(),
        req.substring(ind +3, ind +5).toInt(),
        req.substring(ind +6, ind +8).toInt()
      };
      int luxVal = req.substring(ind +9, ind+11).toInt(); //storing lux values
      setValues(ledVal[0],ledVal[1],ledVal[2],luxVal); //setting json values

      for(int i = 0; i < LED_COUNT; i++)  //saves invalues as led values to fade towards (already multiplied by lux)
        ledFadeTo[i] = checkReadVal(ledVal[i]*luxVal);

    } else if(req.indexOf("/ELWIRE") != -1)
    {
      ewStatus = !ewStatus;
      root["ew"] = ewStatus;

    }else if(req.indexOf("/FADE") != -1) //fade to values
    {
      //TODO fade

    } else {
      Serial.println("Error");
      client.println("HTTP/1.1 500 Internal Server Error");
      client.println("");
      client.flush();
      return;
    }
    response();
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
