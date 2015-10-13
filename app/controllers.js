var db = require('./db'), // Require the db wrapper
    eventEmitter = require('./eventEmitter'), // Require the events object for the websocket
    fs = require('fs'), // The filesystem module
    job = require('./job'), // Require the job, it runs the parser
    parser = require('./parser'), // Require the html parser
    validUrl = require('valid-url');// A url validator, trash is not welcome in our db

module.exports = {
    deleteController: function(req, res) {
        var id = req.params.id
        console.log('Got a /api/delete call on ' + id);
        //Let's delete the file
        db.deleteFileRow(id, function(success) {
            return success ? successResponse(res) : errorResponse(res, 400, "Cannot delete this file")
        });
    },

    getController: function(req, res) {
        console.log('Got a /api/get call');
        // Let's get all the data
        db.selectAll(function(data) {
            // Return an error
            if(!data) return errorResponse(res, 400, "Could not fetch data");

            // Check if there is any data
            if(data.length === 0) return errorResponse(res, 404, "No data found");

            // Let's organize the data before we send it back
            var returnData = {};

            data.forEach(function(item) {
                if(typeof(returnData[item.file_id]) === "undefined") {
                    // Need to create the root node
                    returnData[item.file_id] = {name: item.name, created_at: item.created_at, urls: []};
                }

                // Let's add the current url node
                returnData[item.file_id].urls.push({
                    id: item.id,
                    url: item.url,
                    status: item.status,
                    images: (typeof item.images !== "undefined") ? JSON.parse(item.images) : [],
                    scripts: (typeof item.scripts !== "undefined") ? JSON.parse(item.scripts) : [],
                    styles: (typeof item.styles !== "undefined") ? JSON.parse(item.styles) : [],
                    processed_at: item.processed_at
                });
            });

            // Great success
            successResponse(res, returnData);
        });
    },

    parserDoneController: function(ws, req) {
        eventEmitter.emitter.on('parserIsDone', function() {
            try {
                ws.send('done');
            } catch (e) {
                console.log("Could not send back through the socket: " + e);
            }
        });
    },

    reparseController: function(req, res) {
        console.log('Got a /api/reparse call');
        // Check if parser is working at the moment
        if(parser.isWorking()) return errorResponse(res, 400, 'Parser already working');

        // Return success
        successResponse(res);

        // Run the parser
        job.run();
    },

    uploadController: function(req, res) {
        console.log('Got a /api/upload call');
        // Check if the file is a text file
        if(typeof req.file === "undefined") return errorResponse(res, 400, 'A .txt file was not supplied');
        else if(req.file.mimetype !== 'text/plain') return errorResponse(res, 400, 'The file must be a .txt file');

        // Read the uploaded file
        fs.readFile(req.file.path, function(err, data) {
            if(err) return errorResponse(res, 400, 'Could not upload file');

            // Split urls to an array
            var urls = data.toString().split('\r\n');

            // Check if there are urls
            if(urls.length === 0) return errorResponse(res, 400, 'No urls were supplied');

            // Add the file to the db and get its id
            db.insertFileRow(req.file.originalname, function(fileId) {
                // Check if it was successful
                if(!fileId) return errorResponse(res, 400, 'Could not add this file to the database');

                // Validate the urls
                var validatedUrls = [];
                urls.forEach(function(url) {
                    if(validUrl.isUri(url)) validatedUrls.push(url);
                });

                // Insert the url rows
                db.insertUrlRows(fileId, validatedUrls, function(response) {
                    // Check if it was successful
                    if(!response) return errorResponse(res, 400, 'Could not add the urls to the database');

                    // Let's send a success response
                    successResponse(res);

                    // OK, all is done, let's start parsing!
                    job.run();

                });
            });
        });

        // Delete the uploaded file
        fs.unlink(req.file.path);
    }
};

// A basic json response
var jsonResponse = function(res, code, data) {
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
};

// An error json response
var errorResponse = function(res, code, error) {
    jsonResponse(res, code, {error:error});
};

// A successful json response
var successResponse = function(res, msg) {
    if (typeof msg === "undefined") msg = {};
    jsonResponse(res, 200, msg);
};