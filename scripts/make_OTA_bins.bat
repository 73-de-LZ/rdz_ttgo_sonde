@echo off
setlocal
REM LZ4TU 

:: Delete old files
del *.old

:: Rename current files to .old
ren update.ino.bin update.ino.bin.old
ren update.fs.bin update.fs.bin.old
rem ren update-info.html update-info.html.old

:: Copy the new firmware file
copy "C:\Users\user\Documents\rdz_ttgo_sonde-dev2\.pio\build\ttgo-lora32\firmware.bin" update.ino.bin

:: Generate the filesystem update
py makefsupdate.py C:\Users\user\Documents\rdz_ttgo_sonde-dev2\RX_FSK\data\ >> update.fs.bin

:: Print the message with the extracted version_id
echo OTA update files created for version_id
echo put them to your host directory

pause