const events = require('events');
const tokiumEvents = new events.EventEmitter();

const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyASn4mvQQjAAe5IvsWYEUQcI1odtUsIZHU',
    authDomain: 'blockchain-tokens.firebaseapp.com',
    databaseURL: 'https://blockchain-tokens.firebaseio.com',
    projectId: 'blockchain-tokens'
};

// Init Firebase and Firestore
import '@firebase/firestore';
import '@firebase/auth';
import tokiumFirebase from '@firebase/app';

tokiumFirebase.initializeApp(FIREBASE_CONFIG);

// Init tokiumFirestore.
const tokiumFirestore = tokiumFirebase.firestore();

export const firebase = tokiumFirebase;
export const firestore = tokiumFirestore;
export const eventsEmitter = tokiumEvents;