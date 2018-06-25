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

var userSession = null;
var authToken = null;

var eventListeners = [];

// Init Firebase and Firestore
firebase.initializeApp(FIREBASE_CONFIG)
const db = firebase.firestore();
const settings = { timestampsInSnapshots: true };
db.settings(settings);

module.exports = {
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    getAccount: getAccount,
    getAccounts: getAccounts,
    newAccount: newAccount,
    prepareTransaction: prepareTransaction,
    completeTransaction: completeTransaction,
    getAssetsList: getAssetsList,
    getTransactionsList: getTransactionsList,
    requestAsset: requestAsset
};

function isLoggedIn() {
    return (!userSession || !authToken) ? false : true;
}

function startListeners() {
    eventListeners.push(listenWaitingTransactions());
    eventListeners.push(listenAccounts());
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

function listenAccounts() {
    var query = db.collection('asset_accounts')
                  .where('owner', '==', userSession.uid);

    var observer = query.onSnapshot(function(querySnapshot) {
        var results = querySnapshot.docs.map(function(doc) {
          return doc.data();
        });

        completeAccounts(results).then(function(extendedAccounts) {
            tokiumEvents.emit('accounts-changed', extendedAccounts);
        });
    });

    return observer;
}

function login(email, password) {
    return new Promise(function(resolve, reject) {
        firebase.auth().signInWithEmailAndPassword(email, password).then(function(firebaseUserInfo) {
            firebase.auth().currentUser.getIdToken().then(function(token) {
                userSession = firebase.auth().currentUser;
                authToken = token;
                startListeners();

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

            resolve();
        }).catch(function(err) {
            reject(err.message);
        });
    });
}

function getAccounts() {
    return new Promise(function(resolve, reject) {
        if (!userSession) {
            reject('You have to login on your account before.');
            return;
        }

        getUserAssetAccounts().then(function(assetAccounts) {
            completeAccounts(assetAccounts).then(function(extendedAccounts) {
                resolve(extendedAccounts);
            }).catch(function() {
                reject('There was an error extracting your accounts.');
            });
        });
    });
}

function getAccount(address) {
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
                var foundAccount = [querySnapshot.docs[0].data()];
                completeAccounts(foundAccount).then(function(extendedAccounts) {
                    resolve(extendedAccounts[0]);
                });
            } else {
                reject('Address not found.');
            }
        }).catch(function(err) {
            console.log('Error getting document:', err);
            reject('There was an error extracting your account.');
        });
    });
}

function completeAccounts(accounts) {
    return new Promise(function(resolve, reject) {
        // Get assets server
        var promisesArray = [];

        accounts.forEach(function(account, index) {
            promisesArray.push(getAssetInfo(account.asset_name).then(function(assetInfo) {
                accounts[index].server = assetInfo.server;
                accounts[index].balance = '...';
            }));
        });

        Promise.all(promisesArray).then(function() {
            getAccountsBalance(accounts).then(function(accountsWithBalances) {
                resolve(accountsWithBalances);
            }).catch(function() {
                resolve(accounts);
            });
        }).catch(function() {
            reject('There was an error extracting your accounts.');
        });
    });
}

/**
  Get user asset accounts from 'asset_accounts' firebase collection
**/
function getUserAssetAccounts() {
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
                reject();
            }
        }).catch(function(error) {
            console.log('Error getting document:', error);
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

function getAccountsBalance(accounts) {
    return new Promise(function(resolve, reject) {
        // Get assets server
        var promisesArray = [];

        accounts.forEach(function(account, index) {
            promisesArray.push(TokiumAPI.getAddressBalance(account.server, authToken, {
                assetName: account.asset_name,
                address: account.address
            }).then(function(balanceInfo) {
                accounts[index].balance = balanceInfo.balance;
            }));
        });

        Promise.all(promisesArray).then(function() {
            resolve(accounts);
        }).catch(function() {
            reject('There was an error extracting accounts balances.');
        });
    });
}

function newAccount(assetName, accountPin) {
    return new Promise(function(resolve, reject) {
        if (!userSession) {
            reject('You have to login on your account before.');
            return;
        }

        getAssetInfo(assetName).then(function(assetInfo) {
            TokiumAPI.newAddress(assetInfo.server, authToken, {
                assetName: assetName,
                accountPin: accountPin
            }).then(function(account) {
                resolve(account);
            }).catch(function(err) {
                reject(err);
            });
        });
    });
}

function prepareTransaction(fromAddress, toAddress, assetName, amount) {
    return new Promise(function(resolve, reject) {
        if (!userSession) {
            reject('You have to login on your account before.');
            return;
        }

        getAssetInfo(assetName).then(function(assetInfo) {
            TokiumAPI.prepareTransaction(assetInfo.server, authToken, {
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

function completeTransaction(accountPin, privateKey, transactionKey) {
    return new Promise(function(resolve, reject) {
        if (!userSession) {
            reject('You have to login on your account before.');
            return;
        }

        getAssetInfo(assetName).then(function(assetInfo) {
            TokiumAPI.completeTransaction(assetInfo.server, authToken, {
                accountPin: accountPin,
                privateKey: privateKey,
                transactionKey: transactionKey
            }).then(function() {
                resolve();
            }).catch(function(err) {
                reject(err);
            });
        });
    });
}

function requestAsset(assetName, assetImage, amount) {
    return new Promise(function(resolve, reject) {
        if (!userSession) {
            reject('You have to login on your account before.');
            return;
        }

        TokiumAPI.requestAsset(SERVER_FOR_NEW_ASSETS, authToken, {
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
