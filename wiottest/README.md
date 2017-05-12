
# Introduction

This Mobile Application (Ionic 1.x) is used to demonstrate a use case whit Watson IoT Platform. An oven simulated by this application sends events to different topic when door is open/close, start/stop and cooking.

# Prepare your environment 

1. Install cordova and ionic 1.7 framework

``` 
   npm install -g cordova@6.5 ionic@1.7.6 
```

1. Test installation

```
  cordova -v
  6.5
 
  ionic -v
  1.7.6
```

1. Check IoT Platform parameter (Device ID, OrgID, Auth ... ) in the www/js/controllers.js file.
These informations are provided by IoT Dashborad when you registered a Device

```
    .constant('iotplatformConfig', {
      OrganizationID: "YOUR_OrgID",
      DeviceType: "YOUR_DeviceTYPE",
      DeviceID: "YOUR_DeviceID",
      AuthenticationMethod: "use-token-auth",
      AuthenticationToken: "YOUR_TOKEN",
      port: "443" //WebSocket Port
    })

```



# Simulate the application in a navigator

Use `ionic serve` to test the application in a browser

```
    cd wiottest
    ionic serve
```

You can show the application opened in your default navigator
clic button *Connect* to connect to MQTT Broker exposed by Watson IoT Platform

Button Open/Close Door publish message in a topic.

# Emulate the Mobile App with a Android device emulator
 
 If you want, you can emulate you app in a emulator. In this sample we are going to use Android Emulator.
 
## Install Android SDK
 
  If Android SDK is not installed, use the following steps to install it (Example for linux)
 
  ```
   wget http://dl.google.com/android/android-sdk_r24.4.1-linux.tgz
   tar -xzvf android-sdk_r24.4.1-linux.tgz

   cd android-sdk-linux
   cd tools

   echo y | ./android update sdk -u -a -t "tools","platform-tools","build-tools-23.0.3","android-23","sys-img-x86_64-android-23","sys-img-x86_64-google_apis-23"
  
  ```
  Add **android-sdk-linux/tools/android** in the **PATH** of your operating system
  
 For linux only :
 
  ```
   sudo apt-get install -y lib32gcc1 libc6-i386 lib32z1 lib32stdc++6
   sudo apt-get install -y lib32ncurses5 lib32gomp1 lib32z1-dev
  ```

## Configure Android virtual device
 
 
 1. Configure virtual device with the following command :
 
 ```
 android avd
 ```
 Click **Create** Use the following value :
 
 ```
 avd name = avd1
 Device = nexus 5
 Target = Android 6.0
 cpu = intel atom x86_64
 skin = noskin
 Front camera = none
 Back Camera = none 
 RAM 512 vm 64
 ```
 1. And click **OK**
 
## Launch the Mobile App with in the Android Virtual Device Emulator
 
 1. In the **wiottest** folder, enter the following command :
 
 ```
 cordova platform add android
 ``` 
 and
 
 ```
 ionic run android
 ```

Please wait a few time. Simulator is launched and app too.
 
 
>Note : If the launch is too long. Don't close the emulator, Stop the command `Ionic run android` with Ctrl+C and launch the command again.