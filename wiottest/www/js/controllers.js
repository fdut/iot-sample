angular.module('app.controllers', [])


  /* Device Fred   

  .constant('iotplatformConfig', {
    OrganizationID: "aubf5y",
    DeviceType: "OvenSimulator",
    DeviceID: "201705100001",
    AuthenticationMethod: "use-token-auth",
    AuthenticationToken: "kEWeLLqjpbR@1yDSw5",
    //searchUrl with country name
    port: "443"
  })

 */

  /* Device Yves   */

    .constant('iotplatformConfig', {
      OrganizationID: "9mjz2e",
      DeviceType: "OvenSimulator",
      DeviceID: "201705100001",
      AuthenticationMethod: "use-token-auth",
      AuthenticationToken: "kEWeLLqjpbR@1yDSw5",
      //searchUrl with country name
      port: "443"
    })


  .controller('homeCtrl',
    function ($scope, $stateParams, $interval, $ionicPopup, sharedUtils, $timeout, iotplatformConfig) {

      $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
          if (fn && (typeof (fn) === 'function')) {
            fn();
          }
        } else {
          this.$apply(fn);
        }
      };

      // initial button value
      $scope.btn1 = {};
      $scope.btn1.label = "Start";
      $scope.Home = {};
      $scope.Home.Title = "DeviceID: " + iotplatformConfig.DeviceID;

      $scope.btnDoor = {};
      $scope.btnDoor.label = "Open Door";

      $scope.btnconnect = true;

      $scope.rangeValue = "0";
      $scope.tprelle = "0";

      // Init variable
      var fourState = false; // True for Oven started
      var doorState = false; // True for Door open





      /*--------------------------------MQTT Connect ---------------------------*/
      //MQTT variables
      var client;
      var isConnected = false;
      var reconnectTimeout = 2000;

      var iothost = iotplatformConfig.OrganizationID + ".messaging.internetofthings.ibmcloud.com"
      var clientId = "d:" + iotplatformConfig.OrganizationID + ":" + iotplatformConfig.DeviceType + ":" + iotplatformConfig.DeviceID;

      $scope.MQTTconnect = function () {

        console.log("CONNECT");
        client = new Paho.MQTT.Client(
          iothost,
          Number(iotplatformConfig.port),
          clientId //Client Id
        );

        client.onConnectionLost = $scope.onConnectionLost;

        var options = {
          userName: iotplatformConfig.AuthenticationMethod,
          password: iotplatformConfig.AuthenticationToken,
          timeout: 10,
          useSSL: true,
          onSuccess: $scope.onConnect,
          onFailure: $scope.doFail
        };
        
        topic = "iot-2/evt/sensorData/fmt/json";

        if (!isConnected) {
          console.log("TXSS", options);
          client.connect(options);
        };
      };

      $scope.onConnect = function () {
        console.log("Connected with Success");
        isConnected = true;
        $scope.infotxt = "Is Connected";
        $scope.btnconnect = false;
        $scope.safeApply();
      }

      $scope.doFail = function (e) {
        console.log("Error", e);
        sharedUtils.showAlert("Configuration Error", "Check if the port is for web-socket!");
        isConnected = false;
        //setTimeout($scope.MQTTconnect, reconnectTimeout);
      }


      var errmsg = "";
      // called when the client loses its connection
      $scope.onConnectionLost = function (responseObject) {
        if (responseObject.errorCode !== 0) {
          errmsg = responseObject.errorMessage;
          console.log("onConnectionLost:" + errmsg);
          isConnected = false;
          $scope.btnconnect = true;
          sharedUtils.hideLoading();
          //setTimeout($scope.MQTTconnect, reconnectTimeout);
          var alertPopup = $ionicPopup.alert({
            title: 'onConnectionLost',
            template: errmsg
          });
        }
      }
      /*--------------------------------END OF MQTT CONNECT ---------------------------*/

      /*--------------------------------MQTT Publish ---------------------------*/
      function MQTTpublish(topic, title, msg) {

        console.log("PUBLISH");
        if (isConnected) {
          var payload = {
            "d": {
              "id": iotplatformConfig.deviceId,
              "ts": (new Date()).getTime(),
              "title": title,
              "msg": msg
            }
          };
          var message = new Paho.MQTT.Message(JSON.stringify(payload));
          message.destinationName = "iot-2/evt/" + topic + "/fmt/json";;
          try {
            client.send(message);
            //console.log("[%s] Published", new Date().getTime());
            $scope.infotxt = "Published:" + JSON.stringify(payload);
          } catch (err) {
            console.error(err);
            isConnected = false;
          }
        }

      }

      /*--------------------------------END OF MQTT PUBLISH ---------------------------*/

      /*--------------------------------T Range  ---------------------------*/
      var ttarget = 0;

      $scope.drag = function (value) {
        ttarget = $scope.tprelle;
        $scope.tprestant = 10 + Math.abs(value - ttarget);
        //console.log(value);
      };



      /*--------------------------------Buuton Start ---------------------------*/
      $scope.startFour = function () {

        console.log("startFour --");

        if (fourState) {
          //STOP
          MQTTpublish("ping", "off", "Four off");
          console.log("ping-off-four off");
          $scope.btn1.label = "Start";
          fourState = false;
          $scope.countDown = 0;
          $scope.rangeValue = 0;
        } else {
          //START
          MQTTpublish("ping", "on", "Four on")
          console.log("ping-on-four on");
          $scope.btn1.label = "Stop";
          fourState = true;
          $scope.timerCountdown();
        }

      }

      /*--------------------------------Buuton Door ---------------------------*/
      $scope.manageDoor = function () {

        console.log("mangeDoor --");

        if (doorState) {
          MQTTpublish("ping", "close", "door closed");
          console.log("ping-close-door closed");
          $scope.btnDoor.label = "Open Door";
          // Temperature du four now
          $scope.tprelle = getRandomArbitrary(0, 150);
          doorState = false;
        } else {
          MQTTpublish("ping", "open", "door opened")
          console.log("ping-open-four opened");
          $scope.btnDoor.label = "Close Door";
          doorState = true;
        }

      }

      /*-------------------------------- Cuisson ---------------------------*/
      // Start cuisson
      $scope.countDown = 0; // number of seconds remaining
      var stop;

      $scope.timerCountdown = function () {
        // set number of seconds until the pizza is ready
        $scope.countDown = $scope.tprestant > 0 ? $scope.tprestant : 0;

        console.log("timerCountdown--");
        // start the countdown
        stop = $interval(function () {
          // decrement remaining seconds
          $scope.countDown--;
          console.log($scope.countDown);
          MQTTpublish("ping", "cooking", "cooking")
          $scope.tpsrestantxt = $scope.countDown;
          // if zero, stop $interval and show the popup
          if ($scope.countDown < 0) {
            $interval.cancel(stop);
            MQTTpublish("alarm", "alarm", "Your Pizza Is Ready");
            $scope.btn1.label = "Start";

            var alertPopup = $ionicPopup.alert({
              title: 'Your Pizza Is Ready!',
              template: 'Bon Appétit!'
            });
          }
        }, 2000, 0); // invoke every 1 second
      };


      // On renvoie un nombre aléatoire entre une valeur min (incluse) 
      // et une valeur max (exclue)
      function getRandomArbitrary(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      $scope.settings = function () {
        var alertPopup = $ionicPopup.alert({
          title: 'Current Settings',

          template: '<p>OrganizationID:'+ iotplatformConfig.OrganizationID +'<p>' +
             '<p>DeviceType: ' + iotplatformConfig.DeviceType + '</p>' +
            '<p>DeviceType: ' + iotplatformConfig.DeviceID + '</p>' +
            '<p>AuthenticationMethode: "use-token-auth"</p>' +
            '<p>AuthenticationToken: "***********"</p>'

        });
      };

    })