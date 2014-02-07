/**
Copyright 2013 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
**/
'use strict';

/* jshint unused: false */
function RegistrationController() {

    var deviceController = new DeviceController();
    var config = new DeviceLabConfig();

    this.registerDeviceWithLab = function(idToken, success, error) {
        console.log('registerDeviceWithLab()');
        if(typeof gcmlaunchbrowser === 'undefined') {
            error('The GCM Launch Browser plugin hasn\'t been installed');
        }

        gcmlaunchbrowser.getRegistrationId(function(args) {
            // Success Callback
            registerWithBackEnd(idToken, args.regId, success, error);
        }, function(errMsg) {
            // Error Callback
            if(typeof errMsg === 'undefined' || !errMsg) {
                errMsg = 'An unknown error occurred while setting up push notifications.';
            }
            error(errMsg);
        });
    };

    function registerWithBackEnd(idToken, regId, successCb, errorCb) {
        console.log('registerWithBackEnd()');
        deviceController.getDevice(function(device) {
            // Success Callback

            // Use the auth token to do an XHR to get the user information.
            var xhr = new XMLHttpRequest();
            xhr.open('POST', config.url+'/devicelab/devices/register/', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

            
            xhr.onreadystatechange = getXHRHandler(device, successCb, errorCb);

            var paramString = 'id_token='+encodeURIComponent(idToken)+
                '&gcm_id='+regId+
                '&device_name='+encodeURIComponent(device.name)+
                '&device_nickname='+encodeURIComponent(device.nickname)+
                '&platform_id='+encodeURIComponent(device.platformId)+
                '&platform_version='+encodeURIComponent(device.platformVersion);
            if(typeof device.deviceId !== 'undefined' && device.deviceId !== null) {
                paramString += '&device_id='+encodeURIComponent(device.deviceId);
            }

            xhr.send(paramString);
        }, function(err){
            /*jshint unused:false*/
            // Error  Callback
            errorCb(err);
        });

        
    }

    function getXHRHandler(device, successCb, errorCb) {
        return function(e) {
            /*jshint sub:true, unused:false*/
            if (this.readyState === 4) {
                if(this.status !== 200) {
                    console.log('registration-controller: xhr error msg = '+this.responseText);
                    errorCb(this.responseText);
                    return;
                } else {
                    var data = JSON.parse(this.responseText);
                    device.deviceId = data['device_id'];
                    successCb(device);
                }
            }
        };
    }

}