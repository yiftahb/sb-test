var config = require('config'), // Use for config parsing
    express = require('express'), // Express framework
    job = require('./app/job') // The job object
    multer = require('multer'), // Use multer to upload the url file
    parser = require('./app/parser'), // Handles the HTML parsing
    routes = require('./app/routes'), // Handle routes in another file
    schedule = require('node-schedule'), // The schedule object
    upload = multer({dest:'./tmp'}); // The upload object

// The express application
var app = express();

// Instantiate the websocket instance
require('express-ws')(app);

// Configure the middleware
app.use(express.static('public'));

// Initiate the routes
routes.init(app, upload);

// Let's start the parser schedule
schedule.scheduleJob(config.parser.every, job.run);

// Start the server
var server = app.listen(config.server.port, config.server.ip, function () {
    console.log('Listening at http://%s:%d', config.server.ip, config.server.port);
});