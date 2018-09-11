'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.eventsEmitter = exports.firestore = exports.firebase = undefined;

require('@firebase/firestore');

require('@firebase/auth');

var _app = require('@firebase/app');

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var events = require('events');
var tokiumEvents = new events.EventEmitter();

var FIREBASE_CONFIG = {
    apiKey: 'AIzaSyASn4mvQQjAAe5IvsWYEUQcI1odtUsIZHU',
    authDomain: 'blockchain-tokens.firebaseapp.com',
    databaseURL: 'https://blockchain-tokens.firebaseio.com',
    projectId: 'blockchain-tokens'
};

// Init Firebase and Firestore


_app2.default.initializeApp(FIREBASE_CONFIG);

// Init tokiumFirestore.
var tokiumFirestore = _app2.default.firestore();
var settings = { timestampsInSnapshots: true };
tokiumFirestore.settings(settings);

var firebase = exports.firebase = _app2.default;
var firestore = exports.firestore = tokiumFirestore;
var eventsEmitter = exports.eventsEmitter = tokiumEvents;