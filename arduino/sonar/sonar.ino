/*
 * Sonar
 *
 * by chgarde for Lou Fabiloub
 */
#include <Stepper.h>

const int maxDistCentimeters = 40; // maximum distance measured.
const int scannedAngleDegrees = 120;
const int stepperSpeed = 6;
const int trigPin = 9;
const int echoPin = 10;
const int stepsPerRevolution = 2038; // change this to fit the number of steps per revolution
const int stepsPerIteration = 1;
const int maxSteps = map(scannedAngleDegrees, 0, 360, 0, stepsPerRevolution); // go reverse when hit
const long speedOfSoundMetersPerSecond = 343;
const long pulseTimeoutMicrosec = 2 * (1E6 * maxDistCentimeters / (100 * speedOfSoundMetersPerSecond)); // pulse timeout in microseconds : if the sound does not come back before, then return 0.

int direction = 1;
int stepCount = 0;

// initialize the stepper library on pins 8 through 11:
Stepper myStepper(stepsPerRevolution, 2, 4, 3, 5);

void setup()
{
  // sensor
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // set the speed at 60 rpm:
  myStepper.setSpeed(stepperSpeed);

  // initialize the serial port:
  Serial.begin(115200);
}

void sendData(int angle, int distance)
{
  Serial.print("{ ");
  Serial.print("\"angle\":");
  Serial.print(angle);
  Serial.print(",");
  Serial.print("\"distance\" : ");
  Serial.print(distance);
  Serial.println("}");
}

void takeMeasure(int stepCount)
{
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  int duration = pulseIn(echoPin, HIGH, pulseTimeoutMicrosec);
  int distance = (duration * speedOfSoundMetersPerSecond / 10000) / 2;
  int angle = map(stepCount, -maxSteps/2, maxSteps/2, -scannedAngleDegrees / 2, scannedAngleDegrees/2);

  sendData(angle, distance);
}

void loop()
{
  myStepper.step(direction * stepsPerIteration);

  stepCount=stepCount+direction;

  takeMeasure(stepCount);

  if (abs(stepCount) >= maxSteps/2)
  {
    direction = -1 * direction; // go reverse.
    //stepCount = 0;
  }
}
