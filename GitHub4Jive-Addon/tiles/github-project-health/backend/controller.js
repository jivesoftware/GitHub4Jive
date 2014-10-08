/*
 * Copyright 2013 Jive Software
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

var jive = require("jive-sdk");
var q = require("q");

function processTileInstance(instance, data) {
    var statusNames = [ "Poor", "Fair", "Good", "Excellent", "Outstanding" ];
    jive.logger.debug('running pusher for ', instance.name, 'instance', instance.id);

    var level = Number(instance.config.level);
  
    //TODO: CONVERT data => dataToPush
  
    var dataToPush = {
        data: {
            "message": "Simple Gauge",
            "sections": createSections(5),
            "activeIndex": level,
            "status": statusNames[level]
        }
    };

    jive.tiles.pushData(instance, dataToPush);
}

function pushData() {
    if(AnalyticsConfiguration()) {
        loadAnalyticsData().then(
            function (data) {
                jive.tiles.findByDefinitionName('github-project-health').then(function (instances) {
                    if (instances) {
                        instances.forEach(function (instance) {
                            processTileInstance(instance, data);
                        });
                    }
                });
            },
            function (errResponse) {
                //TODO:
            });
    }
} // end pushData

function AnalyticsConfiguration(){
    return jive.service.options['jive']['analytics'];
}

function loadAnalyticsData() {
  var deferred = q.defer();

  var analyticsConfig = AnalyticsConfiguration();
  var analyticsClientID = analyticsConfig['clientID'];
  var analyticsClientSecret = analyticsConfig['clientSecret'];
  var analyticsServer = analyticsConfig['server'];
  
  /*******************************************************/
  function getAccessToken() {
    var deferredToken = q.defer();
    
    var apiURL = 'https://'+analyticsServer+'/analytics/v1/auth/login?clientId='+ analyticsClientID+'&clientSecret='+analyticsClientSecret;

    jive.util.buildRequest(apiURL,'POST').then(
      //*** SUCCESS ***
      function(response) {
        deferredToken.resolve(response['entity']['body']);
      },
      //*** ERROR ***
      function(response) {
        deferredToken.reject(response['entity']['error']);
      }
    );

    return deferredToken.promise;
  };
  
  /*******************************************************/
  function getResults(accessToken) {

    var deferredResults = q.defer();
    var apiURL = 'https://'+analyticsServer+'/analytics/v1/export'+analyticsConfig['query'];

    var headers = { Authorization : accessToken };

    jive.util.buildRequest(apiURL,'GET',null,headers,null).then(
      //*** SUCCESS ***
      function(response) {
        deferredResults.resolve(response);
      },
      //*** ERROR ***
      function(response) {
        deferredResults.reject(response);
      }
    );

    return deferredResults.promise;
  };
  
  getAccessToken().then(
    function(accessToken) {
      return getResults(accessToken);
    } // end function
  ).then(
    function(response) {
      if (response.results.entity && response.results.entity.body) {
        console.log(data.results.entity.body);
        deferred.resolve(data.results.entity.body);
      } else {
        console.log('Error Retrieving Analytics Information');
        deferred.reject(response);
      } // end if
    } // end function
  );
  
  return deferred.promise;
} // end loadAnalyticsData

function createSections(numSections) {
    var sections = [];
    for (var i = 0; i < numSections; i++) {
        sections.push({
            "label": "dummy",
            "color": getSectionColor(i, numSections)
        });
    }
    return sections;
}

function getSectionColor(secIndex, numSections) {
    var maxGreen = 187,
        blueString = "00",
        red, green;
    if (secIndex < ((numSections - 1) / 2)) {
        red = 255;
        green = Math.round((255 * ((secIndex) / ((numSections - 1) / 2))));
    }
    else if (secIndex > ((numSections - 1) / 2)) {
        green = maxGreen;
        red = Math.round((255 * (1 - ((secIndex - ((numSections - 1) / 2)) / ((numSections - 1) / 2)))));
    }
    else {
        red = 220;
        green = 220;
    }

    var redString = (red < 16 ? "0" + red.toString(16) : red.toString(16)),
        greenString = (green < 16 ? "0" + green.toString(16) : green.toString(16));

    return '#' + redString + greenString + blueString;
}

/**
 * Schedules the tile update task to automatically fire every 1 hour
 */
exports.task = [
    {
        'interval' : 60000,
        'handler' : pushData
    }
];

/**
 * Defines event handlers for the tile life cycle events
 */
exports.eventHandlers = [

    // process tile instance whenever a new one is registered with the service
    {
        'event' : jive.constants.globalEventNames.NEW_INSTANCE,
        'handler' : processTileInstance
    },

    // process tile instance whenever an existing tile instance is updated
    {
        'event' : jive.constants.globalEventNames.INSTANCE_UPDATED,
        'handler' : processTileInstance
    }
];



