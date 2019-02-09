#include <SoftwareSerial.h>

int redPin = 9;
int bluPin = 11;
int greenPin = 10;
int elwire = 3;
String msg = "";
char data;
int redValue;
int bluValue;
int greenValue;
boolean isFading = false;
SoftwareSerial mySerial(5, 6); // RX, TX

void setup() {
  
  mySerial.begin(9600);
  Serial.begin(57600);
  pinMode(redPin, OUTPUT);
  pinMode(bluPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  Serial.println("connection initiated");
}

void loop() {
  while (mySerial.available() > 0){
    data = mySerial.read();
    if (data == '+'){
      break;
    } else if ( data == '>' ){
      Serial.println("message "+msg);
        if (msg.length() > 3 ){ 
        redValue = msg.substring(0,3).toInt();
        greenValue = msg.substring(4,7).toInt();
        bluValue = msg.substring(8).toInt();
        Serial.println("r:"+msg.substring(0,3)+" g:"+msg.substring(4,7)+" b:"+msg.substring(8));
        analogWrite(redPin, redValue);
        analogWrite(bluPin, bluValue);
        analogWrite(greenPin, greenValue);
        } else {
          if (msg == "fdi") {
            Serial.println("fade on");
            isFading = true;
          } else if (msg == "fdo"){
            Serial.println("fade off");
            isFading = false;
          } else if (msg=="eli"){
            analogWrite(elwire, 255);
            Serial.println("elwire on");
          } else if (msg=="elo"){
            analogWrite(elwire, 0);
            Serial.println("elwire off");
          }
        }
      break;
    } else if ( data == '<' ) {
      msg = "";
    } else {
      msg += data;
    }
  }

  if (isFading){
    fade();
    delay(50); 
  }
}

void fade(){
  if (redValue > 0 && bluValue == 0) {
      redValue--;
      greenValue++;
  }
  if (greenValue > 0 && redValue == 0) {
      greenValue--;
      bluValue++;
  }
  if (bluValue > 0 && greenValue == 0) {
      redValue++;
      bluValue--;
  }
  analogWrite(redPin, redValue);
  analogWrite(bluPin, bluValue);
  analogWrite(greenPin, greenValue);
}

