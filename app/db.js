var config = require('config'), // Get the configuration data
    mysql = require('mysql'), // Get the mysql module
    util = require('util');

// Define the connection
var connection = mysql.createConnection({
    host     : config.mysql.host,
    user     : config.mysql.user,
    password : config.mysql.password,
    database : config.mysql.database,
    dateStrings: true
});

module.exports = {
    deleteFileRow: function(file_id, cb) {
        // delete the row
        connection.query(config.query.deleteFileRow, file_id, function(err, info) {
            !err ? cb(true) : cb(false);
        });
    },

    insertFileRow: function(fileName, cb) {
        // Insert the row
        connection.query(config.query.insertFileRow, fileName, function(err, info) {
            !err ? cb(info.insertId) : cb(false);
        });
    },

    insertUrlRows: function(fileId, urls, cb) {
        // Build the insert query
        var query = buildUrlInsertQuery(config.query.insertUrlRows, fileId, urls);

        // Insert the rows
        connection.query(query, function(err) {
            !err ? cb(true) : cb(false);
        });
    },

    selectAll: function(cb) {
        // Get the data
        connection.query(config.query.selectAll, function(err, rows) {
            !err ? cb(rows) : cb(false);
        });
    },

    selectUrls: function(cb) {
        // Get the data
        connection.query(config.query.selectUrls, function(err, rows) {
            !err ? cb(rows) : cb(false);
        });
    },

    updateUrl: function(url, status, images, scripts, styles, cb) {
        // Update the url data
        connection.query(config.query.updateUrl, [status, images, scripts, styles, url], function(err) {
            !err ? cb(true) : cb(false);
        });
    }
}

// Internal module functionality
var buildUrlInsertQuery = function(query, fileId, urls) {
    urls.forEach(function(url) {
        query += util.format("(%s, '%s'),", fileId, url);
    });
    // Remove last comma and add ;
    return util.format("%s;", query.slice(0, -1));
};