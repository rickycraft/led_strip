//-----------WiFi Settings-----------
#include <ESP8266WiFi.h>
const char* ssid = "TP_LINK";      
const char* wifiPass = "hunter2";    
WiFiServer server(80);
//the three next lines are for static IP configuration
//if you activate this remember to uncomment the WiFi.config line in the setupWifi() function
IPAddress ip(192,168,1,300);       //static IP adress of device 
IPAddress gateway(192,168,1,1);   //gateway
IPAddress subnet(255,255,255,0);  //network mask

//----------Libraries-----------
#include <WiFiUdp.h>
// #include <EEPROM.h>
// http://arduino.esp8266.com/stable/package_esp8266com_index.json

//-----------LED Settings-----------
const int ARRAY_LED_COUNT = 3;      //3 for RGB leds, 5 for RGB + Cold and Warm leds
//arrays are set up to hold the values in the order: red blue green cold warm
const int ledPin[ARRAY_LED_COUNT] = {14, 13, 12}; //D5 D7 D6 D1 D2 on weMos d1 mini
int ledCurrentVal[ARRAY_LED_COUNT] = {0, 0, 0};   //the current value of leds
int ledFadeTo[ARRAY_LED_COUNT] = {0, 0, 0};       //the final value leds are fading towards

//-----------Other Variables-----------

unsigned long standardDelay = 1, fadeDelay = standardDelay, longDelay = 160;   //delays used for fading lights
unsigned long currentMs = 0, prevMs = 0;    //loop time variables
int switchFade = 0, fadeCounter = 0;        //used for fading softly between rgb colors
unsigned long wifiReboot = 0;     //used to reboot server after 8 hour continous up time

bool elWireStatus = false;
const int ewPin = 5;

void setup() 
{
  Serial.begin(115200);
  
  delay(10);
  
  for(int i = 0; i < ARRAY_LED_COUNT; i++)    
    pinMode(ledPin[i], OUTPUT);           //sets all led pins as output

  setupWifi();    //setting up and connecting to wifi
  delay(10); 
}

void loop() 
{ 
  incrementLights();    //if led final values have changed, this funciton fades lights up or down

  //if(millis() - wifiReboot > (5*60*60*1000))
  if(WiFi.localIP() != ip)
  {
    setupWifi();
    wifiReboot = millis();
  }

  //-----------Handles HTTP Requests-----------
  WiFiClient client = server.available();   //checking for client connection
  if (!client) 
    return;   //restarts loop function

  //waits until the client sends data
  Serial.println("new client connection");
  Serial.println("");
  int unavailableCount = 0;     //used to wait count while client is unavailable
  while(!client.available() && unavailableCount < 9000)
  {
    unavailableCount++;
    delay(1);
    Serial.print("N/A ");
  }
  Serial.println("");
  Serial.println(unavailableCount);

  String inRequest = client.readStringUntil('\r');  //reads inRequest until end of line
  inRequest.toUpperCase();    //shifts string to upper letters to increase useablity 
  Serial.print("Incomming request:  ");
  Serial.println(inRequest);

  //returns response to avoid error on client side
  client.flush();   //clears data from client
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/html");
  client.println("");   //always needs to be here to avoid error
  client.println("<!DOCTYPE HTML>");
  client.println("<html>");
  
  //-----------Web Page Visible When Visiting ESP8266's Local IP-----------
  client.print("Current LED values RGBCW: ");
  client.print("&");
  for(int i = 0; i < ARRAY_LED_COUNT; i++)
  {
    if(i != ARRAY_LED_COUNT)
    {
      client.print(ledCurrentVal[i]);
      client.print(",");
    }
    else
      client.print(ledCurrentVal[i]);
  }
  client.print("&");
  client.print("<br/>");
  
  client.print("Minutes since server reboot: ");
  int msDummy = millis() - wifiReboot;
  client.print(msDummy/(1000*60));
  client.print("<br/>");
  
  reactToRequest(inRequest);  //reacts to information sent from client

  delay(1);
}

