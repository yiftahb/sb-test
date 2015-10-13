"use strict";

var services = angular.module('htmlParser.services', ['ngWebSocket']);

// A service that communicates with the parser api
services.factory('parserAPI', function($http, $rootScope) {
    // The service object
    var parserAPI = {
        // Let's delete this item
        deleteFile: function (id) {
            return $http.get('/api/delete/' + id);
        },

        // Let's get the data
        getFileData: function () {
            // Make the ajax call
            $http.get('/api/get').success(function(data, status, headers) {
                // Fire the dataLoaded event
                $rootScope.$emit('dataLoaded', [data, status, headers]);
            }).error(function() {
                $rootScope.$emit('dataEmpty');
            });
        },

        // Let's send a raparse request to the server, when it will be done, we'll get a message through the websocket
        reparseData: function () {
            return $http.get('/api/reparse');
        }
    };

    // Return it
    return parserAPI;
});

// A WebSocket service that lets the application know when the parsing was done
services.factory('notifyOnParse', function($websocket, parserAPI) {
    // Open a WebSocket connection
    var ws = $websocket('ws://127.0.0.1:3000/parserDone');

    // On message, refresh
    ws.onMessage(function(message) {
        if(message.data === "done") parserAPI.getFileData();
    });

    return {};
});