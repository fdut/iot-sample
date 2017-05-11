angular.module('app.controllers', [])

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
    function ($scope, $stateParams, sharedUtils, iotplatformConfig) {

      // Four variable
      var fourState = false;


      /*--------------------------------MQTT---------------------------*/
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

        client.onConnectionLost = onConnectionLost;

        var options = {
          userName: iotplatformConfig.AuthenticationMethod,
          password: iotplatformConfig.AuthenticationToken,
          timeout: 10,
          useSSL: true,
          onSuccess: onConnect,
          onFailure: doFail
        };


        if (!isConnected) {
          console.log("TXSS", options);
          client.connect(options);
        };
      };

      function onConnect() {
        console.log("Connected with Success");
        isConnected = true;
        $scope.infotxt = "Is Connected";
        $scope.btnconnect = false;
        $scope.$apply();
      }

      function doFail(e) {
        console.log("Error", e);
        sharedUtils.showAlert("Configuration Error", "Check if the port is for web-socket!");
        isConnected = false;
        //setTimeout($scope.MQTTconnect, reconnectTimeout);
      }

      // called when the client loses its connection
      function onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
          console.log("onConnectionLost:" + responseObject.errorMessage);
          isConnected = false;
          $scope.btnconnect = false;
          sharedUtils.hideLoading();
          setTimeout($scope.MQTTconnect, reconnectTimeout);
        }
      }
      /*--------------------------------END OF MQTT CONNECT ---------------------------*/

      function MQTTpublish(topic, title, msg) {

        console.log("PING");
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
          message.destinationName = "PING";
          try {
            client.send(message);
            console.log("[%s] Published", new Date().getTime());
            $scope.infotxt = "[%s] Published";
          } catch (err) {
            console.error(err);
            isConnected = false;
          }
        }

      }

      /*--------------------------------END OF MQTT PUBLISH ---------------------------*/
      $scope.startFour = function () {

        console.log("startFour --");

        if (fourState) {
          MQTTpublish("ping", "off", "Four off");
          console.log("ping-off-four off");
          $scope.btnOnOff= "Marche";
          fourState = false;
        } else {
          MQTTpublish("ping", "on", "Four on")
          console.log("ping-on-four on");
          $scope.btnOnOff= "Arrêt";
          fourState = true;
        }

      }







    })