#include <Arduino_JSON.h>


#define TEMP_MAX 40
#define TEMP_MIN 20
#define LED_R 7
#define LED_Y 8

float temp_curr = 20.0;
float temp_inc;
bool isAsc = true;
bool rState = false;
bool yState = false;


unsigned long startMillis;
unsigned long currentMillis;
const unsigned long period = 2000;  //the value is a number of milliseconds, ie 1 second

String inSerial;



void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  randomSeed(analogRead(0)); // nothing connected to 0 so read sees noise
  pinMode(LED_R, OUTPUT);
  pinMode(LED_Y, OUTPUT);
  startMillis = millis();  //initial start time
}

void loop() {
  // put your main code here, to run repeatedly:

  currentMillis = millis();  //get the current "time" (actually the number of milliseconds since the program started)
  if (currentMillis - startMillis >= period)  //test whether the period has elapsed
  {
    sendUpdate();
    startMillis = currentMillis;  //IMPORTANT to save the start time of the current LED state.
  }

  inSerial = Serial.readString();// read the incoming data as string
  if (inSerial != "")
    procInSerial(inSerial);

}

void sendUpdate() {
  temp_inc = (float)random(0, 150) / 100;

  if (isAsc) {
    temp_curr = temp_curr + temp_inc;
  }
  else {
    temp_curr = temp_curr - temp_inc;
  }

  if (temp_curr > TEMP_MAX)
    isAsc = false;
  else if (temp_curr < TEMP_MIN)
    isAsc = true;

  // SEND update back

  JSONVar myDevice;

  myDevice["LED_R"] = rState;
  myDevice["LED_Y"] = yState;
  myDevice["Temperature"] = temp_curr;
  Serial.println(myDevice);  
}

void procInSerial(String inSerial) {
  //{"LED_R":false,"LED_Y":false,"Temperature":20.22}
  
  JSONVar myObject = JSON.parse(inSerial);

  if (myObject.hasOwnProperty("LED_R")) {
    rState = (bool) myObject["LED_R"];
    digitalWrite(LED_R,rState);
  }

  if (myObject.hasOwnProperty("LED_Y")) {
    yState = (bool) myObject["LED_Y"];
    digitalWrite(LED_Y,yState);
  }

  sendUpdate();

}
