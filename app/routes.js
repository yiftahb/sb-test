var controllers = require('./controllers'); // Include the controllers file which will handle all the business logic

module.exports = {
    init: function (app, upload) {
        // The HTTP routes
        app.get('/api/delete/:id', controllers.deleteController); // deletes an item
        app.get('/api/get', controllers.getController); // Gets the data, if exists
        app.get('/api/reparse', controllers.reparseController); // Refreshes the data, if exists
        app.post('/api/upload', upload.single('urlFile'), controllers.uploadController); // Uploads a file

        // The WS routes
        app.ws('/parserDone', controllers.parserDone);
    }
};