#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>
#include <PubSubClient.h>

// MQTT: ID, server IP, port, username and password
const char* WIFI_SSID = "TP-LINK";
const char* WIFI_PASSWORD = "123clienti";
const PROGMEM char* CLIENT_ID = "desk_light";
const PROGMEM char* SERVER_IP = "192.168.1.100";
const PROGMEM uint16_t SERVER_PORT = 1883;
const PROGMEM char* MQTT_USER = "rick";
const PROGMEM char* MQTT_PASSWORD = "rick";

// MQTT: topics
const char* LIGHT_STATE_TOPIC = "desk/state";
const char* LIGHT_COMMAND_TOPIC = "desk/switch";
const char* LUX_COMMAND_TOPIC = "desk/lux";
const char* LUX_STATE_TOPIC = "desk/lux/state";

// payloads by default (on/off)
const char* LIGHT_ON = "ON";
const char* LIGHT_OFF = "OFF";

// vars
const uint8_t MIN_LUX = 30;
const uint8_t BUFFER_SIZE = 5;
const uint8_t FADE_DELAY = 2;
const PROGMEM uint8_t LED_PIN = 12;
const PROGMEM uint8_t BUTTON_PIN = 0;

boolean light_state = false;
uint8_t lux = MIN_LUX;
uint8_t curr_lux = MIN_LUX;
uint8_t ha_lux = 0;
uint8_t buttonStatus;
char msg_buffer[BUFFER_SIZE];

WiFiClient wifiClient;
PubSubClient client(wifiClient);

// function called to publish the state of the light (on/off)
void publishLightState() {
  // light state
  if (light_state) client.publish(LIGHT_STATE_TOPIC, LIGHT_ON , true);
  else client.publish(LIGHT_STATE_TOPIC, LIGHT_OFF , true);
  // light brightness
  snprintf(msg_buffer, BUFFER_SIZE, "%d", ha_lux);
  client.publish(LUX_STATE_TOPIC, msg_buffer, true);
}

void setLightState() {
  // analog write to led
  publishLightState();
  if (light_state) fadeToLight(lux);
  else fadeToLight(0);
}

void fadeToLight(int fadeTo) {
  // increase brightness
  while ( fadeTo > curr_lux ) {
    curr_lux++;
    analogWrite(LED_PIN, curr_lux);
    delay(FADE_DELAY);
  }
  // decrease brightness
  while ( fadeTo < curr_lux ) {
    curr_lux--;
    analogWrite(LED_PIN, curr_lux);
    delay(FADE_DELAY);
  }
  // just in case
  analogWrite(LED_PIN, fadeTo);
}

// function called when a MQTT message arrived
void callback(char* topic, byte* p_payload, unsigned int p_length) {
  // concat the payload into a string
  String payload;
  for (uint8_t i = 0; i < p_length; i++) {
    payload.concat((char)p_payload[i]);
  }
  String p_topic = String(topic);

  // handle switch topic
  if ( p_topic == LIGHT_COMMAND_TOPIC ) {
    // test if the payload is equal to "ON" or "OFF"
    if (payload == LIGHT_ON && light_state == false) {
      light_state = true;
    } else if (payload == LIGHT_OFF && light_state == true) {
      light_state = false;
    }
    // handle brightness topic
  } else if ( p_topic == LUX_COMMAND_TOPIC) {
    uint8_t brightness = payload.toInt();
    if ( brightness < 0 || brightness > 255) return;
    else {
      lux = map(brightness, 0, 255, MIN_LUX, 255);
      ha_lux = brightness;
    }
  }
  setLightState();
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect(CLIENT_ID, MQTT_USER, MQTT_PASSWORD)) {
      Serial.println("connected");
      // Once connected, publish an announcement...
      publishLightState();
      // ... and resubscribe
      client.subscribe(LIGHT_COMMAND_TOPIC);
      client.subscribe(LUX_COMMAND_TOPIC);
    } else {
      Serial.println("");
      Serial.print("ERROR: failed, rc=");
      Serial.print(client.state());
      Serial.println("DEBUG: try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void setup() {
  // safe startup
  delay(1000);
  Serial.begin(115200);

  // init the led
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  analogWrite(LED_PIN, 150);
  buttonStatus = digitalRead(BUTTON_PIN);

  // init the WiFi connection
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.print(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }
  Serial.println("connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // init the MQTT connection
  client.setServer(SERVER_IP, SERVER_PORT);
  client.setCallback(callback);
  reconnect();

  espOTA();
  analogWrite(LED_PIN, 0);
  setLightState();
}

void espOTA() {
  ArduinoOTA.setHostname("desk");
  ArduinoOTA.onStart([]() {
    String type;
    if (ArduinoOTA.getCommand() == U_FLASH) {
      type = "sketch";
    } else { // U_SPIFFS
      type = "filesystem";
    }
    Serial.println("Start updating " + type);
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("\nEnd");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) {
      Serial.println("Auth Failed");
    } else if (error == OTA_BEGIN_ERROR) {
      Serial.println("Begin Failed");
    } else if (error == OTA_CONNECT_ERROR) {
      Serial.println("Connect Failed");
    } else if (error == OTA_RECEIVE_ERROR) {
      Serial.println("Receive Failed");
    } else if (error == OTA_END_ERROR) {
      Serial.println("End Failed");
    }
  });
  ArduinoOTA.begin();
}

void loop() {
  ArduinoOTA.handle();
  if (!client.connected()) {
    ArduinoOTA.handle();
    reconnect();
  }
  client.loop();
  if (digitalRead(BUTTON_PIN) != buttonStatus) {
    buttonStatus = digitalRead(BUTTON_PIN);
    // switch state
    light_state = !light_state;
    // if on set to 255
    if (light_state) {
      lux = 255;
      ha_lux = 255;
    }
    setLightState();
    delay(300);
  } 
  delay(100);
}
