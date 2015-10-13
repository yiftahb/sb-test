"use strict";

var controllers = angular.module('htmlParser.controllers', ['angularFileUpload']);

// The controller that handles the file upload
controllers.controller("UploadController", function($scope, FileUploader, parserAPI) {
    // Error msg
    $scope.error = '';

    // The Uploader object
    $scope.uploader = new FileUploader({
        url: '/api/upload',
        alias: 'urlFile'
    });

    // The completed event
    $scope.uploader.onCompleteItem = function(item, response, status) {
        if(status === 200) {
            // Success
            $scope.error = '';
            // Let's reload the data
            parserAPI.getFileData();
        } else {
            $scope.error = response.error;
        }
    };

    // The button click function
    $scope.uploadFile = function() {
        $scope.uploader.uploadAll();
    }
});

// The main controller for viewing the data
controllers.controller("FilesController", function($scope, $rootScope, parserAPI, notifyOnParse) {
    // The files object
    $scope.files = [];

    // The current data being viewed
    $scope.currentData = 0;

    // Let's handle if the data loaded was empty
    $rootScope.$on('dataEmpty', function() {
        $scope.files = [];
    });

    // Let's listen to the file get data event
    $rootScope.$on('dataLoaded', function(event, response) {
        var data = response[0], status = response[1];
        if(status === 200) {
            // Success
            $scope.files = data;
        }
    });

    // Delete file button click
    $scope.deleteFile = function(id) {
        // Delete the file using the api, on success, get the data again
        parserAPI.deleteFile(id).success(function() {
            parserAPI.getFileData();
        });
    }

    // Refresh the data, just get it again
    $scope.refreshData = function() {
        parserAPI.getFileData();
    }

    // Re parse the data
    $scope.reparseData = function() {
        parserAPI.reparseData();
    }

    // Opens the right data
    $scope.toggleData = function(id) {
        if($scope.currentData === id) $scope.currentData = 0;
        else $scope.currentData = id;
    }

    // Initiate the controller, go fetch the data.
    var init = function() {
        parserAPI.getFileData();
    };

    init();
});