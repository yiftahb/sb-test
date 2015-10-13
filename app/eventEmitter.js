var EventEmitter = require('events').EventEmitter
    , emitter = new EventEmitter();

// Export the eventEmitter for global use
exports.emitter = emitter;