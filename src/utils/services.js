// Init Firebase and Firestore
import '@firebase/firestore';
import '@firebase/auth';
import tokiumFirebase from '@firebase/app';

const events = require('events');
const tokiumEvents = new events.EventEmitter();

const initializeApp = (firebaseConfig, appId) => {
    tokiumFirebase.initializeApp(firebaseConfig, appId);
    module.exports.firestore = tokiumFirebase.firestore();
}

module.exports = {
    firebase: tokiumFirebase,
    eventsEmitter: tokiumEvents,
    initializeApp: initializeApp
}