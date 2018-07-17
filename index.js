const firebase = require('firebase');

const events = require('events');
global.tokiumEvents = global.tokiumEvents || new events.EventEmitter();

const TokiumAPI = require('./utils/tokium.api.js');
const SERVER_FOR_NEW_ASSETS = 'https://blockchain-token.herokuapp.com';

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyASn4mvQQjAAe5IvsWYEUQcI1odtUsIZHU",
    authDomain: "blockchain-tokens.firebaseapp.com",
    databaseURL: "https://blockchain-tokens.firebaseio.com",
    projectId: "blockchain-tokens",
    storageBucket: "blockchain-tokens.appspot.com",
    messagingSenderId: "401039270457"
};

let userSession = null;

let eventListeners = [];

// Init Firebase and Firestore
firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();
const settings = { timestampsInSnapshots: true };
db.settings(settings);

module.exports = {
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    getWallet: getWallet,
    getWallets: getWallets,
    newWallet: newWallet,
    requestTransaction: requestTransaction,
    sendTransaction: sendTransaction,
    getAssetsList: getAssetsList,
    getTransactionsList: getTransactionsList,
    createAsset: createAsset
};

function isLoggedIn() {
    return (!userSession) ? false : true;
}

function startListeners() {
    eventListeners.push(listenWaitingTransactions());
    eventListeners.push(listenWallets());
}

function listenWaitingTransactions() {
    var query = db.collection('transactions')
                  .where('from', '==', userSession.uid)
                  .where('status', '==', 'waiting');


    var observer = query.onSnapshot(function(querySnapshot) {
        var results = querySnapshot.docs.map(function(doc) {
            var transaction = doc.data();
            transaction.transactionKey = doc.id;

            return transaction;
        });

        tokiumEvents.emit('waiting-transactions-changed', results);
    });

    return observer;
}

function listenWallets() {
    var query = db.collection('asset_accounts')
                  .where('owner', '==', userSession.uid);

    var observer = query.onSnapshot(function(querySnapshot) {
        var results = querySnapshot.docs.map(function(doc) {
          return doc.data();
        });

        completeWallets(results).then(function(extendedWallets) {
            tokiumEvents.emit('wallets-changed', extendedWallets);
        });
    });

    return observer;
}

function login(email, password) {
    return new Promise(function(resolve, reject) {
        firebase.auth().signInWithEmailAndPassword(email, password).then(function(firebaseUserInfo) {
            firebase.auth().currentUser.getIdToken().then(function(token) {
                userSession = firebase.auth().currentUser;
                startListeners();

                // Set authToken on Tokium API.
                TokiumAPI.setAuthToken(token);

                resolve(firebaseUserInfo);
            });
        }).catch(function(err) {
            reject(err.message);
        });
    });
}

function logout() {
    return new Promise(function(resolve, reject) {
        if (!userSession) {
            reject('You have to login on your account before.');
            return;
        }

        firebase.auth().signOut().then(function() {
            // Clear user listeners.
            eventListeners.forEach(function(eventListener) {
                eventListener();
            });
            eventListeners = [];

            userSession = null;

            resolve();
        }).catch(function(err) {
            reject(err.message);
        });
    });
}

function getWallets() {
    return new Promise(function(resolve, reject) {
        if (!userSession) {
            reject('You have to login on your account before.');
            return;
        }

        getUserAssetWallets().then(function(assetWallets) {
            completeWallets(assetWallets).then(function(extendedWallets) {
                resolve(extendedWallets);
            }).catch(function() {
                reject('There was an error extracting your wallets.');
            });
        });
    });
}

function getWallet(address) {
    return new Promise(function(resolve, reject) {
        if (!userSession) {
            reject('You have to login on your account before.');
            return;
        }

        var queryRef = db.collection('asset_accounts')
                         .where('address', '==', address)
                         .where('owner', '==', userSession.uid);

        queryRef.get().then(function(querySnapshot) {
            if (querySnapshot.docs[0]) {
                var foundWallet = [querySnapshot.docs[0].data()];
                completeWallets(foundWallet).then(function(extendedWallets) {
                    resolve(extendedWallets[0]);
                });
            } else {
                reject('Wallet not found.');
            }
        }).catch(function(err) {
            console.log('Error getting document:', err);
            reject('There was an error finding the wallet.');
        });
    });
}

function completeWallets(wallets) {
    return new Promise(function(resolve, reject) {
        // Get assets server
        var promisesArray = [];

        wallets.forEach(function(wallet, index) {
            promisesArray.push(getAssetInfo(wallet.asset_name).then(function(assetInfo) {
                wallets[index].server = assetInfo ? assetInfo.server : null;
                wallets[index].balance = '...';
            }));
        });

        Promise.all(promisesArray).then(function() {
            getWalletsBalance(wallets).then(function(walletsWithBalances) {
                resolve(walletsWithBalances);
            }).catch(function() {
                resolve(wallets);
            });
        }, function(err) {
            console.error(err);
            reject('There was an error completing your wallets info.');
        });
    });
}

/**
  Get user asset wallets from 'asset_accounts' firebase collection
**/
function getUserAssetWallets() {
    return new Promise(function(resolve, reject) {
        var queryRef = db.collection('asset_accounts').where('owner', '==', userSession.uid);

        queryRef.get().then(function(querySnapshot) {
            var results = querySnapshot.docs.map(function(doc) {
              return doc.data();
            });

            resolve(results);
        }).catch(function(error) {
            console.log('Error getting document:', error);
        });
    });
}

