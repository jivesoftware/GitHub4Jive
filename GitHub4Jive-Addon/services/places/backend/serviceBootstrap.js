/*
 * Copyright 2014 Jive Software
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

var libDir = process.cwd() + "/lib/";
var placeStore = require(libDir + "github4jive/placeStore");

/*
 * Start all event handlers for all places when the service starts
 */
exports.onBootstrap = function () {
    placeStore.getAllPlaces().then(function (places) {
        places.forEach(updatePlace);
    });
};

