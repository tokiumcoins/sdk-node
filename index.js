
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

module.exports = {
    Asset:          require('./src/asset.js'),
    Profile:        require('./src/profile.js'),
    Transaction:    require('./src/transaction.js'),
    Wallet:         require('./src/wallet.js')
};

//

    let Profile = require('./src/profile.js');
    let profile = new Profile();

    tokiumEvents.on('wallets-changed', profile => {
        //console.info(JSON.stringify(profile, null, 2));
    })

    tokiumEvents.on('waiting-transactions-changed', transactions => {
        console.info(JSON.stringify(transactions, null, 2));
    })

    profile.login('jorgepruden@gmail.com', '123456').then(() => {
        //console.info(profile);
        /*
        profile.getTransactions('from', 1).then(tx => {
            console.info(tx);
        });
        */
    });


    //login('jorgepruden@gmail.com', '123456').then(() => {
        /*
        console.info('abc');
        let Transaction = require('./src/transaction.js');
        let tx = new Transaction();

        tx.init({
            fromAddress: '1AC7UhYbejdH4bqLgciSMqREbvB6XkjwtHxgsd',
            toAddress: '1Ve9oNiYmyeoN4GodNDrFmNo3XMQ9Zj2rt4ZrY',
            assetName: 'hhhhh',
            amount: 10
        }).then(function() {
            console.info(tx);
            console.info(tx.status);

            tx.requestTransaction().then(function() {
                console.info(tx);

                tx.initTransaction({
                    walletPin: '',
                    privateKey: 'V87cwpz9WZXq5iizp4LxnNQj5t8UX54vmriKCX8nSrL6t2upsdKt3UFY'
                }, false).then(() => {
                    console.info(tx);
                }).catch(err => {
                    console.error('Err: ', err);
                });
            }).catch(function(err) {
                console.info('Error:', err);
            });
        });
        */

        /*
        let Asset = require('./src/asset.js');
        let asset = new Asset();

        asset.init({
            assetName: 't9',
            amount: 10,
            image: 'http'
        }).then(() => {
            console.info(asset);

            asset.create().then(() => {
                console.info(asset);
            }).catch(err => {
                console.info(err);
            });
        });
        */

        /*
        const Wallet = require('./src/wallet.js');

        let wallet = new Wallet();
        wallet.init({
            address: '1AC7UhYbejdH4bqLgciSMqREbvB6XkjwtHxgsd',
            assetName: 'hhhhh'
        }).then(() => {
            console.info(wallet);
        });
        */
    //});
//
