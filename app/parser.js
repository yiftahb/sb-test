var config = require('config'), // Get the configuration data
    db = require('./db'), // The database object
    eventEmitter = require('./eventEmitter'), // The events module
    htmlparser = require("htmlparser2"), // The html parser module
    request = require('request'); // The request module for opening http requests


module.exports = {
    working: false,

    urls: [],

    isWorking: function() {
        // Returns the current status
        return this.working;
    },

    parseUrls: function(urls) {
        var that = this;
        this.urls.forEach(function(url) {
            request(url, function (error, response, body) {
                var images = [], scripts = [], styles = [];

                // If error, we're done with this url
                if(error) return that.urlDone(url);

                // Get the images, scripts, styles data
                if (response.statusCode == 200) {
                    // Let's use html parser
                    var parser = new htmlparser.Parser({
                        onopentag: function(name, attribs){
                            if(name === "img" && typeof(attribs.src) !== "undefined"){
                                images.push(attribs.src);
                            }
                            if(name === "script" && attribs.type === "text/javascript"  && typeof(attribs.src) !== "undefined"){
                                scripts.push(attribs.src);
                            }
                            if(name === "link" && attribs.rel === "stylesheet"  && typeof(attribs.href) !== "undefined"){
                                styles.push(attribs.href);
                            }
                        }
                    }, {decodeEntities: true});
                    parser.write(body);
                    parser.end();
                }

                // Update the db record
                db.updateUrl(
                    url,
                    response.statusCode,
                    JSON.stringify(images),
                    JSON.stringify(scripts),
                    JSON.stringify(styles),
                    function(success) {
                    // We're finished with this url
                    if(success) that.urlDone(url);
                });
            })
        });
    },

    urlDone: function(url) {
        var index = this.urls.indexOf(url);

        // Remove the item
        if (index > -1) {
            this.urls.splice(index, 1);
        }

        // If all items were removed, working is done
        if(this.urls.length === 0) {
            // We're done, set working to false and trigger the event
            this.working = false;
            eventEmitter.emitter.emit('parserIsDone');
        }
    }
}