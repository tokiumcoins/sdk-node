const events = require('events');
global.tokiumEvents = global.tokiumEvents || new events.EventEmitter();

const TokiumAPI = require('./utils/tokium.api.js');

var firebase = null;
var db = null;
var userSession = null;
var authToken = null;

var eventListeners = [];

module.exports = function(_firebase) {
    if (!_firebase) {
        console.error('Tokium SDK can\'t be used without a valid firebase instance.');
        return;
    }

    firebase = _firebase;
    db = _firebase.firestore();

    return {
        login:                  login,
        getAccounts:            getAccounts,
        newAccount:             newAccount,
        prepareTransaction:     prepareTransaction,
        completeTransaction:    completeTransaction,
        getAssetsList:          getAssetsList
    }
}

function startListeners() {
    eventListeners.push(listenWaitingTransactions());
    eventListeners.push(listenAccounts());
}

function listenWaitingTransactions() {
    var query = db.collection('transactions')
                  .where('from', '==', userSession.uid)
                  .where('status', '==', 'waiting');


    var observer = query.onSnapshot(querySnapshot => {
        var transactions = {};

        querySnapshot.forEach(doc => {
            transactions[doc.id] = doc.data();
        });

        tokiumEvents.emit('waiting-transactions-changed', transactions);
    });

    return observer;
}

function listenAccounts() {
    var query = db.collection('asset_accounts')
                  .where('owner', '==', userSession.uid);

    var observer = query.onSnapshot(querySnapshot => {
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
            firebaseUserInfo.getIdToken().then(function(token) {
                userSession = firebaseUserInfo;
                authToken = token;
                startListeners();

                resolve(firebaseUserInfo);
            });
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
            resolve(accounts);
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

function getAssetsList() {
    return new Promise(function(resolve, reject) {
        if (!userSession) {
            reject('You have to login on your account before.');
            return;
        }

        var queryRef = db.collection('assets');

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
