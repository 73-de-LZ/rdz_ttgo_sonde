rdzTTGOsonde
============

This a decoder for radiosonde RS41, RS92, DFM06/09/17, M10/M20, and MP3H
based on a TTGO LoRa ESP32 board.

It supports OLED displays (SSD1306, SH1106) and TFT displays (ILI9225, ILI9341/9342).

It also supports feeding data to external applications using WiFi (NOT bluetooth):
- Android app by dl9rdz (see https://github.com/dl9rdz/rdzwx-go for apk download)
- AXUDP (for aprsmap application by oe5dxl, among others)
- KISS TNC (aprs format, mainly useful for APRSdroid app)
- MQTT
- SondeHub tracker
- Chasemapper UDP (experimental)


Please consult the Wiki at https://github.com/dl9rdz/rdz_ttgo_sonde/wiki/Supported-boards
for details on supported boards, and additional setup instructions.

NOTE: Older boards with 26 MHz crystal (TTGO LoRa32 v1, Heltec v1/v2) are not supported by newer dev/main firmware images.


### Radiosonde Support Matrix

Manufacturer | Model | Position | Temperature | Humidity | Pressure
-------------|-------|----------|-------------|----------|----------
Vaisala | RS92-SGP | :heavy_check_mark: | :heavy_check_mark: | :x: | :x:
Vaisala | RS41-SG/SGP/SGM | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: (for -SGP)
Graw | DFM06/09/17 | :heavy_check_mark: | :heavy_check_mark: | :x: | :x:
Meteomodem | M10 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | Not Sent
Meteomodem | M20 | :heavy_check_mark: | :x: | :x: | Not Sent
Meteo-Radiy | MP3-H1 (MRZ-H1) | :heavy_check_mark: | :x: | :x: | :x: 

SondeHub integration has mainly been tested with RS41 and DFM. 


Support for other radiosondes that use AFSK modulation is not feasible with the TTGO hardware.
In particular, decoding iMet-1/iMet-4 radiosondes is not practical (iMet-5x seems to use FSK,
so should be feasible to implement).

Adding support for LMS6 (see issue #48) and ims100 (see branch ims100) could be feasible,
but currently I don't have plans to do add this myself. Well-tested pull requests will of
course be considered for inclusion :-).

## Installation

You can download the latest binary automated build for the development and testing branches [here](http://rdzsonde.mooo.com/download.html), the binary includes everything including configuration files so any existing settings will be reset. 

To update an existing installation to the latest development or master version you can use the [OTA](https://github.com/dl9rdz/rdz_ttgo_sonde/wiki/Other-features#over-the-air-updates) update feature.

The downloaded .bin file can be flashed to your ESP32 board using [esptool](https://github.com/espressif/esptool) or [ESP32 Download Tool](https://www.espressif.com/en/support/download/other-tools)

### esptool

You can run the following command replacing `<filename.bin>` with the path to the downloaded .bin file. 

If you encounter errors with the device COM not automatically being detected replace `/dev/cu.SLAB_USBtoUART` with `COM<X>`.

```
esptool --chip esp32 --port /dev/cu.SLAB_USBtoUART --baud 921600 --before default_reset --after hard_reset write_flash -z --flash_mode dio --flash_freq 80m --flash_size detect 0x1000 <filename.bin>
```

### ESP32 Download Tool

The binary file can also be installed using the GUI application with the [following](http://rdzsonde.mooo.com/) settings.

## Button commands

You can use the button on the board (not the reset button, the second one) to
issue some commands. The software distinguishes between several inputs:

- SHORT	Short button press (<1.5 seconds)
- DOUBLE  Short button press, followed by another button press within 0.5 seconds
- MID	Medium-length button press (2-4 seconds)
- LONG	Long button press (>5 seconds)

You can optionally use a second button, which you have to add manually to your board.
See https://github.com/dl9rdz/rdz_ttgo_sonde/wiki/Hardware-configuration for details.


## Wireless configuration

On startup, as well as after a LONG button press, the WiFI configuration will
be started.  The board will scan available WiFi networks, if the scan results
contains a WiFi network configured with ID and Password in networks.txt, it
will connect to that network in station mode. If no known network is found, or
the connection does not suceed after 5 seconds, it instead starts in access point
mode. In both cases, the ESP32's IP address will be shown in tiny letters in the
bottom line. Then the board will switch to scanning mode.

## Scanning mode

In the scanning mode, the board will iterate over all channels configured in
channels.txt, trying to decode a radio sonde on each channel for about 1 second.
If a valid signal is found, the board switches to receiving mode on that channel.
A SHORT buttong press will also switch to receiving mode.

## Receiving mode

In receiving mode, a single frequency will be decoded, and sonde info (ID, GPS
coordinates, RSSI) will be displayed. The bar above the IP address indicates,
for the last 18 frames, if reception was successfull (|) or failed (.), or had
some errors (E), e.g., CRC check failed.
 
A DOUBLE press will switch to scanning mode.

A SHORT press will switch to the next channel in channels.txt

A SHORT press on the second button will switch to a different display screen.

## Spectrum mode

A medium press will active scan the whole band (400..406 MHz) and display a
spectrum diagram (each line == 50 kHz)
For TTGO boards without configurable button there are some new parameter in config.txt:
- spectrum=10       // 0=off / 1-99 number of seconds to show spectrum after restart
- timer=1           // 0=off / 1= show spectrum countdown timer in spectrum display
- marker=1          // 0=off / 1= show channel edge freq in spectrum display

## Setup

see [Wiki](https://github.com/dl9rdz/rdz_ttgo_sonde/wiki/Installation)

### Notes by LZ4TU
LZ4TU small modifications for the DL9RDZ rdz_ttgo_sonde project, primarily optimized for stationary operation.
How to install if you do not have PlatformIO:
1. Upload full bin from http://rdzsonde.mooo.com/download.html with ESP32 flash_download_tool, version must be with the same FFS code 
 Example "C3"  as in dev20250218-C3-full.bin
2. By the same way upload update.ino.bin from https://github.com/73-de-LZ/73-de-LZ.github.io/tree/main/dev2
3. Open webinterface of rdzTTGOsonde with browser and load http://mDNS.or.YOUR.IP/edit.html?file=upd.html save moded version
4. Copy the content of https://github.com/dl9rdz/rdz_ttgo_sonde/tree/dev2/RX_FSK/data/upd.html and paste into web editor page, than save it.
5. Copy the content of https://github.com/dl9rdz/rdz_ttgo_sonde/tree/dev2/RX_FSK/data/screens2.txt  and paste into http://mDNS.or.YOUR.IP/edit.html?file=screens2.txt, than save it.
6. Also you can restore your settings from this files: netowrks.txt, config.txt, qrg.txt, or cofigure them from the webinterface.
7. IMPORTANT! To benefit from modified version this change this settings:
   - Config>>OLED/TFT display configuration>>Screen config (0=automatic; 1-5=predefined; other=custom) = 2
   - Config>>OLED/TFT display configuration>>Display screens (scan, default, ...) = 0,1,3,4,5,6
9. Do OTA update and enjoy the mods
### Mods by LZ4TU, included in this repo, (*will be explained later, but all changes are commented in the source with LZ4TU at least):
1. Not blocking scaning algorithm.
2. Stop scaning if Landing sonde is detected.
3. Small changes in visualization and controls in "Livemap".
4. AFC refresh during landing of M10,M20 and DFM sondes.
5. Visualise and send Telemetry data received on RX1 port (needs also HW modification), not conflicting by any way if this mod is not used.

### 73!

