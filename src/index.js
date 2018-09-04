// Fix for react-native
if (!global.self) {
    global.self = global;
}

const events = require('events');
global.tokiumEvents = global.tokiumEvents || new events.EventEmitter();

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyASn4mvQQjAAe5IvsWYEUQcI1odtUsIZHU",
    authDomain: "blockchain-tokens.firebaseapp.com",
    databaseURL: "https://blockchain-tokens.firebaseio.com",
    projectId: "blockchain-tokens"
};

// Init Firebase and Firestore
import '@firebase/firestore';
import '@firebase/auth';
import firebase from '@firebase/app';

global.firebase = firebase;

firebase.initializeApp(FIREBASE_CONFIG);

// Init DB.
global.db = firebase.firestore();
const settings = { timestampsInSnapshots: true };
db.settings(settings);

let Asset = require('./libs/asset.js');
let Profile = require('./libs/profile.js');
let Transaction = require('./libs/transaction.js');
let Wallet = require('./libs/wallet.js');
let Tools = require('./libs/tools.js');

module.exports = {
    Asset:          Asset,
    Profile:        Profile,
    Transaction:    Transaction,
    Wallet:         Wallet,
    Tools:          Tools,
    currentUser:    new Profile()
};
