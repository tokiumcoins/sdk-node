// Fix for react-native
self = global;

const events = require('events');
global.tokiumEvents = global.tokiumEvents || new events.EventEmitter();

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyASn4mvQQjAAe5IvsWYEUQcI1odtUsIZHU",
    authDomain: "blockchain-tokens.firebaseapp.com",
    databaseURL: "https://blockchain-tokens.firebaseio.com",
    projectId: "blockchain-tokens",
    storageBucket: "blockchain-tokens.appspot.com",
    messagingSenderId: "401039270457"
};

// Init Firebase and Firestore
global.firebase = require('firebase');
require('firebase/firestore');
firebase.initializeApp(FIREBASE_CONFIG);

// Init DB.
global.db = firebase.firestore();
const settings = { timestampsInSnapshots: true };
db.settings(settings);

let Asset = require('./lib/asset.js');
let Profile = require('./lib/profile.js');
let Transaction = require('./lib/transaction.js');
let Wallet = require('./lib/wallet.js');
let Tools = require('./lib/tools.js');

module.exports = {
    Asset:          Asset,
    Profile:        Profile,
    Transaction:    Transaction,
    Wallet:         Wallet,
    Tools:          Tools,
    currentUser:    new Profile()
};
