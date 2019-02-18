//-----------WiFi Settings-----------
#include <ESP8266WiFi.h>
const char* ssid = "your router";      
const char* wifiPass = "hunter2";    
WiFiServer server(80);
//the three next lines are for static IP configuration
//if you activate this remember to uncomment the WiFi.config line in the setupWifi() function
IPAddress ip(192,168,0,10);       //static IP adress of device 
IPAddress gateway(192,168,0,1);   //gateway
IPAddress subnet(255,255,255,0);  //network mask

//----------NTP Time Settings-----------
#include <TimeLib.h>
#include <WiFiUdp.h>
const int timeZone = 1;     //time zone +/-GMT
static const char ntpServerName[] = "utcnist.colorado.edu"; // NTP Server
WiFiUDP Udp;
unsigned int localPort = 8888;  // local port to listen for UDP packets
time_t getNtpTime();
String digitalClockDisplay();
String printDigits(int digits);
void sendNTPpacket(IPAddress &address);
time_t prevDisplay = 0; // when the digital clock was displayed
const int NTP_PACKET_SIZE = 48; // NTP time is in the first 48 bytes of message
byte packetBuffer[NTP_PACKET_SIZE]; //buffer to hold incoming & outgoing packets
bool ntpComplete = false;   //used to check if successfull time sync to ntp server
int DST = 0;         //used to signal if daylig savings time

//-----------LED Settings-----------
const int ARRAY_LED_COUNT = 5;      //3 for RGB leds, 5 for RGB + Cold and Warm leds
//arrays are set up to hold the values in the order: red blue green cold warm
const int ledPin[ARRAY_LED_COUNT] = {14, 13, 12, 5, 4}; //D5 D7 D6 D1 D2 on weMos d1 mini
int ledCurrentVal[ARRAY_LED_COUNT] = {0, 0, 0, 0, 0};   //the current value of leds
int ledFadeTo[ARRAY_LED_COUNT] = {0, 0, 0, 0, 0};       //the final value leds are fading towards

//-----------Timer Settings-----------
#include <TimeAlarms.h>
bool timer1On = false, timer2On = false, timer3On = false, timer4On = false;
int timer1Values[ARRAY_LED_COUNT] = {0, 0, 0, 0, 0};    //saved led values for timer 1
int timer2Values[ARRAY_LED_COUNT] = {0, 0, 0, 0, 0};
int timer3Values[ARRAY_LED_COUNT] = {0, 0, 0, 0, 0};
int timer4Values[ARRAY_LED_COUNT] = {0, 0, 0, 0, 0};

//-----------Other Variables-----------
#include <EEPROM.h>
unsigned long standardDelay = 1, fadeDelay = standardDelay, longDelay = 160;   //delays used for fading lights
unsigned long currentMs = 0, prevMs = 0;    //loop time variables
int switchFade = 0, fadeCounter = 0;        //used for fading softly between rgb colors
unsigned long wifiReboot = 0;     //used to reboot server after 8 hour continous up time

void setup() 
{
  Serial.begin(115200);

  EEPROM.begin(29);    //max 512 bytes
  delay(10);
  readEEPROM();       //read already stored variables from eeprom
  
  for(int i = 0; i < ARRAY_LED_COUNT; i++)    
    pinMode(ledPin[i], OUTPUT);           //sets all led pins as output

  setupWifi();    //setting up and connecting to wifi

  Serial.println("waiting for NTP sync");
  for(int i = 0; i < 5; i++)    //tries to connect to time server. tries up to five times if unsuccessfull
  {
    if(!ntpComplete)    //if ntp time sync has not yet happened successfully
    {
      setSyncProvider(getNtpTime);
      delay(50);
    }
    else 
      break;    //go out of for loop if ntp time sync was successfull
  }
  setSyncInterval(300);

  delay(10);
  readEEPROM();       //this function needs to be called two times to properly get all information
  
}

