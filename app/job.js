var parser = require('./parser'), // Get the parser module
    db = require('./db'); // Get the db module

module.exports = {
    run: function() {
        // Check if it's currently running
        if(parser.isWorking()) return false;

        // Show that it's running
        console.log("Running the parser...");

        // Raise the working flag
        parser.working = true;

        // Get the urls and parse them
        db.selectUrls(function(urls) {
            if(!urls || urls.length === 0) {
                parser.working = false; // Done working
                return;
            }

            // Append urls to the global variable
            urls.forEach(function(url) {
                parser.urls.push(url.url);
            });

            // We have data, make an http request to each one
            parser.parseUrls(urls);
        })
    }
};