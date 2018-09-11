import { eventsEmitter } from './utils/services.js';
import * as Tools from './libs/tools.js';
import Wallet from './libs/wallet.js';
import Transaction from './libs/transaction.js';
import Asset from './libs/asset.js';
import Profile from './libs/profile.js';

const on = (...args) => {
    eventsEmitter.on(...args);
};

module.exports = {
    Asset:          Asset,
    Profile:        Profile,
    Transaction:    Transaction,
    Wallet:         Wallet,
    Tools:          Tools,
    currentUser:    new Profile(),
    on:             on
};