/**
  Get asset info from 'assets' firebase collection
**/
function getAssetInfo(assetName) {
    return new Promise(function(resolve, reject) {
        var docRef = db.collection('assets').doc(assetName);

        docRef.get().then(function(doc) {
            if (doc.exists) {
                resolve(doc.data());
            } else {
                resolve();
            }
        }).catch(function(err) {
            console.error('Error getting document:', err);
        });
    });
}

/**
  Get user data from 'users' firebase collection
**/
function getUserProfile() {
    return new Promise(function(resolve, reject) {
        var docRef = db.collection('users').doc(user.firebaseInfo.uid);

        docRef.get().then(function(doc) {
            if (doc.exists) {
                resolve(doc.data());
            } else {
                reject();
            }
        }).catch(function(error) {
            console.log('Error getting document:', error);
        });
    });
}

function getWalletsBalance(wallets) {
    return new Promise(function(resolve, reject) {
        // Get assets server
        var promisesArray = [];

        wallets.forEach(function(wallet, index) {
            if (!wallet.server) return wallets[index].balance = 'NaN';

            promisesArray.push(TokiumAPI.walletBalance(wallet.server, {
                assetName: wallet.asset_name,
                address: wallet.address
            }).then(function(balanceInfo) {
                wallets[index].balance = balanceInfo.balance;
            }));
        });

        Promise.all(promisesArray).then(function() {
            resolve(wallets);
        }).catch(function() {
            reject('There was an error extracting wallets balances.');
        });
    });
}

function newWallet(assetName, accountPin) {
    return new Promise(function(resolve, reject) {
        if (!userSession) {
            reject('You have to login on your account before.');
            return;
        }

        getAssetInfo(assetName).then(function(assetInfo) {
            TokiumAPI.walletCreate(assetInfo.server, {
                assetName: assetName,
                accountPin: accountPin
            }).then(function(wallet) {
                resolve(wallet);
            }).catch(function(err) {
                reject(err);
            });
        });
    });
}

function requestTransaction(fromAddress, toAddress, assetName, amount) {
    return new Promise(function(resolve, reject) {
        if (!userSession) {
            reject('You have to login on your account before.');
            return;
        }

        getAssetInfo(assetName).then(function(assetInfo) {
            TokiumAPI.transactionRequest(assetInfo.server, {
                fromAddress: fromAddress,
                toAddress: toAddress,
                assetName: assetName,
                amount: amount
            }).then(function(transactionData) {
                resolve(transactionData);
            }).catch(function(err) {
                reject(err);
            });
        });
    });
}

function sendTransaction(accountPin, privateKey, transactionKey) {
    return new Promise(function(resolve, reject) {
        if (!userSession) {
            reject('You have to login on your account before.');
            return;
        }

        getAssetInfo(assetName).then(function(assetInfo) {
            TokiumAPI.transactionInitImplicit(assetInfo.server, {
                accountPin: accountPin,
                privateKey: privateKey,
                transactionKey: transactionKey,
                signOnline: true
            }).then(function() {
                resolve();
            }).catch(function(err) {
                reject(err);
            });
        });
    });
}

function createAsset(assetName, assetImage, amount) {
    return new Promise(function(resolve, reject) {
        if (!userSession) {
            reject('You have to login on your account before.');
            return;
        }

        TokiumAPI.assetCreate(SERVER_FOR_NEW_ASSETS, {
            assetName:  assetName,
            assetImage: assetImage,
            amount:     amount
        }).then(function() {
            resolve();
        }).catch(function(err) {
            reject(err);
        });
    });
}

function getAssetsList(options) {
    return new Promise(function(resolve, reject) {
        if (!userSession) {
            reject('You have to login on your account before.');
            return;
        }

        options = options || {};

        var queryRef = !options.onlyMyAssets ? db.collection('assets') : db.collection('assets').where('owner', '==', userSession.uid);

        queryRef.get().then(function(querySnapshot) {
            var results = querySnapshot.docs.map(function(doc) {
                var assetInfo = doc.data();
                assetInfo.name = doc.id;

                return assetInfo;
            });

            resolve(results);
        }).catch(function(error) {
            console.log('Error getting document:', error);
        });
    });
}

function getTransactionsList() {
    return new Promise(function(resolve, reject) {
        if (!userSession) {
            reject('You have to login on your account before.');
            return;
        }

        Promise.all([getFromTransactions(), getToTransactions()]).then(function(results) {
            var fromTransactions = results[0];
            var toTransactions = results[1];

            resolve({
                sender: fromTransactions,
                receiver: toTransactions
            });
        });
    });
}

function getFromTransactions() {
    return new Promise(function(resolve, reject) {
        var queryRef = db.collection('transactions')
                          .where('from', '==', userSession.uid);

        queryRef.get().then(function(querySnapshot) {
            var results = querySnapshot.docs.map(function(doc) {
                var transaction = doc.data();
                transaction.transactionKey = doc.id;

                return transaction;
            });

            resolve(results);
        }).catch(function(error) {
            console.log('Error getting document:', error);
        });
    });
}

function getToTransactions() {
    return new Promise(function(resolve, reject) {
        var queryRef = db.collection('transactions')
                          .where('to', '==', userSession.uid);

        queryRef.get().then(function(querySnapshot) {
            var results = querySnapshot.docs.map(function(doc) {
                var transaction = doc.data();
                transaction.transactionKey = doc.id;

                return transaction;
            });

            resolve(results);
        }).catch(function(error) {
            console.log('Error getting document:', error);
        });
    });
}
