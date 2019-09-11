#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// Update these with values suitable for your network.
const char* ssid = "TP-LINK";
const char* password = "123clienti";
const char* mqtt_server = "192.168.1.14";
const char* sub_topic = "led";
const char* mqtt_id = "test_wemos";

WiFiClient espClient;
PubSubClient client(espClient);
int ledPin = 0;
String switch1;
String strTopic;
String strPayload;


void setup_wifi() {
  Serial.begin(115200);
  delay(100);

  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.print(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }

  Serial.println("connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  // Get payload and convert to String
  payload[length] = '\0';
  strTopic = String((char*)topic);
  
  Serial.print("topic ");
  Serial.println(strTopic);
  
  if (strTopic == "ha/switch1") {
    switch1 = String((char*)payload);
    if (switch1 == "ON") {
      Serial.println("ON");
      digitalWrite(ledPin, HIGH);
    } else {
      Serial.println("OFF");
      digitalWrite(ledPin, LOW);
    }
  }
}


void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect(mqtt_id)) {
      Serial.println("connected");
      // Once connected, subscribe to the topic
      client.subscribe(sub_topic);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup()
{
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
}

void loop()
{
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  delay(100);
}
