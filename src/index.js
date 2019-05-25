// Fix for react-native
import './utils/fix.js';

import { eventsEmitter, initializeApp } from './utils/services.js';
import * as Tools from './libs/tools.js';
import Wallet from './libs/wallet.js';
import Transaction from './libs/transaction.js';
import Asset from './libs/asset.js';
import Profile from './libs/profile.js';

const initializeTokiumApp = (firebaseConfig, appId) => {
    initializeApp(firebaseConfig, appId);
    module.exports.currentUser = new Profile();
}

const on = (...args) => {
    eventsEmitter.on(...args);
};

const off = (...args) => {
    eventsEmitter.off(...args);
};

const once = (...args) => {
    eventsEmitter.once(...args);
};

module.exports = {
    Asset,
    Profile,
    Transaction,
    Wallet,
    Tools,
    on,
    off,
    once,
    initializeApp:  initializeTokiumApp
};