void reactToRequest(String inRequest)
{
  //turns off all lights
  if (inRequest.indexOf("/LED=OFF") != -1)    
  {
    fadeDelay = standardDelay;
    switchFade = 0;
    
    for(int i = 0; i < ARRAY_LED_COUNT; i++)
      ledFadeTo[i] = 0;
  }

  if(inRequest.indexOf("/ELWIRE") != -1)
  {
    if(elWireStatus){ //if on
      analogWrite(ewPin, 0);
      elWireStatus = false;
    } else {
      analogWrite(ewPin, 1023);
      elWireStatus = true;
    }
  }
  //manually sets all incomming colors as colors the microcontroller is going to fade towards
  if(inRequest.indexOf("/&&") != -1) //e.g. 192.168.0.63/&&R=1023G=0512B=0034C=0000W=0000
  {
    fadeDelay = standardDelay;
    switchFade = 0;
    //indices for splitting individual values from data:
    int valueIndex[ARRAY_LED_COUNT];
    valueIndex[0] = inRequest.indexOf("R=");
    valueIndex[1] = inRequest.indexOf("G=");
    valueIndex[2] = inRequest.indexOf("B=");

    //saves invalues as led values to fade towards
    for(int i = 0; i < ARRAY_LED_COUNT; i++)
      ledFadeTo[i] = (inRequest.substring((valueIndex[i] + 2), (valueIndex[i] + 6))).toInt();
  }

  //flashes the given colors two times to indicate notification
  if(inRequest.indexOf("/NOTIFY") != -1) //e.g. 192.168.0.2/NOTIFYR=1023-G=0512-B=0000
  {   
    //indices for splitting individual values from data:
    int redIndex = inRequest.indexOf("R="); 
    int greenIndex = inRequest.indexOf("G=");
    int blueIndex = inRequest.indexOf("B=");
    //stores individual rgb values as integers
    int redVal = (inRequest.substring((redIndex + 2), (redIndex + 6))).toInt();
    int greenVal = (inRequest.substring((greenIndex + 2), (greenIndex + 6))).toInt();
    int blueVal = (inRequest.substring((blueIndex + 2), (blueIndex + 6))).toInt();
    Serial.println("Notification");
    Serial.println("Red = " + String(redVal));
    Serial.println("Green = " + String(greenVal));
    Serial.println("Blue = " + String(blueVal));

    //gets the largest value to be used as increment limit in for loops
    int largestInc;
    if(redVal >= greenVal && redVal >= blueVal)
      largestInc = redVal;
    else if(greenVal >= redVal && greenVal >= blueVal)
      largestInc = greenVal;
    else
      largestInc = blueVal;

    for(int j = 0; j < 2; j++)    //flashes the notification colors two times
    {
      for(int i = 0; i < largestInc; i++)   //this loop fades all lights completely off starting from their set value
      {
        if(i < redVal)              //as long as the set value for red hasn't been reached
          analogWrite(ledPin[0], i);   //increment the red brightness
        if(i < greenVal)
          analogWrite(ledPin[1], i);
        if(i < blueVal)
          analogWrite(ledPin[2], i);
        delay(1);
      }
      for(int i = 0; i < largestInc; i++)   //starts notification color from zero and increases brightness
      {
        if((redVal - i) >= 0)                 //as long as the red value hasn't been decremented to zero
          analogWrite(ledPin[0], (redVal - i));  //decrement the red brightness
        if((greenVal - i) >= 0)
          analogWrite(ledPin[1], (greenVal - i));
        if((blueVal - i) >= 0)
          analogWrite(ledPin[2], (blueVal - i));
        delay(1);
      }
    }
    //sets the original values that were before the notification came
    analogWrite(ledPin[0], ledCurrentVal[0]);
    analogWrite(ledPin[1], ledCurrentVal[1]);
    analogWrite(ledPin[2], ledCurrentVal[2]);
  }
  
  //slowly fades RGB values for ambience
  if(inRequest.indexOf("/LED=FADE") != -1)
  {
    fadeDelay = longDelay;
    switchFade = 1;
    fadeCounter = 0; 
    
    //starts fading by selecting a random color. this indicates to the user that the fading state had begun
    ledCurrentVal[0] = random(5, 200);
    ledCurrentVal[1] = random(5, 200);
    ledCurrentVal[2] = random(5, 200);
    for(int i = 0; i < ARRAY_LED_COUNT; i++)
      ledFadeTo[i] = 0;
  }
  
}//end of function reactToRequest

