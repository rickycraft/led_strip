//-----------Library-----------
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

//-----------Wifi Server----------------
ESP8266WebServer server(80);
const char* ssid = "TP-LINK";
const char* wifiPass = "123clienti";
IPAddress ip(192,168,1,230);       //static IP adress of device
IPAddress gateway(192,168,1,1);   //gateway
IPAddress subnet(255,255,255,0);  //network mask

//-------JSON--------
StaticJsonDocument<110> root;

//-------BME280--------
Adafruit_BME280 bme; // I2C

void setup()
{
    Serial.begin(115200);
    setupWifi();    //setting up and connecting to wifi
    
    bme.begin(0x76);
    //createJson
    root["temp"] = bme.readTemperature(); 
    root["bar"] = bme.readPressure() / 100.0F;
    root["humi"] = bme.readHumidity();
    
    Serial.println(F("Setup compleated\n####################"));
}

void loop()
{
  server.handleClient();
}

void handleNotFound(){ //handle not found url request
  server.send(404, "text/plain", "Not Found");
}

void handleData(){
    root["temp"] = bme.readTemperature(); 
    root["bar"] = bme.readPressure() / 100.0F;
    root["humi"] = bme.readHumidity();
    delay(100);
    int len = measureJson(root)+1;
    char out[len];
    serializeJson(root, out, len); //creating serialized json
    Serial.println(out);
    server.send(200, "application/json", out); //sending server response
    Serial.println("####################");
}

void handleRead(){
    Serial.println("reading sensor data");
    root["temp"] = bme.readTemperature();
    root["bar"] = bme.readPressure() / 100.0F;
    root["humi"] = bme.readHumidity();
    server.send(200, "text/plain", "finished reading data");
    Serial.println("finish reading data\n####################");
}

void handleRoot(){
    Serial.println("handle root");
    int len = measureJson(root)+1;
    char out[len];
    serializeJson(root, out, len); //creating serialized json
    Serial.println(out);
    server.send(200, "application/json", out); //sending server response
}

void setupWifi(){
  Serial.print(F("\nConnecting to "));
  Serial.print(ssid);
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
  Serial.println("");
  
  server.on("/", handleRoot);  //handle routes
  server.on("/data", handleData);
  server.on("/read", handleRead);
  server.onNotFound(handleNotFound);
  server.begin();   //starting server on ESP8266

}
