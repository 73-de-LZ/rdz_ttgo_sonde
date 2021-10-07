# Prerequisites

## Arduini IDE

Get the latest Arduino IDE software from arduino.cc/en/Main/Software

## ESP32 support

File -> Preferences  (or Arduino -> Preferences on MacOS)

go to "Additional Board Manager URLs"

Add *https://dl.espressif.com/dl/package_esp32_index.json* and press oK


Tool -> Boad -> Boards Manager

search for "esp32"

Install "esp32 by Espressif Systems"

## ESP32 Flash Filesystem Upload support

Get the zip file of the latest release from 
https://github.com/me-no-dev/arduino-esp32fs-plugin/releases/

Unzip the content to the tools folder of your Arduino IDE (~/Documents/Arduino/tools on MacOS,
similar on other OS) and restart IDE

## Additional libraries

Select Tools -> Manage Libraries...

Install "U8g2"

Install "MicroNMEA"

(Install "TFT_22_ILI9225" -- currently not needed, due to some issues with the official library, there is a modified version in the rdz_ttgo_sonde source tree)

## Additional libraries, part 2

From https://github.com/me-no-dev/ESPAsyncWebServer select "Download ZIP", extract to the libraries
folder of your Arduino IDE (~/Documents/Arduino/libraries on MacOS), rename main folder to ESPAsyncWebServer
(remove the "-master")

From https://github.com/me-no-dev/AsyncTCP select "Download ZIP", extract to the libraries folder
of your Arduino IDE, and rename main folder to AsyncTCP

From https://github.com/lewisxhe/AXP202X_Library select "Download ZIP", extract to the libraries
folder of your Arduino IDE, and rename main folder to AXP202X_Library-1.0

From https://github.com/dx168b/async-mqtt-client select "Download ZIP", extract to the libraries
folder of your Arduino IDE, and rename main folder to async-mqtt-client

## Additional libraries, part 3

Copy the SX1278FSK, SondeLib and fonts folders from libraries of this project to your Arduino IDE's libraries
folders, or, alternatively, create symbolic links (MacOS/Linux):

```
cd ~/Documents/Arduino/libraries
ln -s <whereyouclonedthegit>/rdz_ttgo_sonde/libraries/SondeLib/ .
ln -s <whereyouclonedthegit>/rdz_ttgo_sonde/libraries/SX1278FSK/ .
ln -s <whereyouclonedthegit>/rdz_ttgo_sonde/libraries/fonts/ .
```

Restart the Arduino IDE

(symbolic links are the preferred way, otherwise you have to copy the the libraries again after
each update)

## Final steps

In the IDE Tools -> Board: ->
Select "TTGO LoRa32-OLED v1" (or something that fits your board.
The binary images are currently built with the "T-Beam" board selection)

Compile and Upload code

Upload data to SPIFFS with Tools -> ESP32 Sketch Data Upload