void loop() 
{ 
  incrementLights();    //if led final values have changed, this funciton fades lights up or down
  
  Alarm.delay(5);   //checks if its time for a timer function to be called
  
  //displays current synced time
  if (timeStatus() != timeNotSet) {
    if (now() != prevDisplay) { //update the display only if time has changed
      prevDisplay = now();
      Serial.println(digitalClockDisplay());
    }
  }

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
  
  client.print("Current time on microcontroller ");
  client.print(digitalClockDisplay());
  client.print("<br/>");
  client.print("Daylight savings time state: ");
  client.print(DST);
  client.print("<br/>");
  
  client.print("Timer 1: ");        //timer1
  client.print(EEPROM.read(0));    //hour
  client.print(printDigits(EEPROM.read(1)));    //minute
  client.print(" {");
  int forStart = 2;
  for(int i = forStart; i < ARRAY_LED_COUNT + forStart; i++)
  {
    if(i != ARRAY_LED_COUNT + forStart - 1)
    {
      client.print(EEPROM.read(i)*4);     
      client.print(", ");
    }
    else
    {
      client.print(EEPROM.read(i)*4); 
      client.print("}");
    }
  } 
  client.print("<br/>");
  
  client.print("Timer 2: ");
  client.print(EEPROM.read(7));    //hour
  client.print(printDigits(EEPROM.read(8)));    //minute
  client.print(" {");
  forStart = 9;
  for(int i = forStart; i < ARRAY_LED_COUNT + forStart; i++)
  {
    if(i != ARRAY_LED_COUNT + forStart - 1)
    {
      client.print(EEPROM.read(i)*4);    
      client.print(", ");
    }
    else
    {
      client.print(EEPROM.read(i)*4); 
      client.print("}");
    }
  } 
  client.print("<br/>");
  
  client.print("Timer 3: ");
  client.print(EEPROM.read(14));    //hour
  client.print(printDigits(EEPROM.read(15)));    //minute
  client.print(" {");
  forStart = 16;
  for(int i = forStart; i < ARRAY_LED_COUNT + forStart; i++)
  {
    if(i != ARRAY_LED_COUNT + forStart - 1)
    {
      client.print(EEPROM.read(i)*4);    
      client.print(", ");
    }
    else
    {
      client.print(EEPROM.read(i)*4); 
      client.print("}");
    }
  } 
  client.print("<br/>");
  
  client.print("Timer 4: ");
  client.print(EEPROM.read(21));    //hour
  client.print(printDigits(EEPROM.read(22)));    //minute
  client.print(" {");
  forStart = 23;
  for(int i = forStart; i < ARRAY_LED_COUNT + forStart; i++)
  {
    if(i != ARRAY_LED_COUNT + forStart - 1)
    {
      client.print(EEPROM.read(i)*4);      
      client.print(", ");
    }
    else
    {
      client.print(EEPROM.read(i)*4); 
      client.print("}");
    }
  } 
  client.print("<br/>");
  client.println("</html>");

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

  //manually sets all incomming colors as colors the microcontroller is going to fade towards
  if(inRequest.indexOf("/&&") != -1) //e.g. 192.168.0.63/&&R=1023G=0512B=0034C=0000W=0000
  {
    fadeDelay = standardDelay;
    switchFade = 0;
    //indices for splitting individual values from data:
    int valueIndex[5];
    valueIndex[0] = inRequest.indexOf("R=");
    valueIndex[1] = inRequest.indexOf("G=");
    valueIndex[2] = inRequest.indexOf("B=");
    valueIndex[3] = inRequest.indexOf("C=");
    valueIndex[4] = inRequest.indexOf("W=");

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

  //command used to set if daylight savings time is active or not
  if(inRequest.indexOf("/DST=") != -1) //e.g. 192.168.0.63/DST=1
  {
    DST = (inRequest.substring(inRequest.indexOf("=") + 1, inRequest.indexOf("=") + 2)).toInt();
    if(DST > 1)
      DST = 1;
    else if(DST < 0)
      DST = 0;
      
    EEPROM.write(28, DST);
    EEPROM.commit();

    //syncs and calculates time again after DST variable has been set
    ntpComplete = false;
    Serial.println("waiting for NTP sync");
    for(int i = 0; i < 5; i++)
    {
      if(!ntpComplete)
      {
        setSyncProvider(getNtpTime);
        delay(50);
      }
      else 
        break;
    }
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
    ledCurrentVal[3] = 0;
    ledCurrentVal[4] = 0;
    for(int i = 0; i < ARRAY_LED_COUNT; i++)
      ledFadeTo[i] = 0;
  }

  //sets the time, active state, and colors for all four timers
  if(inRequest.indexOf("/TIMER") != -1) //e.g. 192.168.0.63/TIMER1H=17M=55R=1023G=0512B=0034C=0000W=0000
  {
    //stores the indices of all incomming information
    int valueIndex[ARRAY_LED_COUNT+2];
    valueIndex[5] = inRequest.indexOf("H=");
    valueIndex[6] = inRequest.indexOf("M=");
    valueIndex[0] = inRequest.indexOf("R=");
    valueIndex[1] = inRequest.indexOf("G=");
    valueIndex[2] = inRequest.indexOf("B=");
    valueIndex[3] = inRequest.indexOf("C=");
    valueIndex[4] = inRequest.indexOf("W=");

    //converts hour and minute to integers
    int inHour = (inRequest.substring((valueIndex[5] + 2), (valueIndex[5] + 4))).toInt();
    int inMinute = (inRequest.substring((valueIndex[6] + 2), (valueIndex[6] + 4))).toInt();

    if(inRequest.indexOf("/TIMER1") != -1) 
    {
      if(inHour == 99)  //timer is deactivated if hour is set equal to 99
      {
        timer1On = false;
        EEPROM.write(0, inHour);
      }
      else
      {
        for(int i = 0; i < ARRAY_LED_COUNT; i++)
          timer1Values[i] = (inRequest.substring((valueIndex[i] + 2), (valueIndex[i] + 6))).toInt();
  
        Alarm.alarmRepeat(inHour, inMinute, 0, timer1Func);   //activates timer1 function
        timer1On = true;
        //writes all variables to eeprom so they are still stored if microcontroller is powered off
        EEPROM.write(0, inHour);
        EEPROM.write(1, inMinute);
        EEPROM.write(2, (timer1Values[0]/4));   //divides value by four so max value 1023 can still be stored as one byte in eeprom
        EEPROM.write(3, (timer1Values[1]/4));
        EEPROM.write(4, (timer1Values[2]/4));
        EEPROM.write(5, (timer1Values[3]/4));
        EEPROM.write(6, (timer1Values[4]/4));
        EEPROM.commit();
      }
    }
    else if(inRequest.indexOf("/TIMER2") != -1) 
    {
      if(inHour == 99)  //meant for disabling the timer as active
      {
        timer2On = false;
        EEPROM.write(7, inHour);
      }
      else
      {
        for(int i = 0; i < ARRAY_LED_COUNT; i++)
          timer2Values[i] = (inRequest.substring((valueIndex[i] + 2), (valueIndex[i] + 6))).toInt();
  
        Alarm.alarmRepeat(inHour, inMinute, 0, timer2Func);
        timer2On = true;
        EEPROM.write(7, inHour);
        EEPROM.write(8, inMinute);
        EEPROM.write(9, (timer2Values[0]/4));
        EEPROM.write(10, (timer2Values[1]/4));
        EEPROM.write(11, (timer2Values[2]/4));
        EEPROM.write(12, (timer2Values[3]/4));
        EEPROM.write(13, (timer2Values[4]/4));
        EEPROM.commit();
      }
    }
    else if(inRequest.indexOf("/TIMER3") != -1) 
    {
      if(inHour == 99)  //meant for disabling the timer as active
      {
        timer3On = false;
        EEPROM.write(14, inHour);
      }
      else
      {
        for(int i = 0; i < ARRAY_LED_COUNT; i++)
          timer3Values[i] = (inRequest.substring((valueIndex[i] + 2), (valueIndex[i] + 6))).toInt();
  
        Alarm.alarmRepeat(inHour, inMinute, 0, timer3Func);
        timer3On = true;
        EEPROM.write(14, inHour);
        EEPROM.write(15, inMinute);
        EEPROM.write(16, (timer3Values[0]/4));
        EEPROM.write(17, (timer3Values[1]/4));
        EEPROM.write(18, (timer3Values[2]/4));
        EEPROM.write(19, (timer3Values[3]/4));
        EEPROM.write(20, (timer3Values[4]/4));
        EEPROM.commit();
      }
    }
    else if(inRequest.indexOf("/TIMER4") != -1) 
    {
      if(inHour == 99)  //meant for disabling the timer as active
      {
        timer4On = false;
        EEPROM.write(21, inHour);
      }
      else
      {
        for(int i = 0; i < ARRAY_LED_COUNT; i++)
          timer4Values[i] = (inRequest.substring((valueIndex[i] + 2), (valueIndex[i] + 6))).toInt();
  
        Alarm.alarmRepeat(inHour, inMinute, 0, timer4Func);
        timer4On = true;
        EEPROM.write(21, inHour);
        EEPROM.write(22, inMinute);
        EEPROM.write(23, (timer4Values[0]/4));
        EEPROM.write(24, (timer4Values[1]/4));
        EEPROM.write(25, (timer4Values[2]/4));
        EEPROM.write(26, (timer4Values[3]/4));
        EEPROM.write(27, (timer4Values[4]/4));
        EEPROM.commit();
      }
    }
  }//end of /TIMER request handling
}//end of function reactToRequest

void readEEPROM()   //called on power on. retrieves current data stored in eeprom
{
  DST = checkReadVal(EEPROM.read(28));    //daylight savings time

  //retrieves timer variables
  int inHour1 = checkReadVal(EEPROM.read(0));
  if(inHour1 == 99)
    timer1On = false;
  else
  {
    timer1On = true;
    int inMinute1 = checkReadVal(EEPROM.read(1));
    timer1Values[0] = EEPROM.read(2)*4;
    timer1Values[1] = EEPROM.read(3)*4;
    timer1Values[2] = EEPROM.read(4)*4;
    timer1Values[3] = EEPROM.read(5)*4;
    timer1Values[4] = EEPROM.read(6)*4;
    Alarm.alarmRepeat(inHour1, inMinute1, 0, timer1Func);
  }

  int inHour2 = checkReadVal(EEPROM.read(7));
  if(inHour2 == 99)
    timer2On = false;
  else
  {
    timer2On = true;
    int inMinute2 = checkReadVal(EEPROM.read(8));
    timer2Values[0] = EEPROM.read(9)*4;
    timer2Values[1] = EEPROM.read(10)*4;
    timer2Values[2] = EEPROM.read(11)*4;
    timer2Values[3] = EEPROM.read(12)*4;
    timer2Values[4] = EEPROM.read(13)*4;
    Alarm.alarmRepeat(inHour2, inMinute2, 0, timer2Func);
  }
  
  int inHour3 = checkReadVal(EEPROM.read(14));
  if(inHour3 == 99)
    timer3On = false;
  else
  {
    timer3On = true;
    int inMinute3 = checkReadVal(EEPROM.read(15));
    timer3Values[0] = EEPROM.read(16)*4;
    timer3Values[1] = EEPROM.read(17)*4;
    timer3Values[2] = EEPROM.read(18)*4;
    timer3Values[3] = EEPROM.read(19)*4;
    timer3Values[4] = EEPROM.read(20)*4;
    Alarm.alarmRepeat(inHour3, inMinute3, 0, timer3Func);
  }

  int inHour4 = checkReadVal(EEPROM.read(21));
  if(inHour4 == 99)
    timer4On = false;
  else
  {
    timer4On = true;
    int inMinute4 = checkReadVal(EEPROM.read(22));
    timer4Values[0] = EEPROM.read(23)*4;
    timer4Values[1] = EEPROM.read(24)*4;
    timer4Values[2] = EEPROM.read(25)*4;
    timer4Values[3] = EEPROM.read(26)*4;
    timer4Values[4] = EEPROM.read(27)*4;
    Alarm.alarmRepeat(inHour4, inMinute4, 0, timer4Func);
    Serial.print("Timer set ");
    Serial.print(inHour4);
    Serial.print(":");
    Serial.print(inMinute4);
    Serial.print(" ");
    Serial.print(timer4Values[0]);
    Serial.print(" ");
    Serial.print(timer4Values[1]);
    Serial.print(" ");
    Serial.print(timer4Values[2]);
    Serial.print(" ");
    Serial.print(timer4Values[3]);
    Serial.print(" ");
    Serial.println(timer4Values[4]);
  }
}

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

//----------Individual Timer Functions-----------
void timer1Func()
{
  if(timer1On)
  {
    fadeDelay = standardDelay;
    switchFade = 0;
    for(int i = 0; i < ARRAY_LED_COUNT; i++)
      ledFadeTo[i] = timer1Values[i];
  }
}
void timer2Func()
{
  if(timer2On)
  {
    fadeDelay = standardDelay;
    switchFade = 0;
    for(int i = 0; i < ARRAY_LED_COUNT; i++)
      ledFadeTo[i] = timer2Values[i];
  }
}
void timer3Func()
{
  if(timer3On)
  {
    fadeDelay = standardDelay;
    switchFade = 0;
    for(int i = 0; i < ARRAY_LED_COUNT; i++)
      ledFadeTo[i] = timer3Values[i];
  }
}
void timer4Func()
{
  Serial.println("FUNCTION 4 CALLED");
  if(timer4On)
  {
    fadeDelay = standardDelay;
    switchFade = 0;
    for(int i = 0; i < ARRAY_LED_COUNT; i++)
      ledFadeTo[i] = timer4Values[i];
  }
}

//----------Time Support Functions-----------
time_t getNtpTime()
{
  IPAddress ntpServerIP; // NTP server's ip address

  while (Udp.parsePacket() > 0) ; // discard any previously received packets
  Serial.println("Transmit NTP Request");
  // get a random server from the pool
  WiFi.hostByName(ntpServerName, ntpServerIP);
  Serial.print(ntpServerName);
  Serial.print(": ");
  Serial.println(ntpServerIP);
  sendNTPpacket(ntpServerIP);
  uint32_t beginWait = millis();
  while (millis() - beginWait < 1500) {
    int size = Udp.parsePacket();
    if (size >= NTP_PACKET_SIZE) {
      Serial.println("Receive NTP Response");
      Udp.read(packetBuffer, NTP_PACKET_SIZE);  // read packet into the buffer
      unsigned long secsSince1900;
      // convert four bytes starting at location 40 to a long integer
      secsSince1900 =  (unsigned long)packetBuffer[40] << 24;
      secsSince1900 |= (unsigned long)packetBuffer[41] << 16;
      secsSince1900 |= (unsigned long)packetBuffer[42] << 8;
      secsSince1900 |= (unsigned long)packetBuffer[43];
      ntpComplete = true;
      return secsSince1900 - 2208988800UL + (timeZone + DST) * SECS_PER_HOUR;
    }
  }
  Serial.println("No NTP Response :-(");
  ntpComplete = false;
  return 0; // return 0 if unable to get the time
}
// send an NTP request to the time server at the given address
void sendNTPpacket(IPAddress &address)
{
  // set all bytes in the buffer to 0
  memset(packetBuffer, 0, NTP_PACKET_SIZE);
  // Initialize values needed to form NTP request
  // (see URL above for details on the packets)
  packetBuffer[0] = 0b11100011;   // LI, Version, Mode
  packetBuffer[1] = 0;     // Stratum, or type of clock
  packetBuffer[2] = 6;     // Polling Interval
  packetBuffer[3] = 0xEC;  // Peer Clock Precision
  // 8 bytes of zero for Root Delay & Root Dispersion
  packetBuffer[12] = 49;
  packetBuffer[13] = 0x4E;
  packetBuffer[14] = 49;
  packetBuffer[15] = 52;
  // all NTP fields have been given values, now
  // you can send a packet requesting a timestamp:
  Udp.beginPacket(address, 123); //NTP requests are to port 123
  Udp.write(packetBuffer, NTP_PACKET_SIZE);
  Udp.endPacket();
}
String digitalClockDisplay()
{
  String digitalClock = "";
  // digital clock display of the time
  digitalClock += hour();
  digitalClock += printDigits(minute());
  digitalClock += printDigits(second());
  digitalClock += " ";
  digitalClock += day();
  digitalClock += ".";
  digitalClock += month();
  digitalClock += ".";
  digitalClock += year();
  return digitalClock;
}
String printDigits(int digits)
{
  String returnString = "";
  // utility for digital clock display: prints preceding colon and leading 0
  returnString += ":";
  if (digits < 10)
    returnString += "0";
  returnString += digits;
  return returnString;
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
  //Serial.println(WiFi.localIP());
  Serial.println(ip);

  Serial.println("Starting UDP");
  Udp.begin(localPort);
  Serial.print("Local port: ");
  Serial.println(Udp.localPort());

  WiFi.config(ip, gateway, subnet);   //config for static connection
}
