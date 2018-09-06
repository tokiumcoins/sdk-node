'use strict';

require('@firebase/firestore');

require('@firebase/auth');

var _app = require('@firebase/app');

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Fix for react-native
if (!global.self) {
    global.self = global;
}

var events = require('events');
global.tokiumEvents = global.tokiumEvents || new events.EventEmitter();

var FIREBASE_CONFIG = {
    apiKey: 'AIzaSyASn4mvQQjAAe5IvsWYEUQcI1odtUsIZHU',
    authDomain: 'blockchain-tokens.firebaseapp.com',
    databaseURL: 'https://blockchain-tokens.firebaseio.com',
    projectId: 'blockchain-tokens'
};

// Init Firebase and Firestore


global.tokiumFirebase = _app2.default;

tokiumFirebase.initializeApp(FIREBASE_CONFIG);

// Init tokiumFirestore.
global.tokiumFirestore = tokiumFirebase.firestore();
var settings = { timestampsInSnapshots: true };
tokiumFirestore.settings(settings);

var Asset = require('./libs/asset.js');
var Profile = require('./libs/profile.js');
var Transaction = require('./libs/transaction.js');
var Wallet = require('./libs/wallet.js');
var Tools = require('./libs/tools.js');

module.exports = {
    Asset: Asset,
    Profile: Profile,
    Transaction: Transaction,
    Wallet: Wallet,
    Tools: Tools,
    currentUser: new Profile()
};