int checkReadVal(int inVal)
{
  if(inVal == 255)
    return 0;
  else
    return inVal;
}

void incrementLights()    //if final led values have changed this funciton fades lights up or down
{
  currentMs = millis();   //gets current time
  
  if(currentMs - prevMs >= fadeDelay)   //if delay time has passed
  {
    for(int i = 0; i < ARRAY_LED_COUNT; i++)
    {     
      if(ledCurrentVal[i] < ledFadeTo[i])
        ledCurrentVal[i]++;    //increasing fade
      else if((ledCurrentVal[i] > ledFadeTo[i]) && (ledFadeTo[i] >= 0))
        ledCurrentVal[i]--;    //decreasing fade
        
      if(switchFade > 0)  //if rgb fading is activated
        fadeCounter++;    //count the number of times one case has been incremented
    }

    //for rgb fading between all different colors
    int onValue = 900;
    int offValue = 5;   //all rgb lights are slightly on when fading between colors
    if(fadeCounter > (onValue - offValue) || (ledCurrentVal[0] == 0 && ledCurrentVal[1] == 0 
      && ledCurrentVal[2] == 0 && switchFade == 1))    //if one case has faded for the max number of increments
    {
      switchFade++;   //go to a new fading state
      fadeCounter = 0;  
    }
    if(switchFade > 12)    //when the fading has gone through all different color sets
      switchFade = 1;     //start from first set

    if((switchFade > 0) && (fadeCounter == 0))  //if fading has been activated and a new fade case is going to be set
    {
      switch(switchFade)    //sets a color combination to be fading towards
        {
          case 1:
            ledFadeTo[0] = onValue;
            ledFadeTo[1] = offValue;
            ledFadeTo[2] = offValue;
            break;
          case 2:
            ledFadeTo[0] = offValue;
            ledFadeTo[1] = offValue;
            ledFadeTo[2] = offValue;
            break;
          case 3:
            ledFadeTo[0] = offValue;
            ledFadeTo[1] = onValue;
            ledFadeTo[2] = offValue;
            break;
          case 4:
            ledFadeTo[0] = offValue;
            ledFadeTo[1] = offValue;
            ledFadeTo[2] = offValue;
            break;
          case 5:
            ledFadeTo[0] = onValue;
            ledFadeTo[1] = offValue;
            ledFadeTo[2] = onValue - 200;
            break;
          case 6:
            ledFadeTo[0] = offValue;
            ledFadeTo[1] = offValue;
            ledFadeTo[2] = offValue;
            break;
          case 7:
            ledFadeTo[0] = offValue;
            ledFadeTo[1] = offValue;
            ledFadeTo[2] = onValue - 200;
            break;
          case 8:
            ledFadeTo[0] = offValue;
            ledFadeTo[1] = offValue;
            ledFadeTo[2] = offValue;
            break;
          case 9:
            ledFadeTo[0] = onValue;
            ledFadeTo[1] = onValue;
            ledFadeTo[2] = offValue;
            break;
          case 10:
            ledFadeTo[0] = offValue;
            ledFadeTo[1] = offValue;
            ledFadeTo[2] = offValue;
            break;
          case 11:
            ledFadeTo[0] = offValue;
            ledFadeTo[1] = onValue;
            ledFadeTo[2] = onValue - 200;
            break;
          case 12:
            ledFadeTo[0] = offValue;
            ledFadeTo[1] = offValue;
            ledFadeTo[2] = offValue;
            break;
          default:
            break;
        }
    }
    
    //analog writes the current value to all five colors
    for(int i = 0; i < ARRAY_LED_COUNT; i++)  
      analogWrite(ledPin[i], ledCurrentVal[i]);
    
    prevMs = currentMs;   //updates previous time
  }
}

void setupWifi()
{
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, wifiPass);   //connecting to wifi
  
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

  WiFi.config(ip, gateway, subnet);   //config for static connection
}
