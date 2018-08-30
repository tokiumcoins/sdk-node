const TokiumAPI = require('../utils/tokium.api.js');
const Tools = require('./tools.js');

module.exports = (() => {

    return class Profile {
        constructor() {
            this.uid            = null;
            this.email          = null;
            this.allowedAssets  = null;
            this.authToken      = null;
            this.wallets        = [];
            this.status         = 'needlogin';

            this.listeners = [];
        }

        login(email, password) {
            return new Promise((resolve, reject) => {
                if (this.status === 'loggedin') {
                    reject('You have already loggedin.');
                }

                firebase.auth().signInWithEmailAndPassword(email, password).then(firebaseUserInfo => {
                    this._startSession(firebaseUserInfo).then(() => {
                        resolve();
                    });
                }).catch(err => {
                    reject(err.message);
                });
            });
        }

        signup(email, password) {
            return new Promise((resolve, reject) => {
                if (this.status === 'loggedin') {
                    reject('You have already loggedin.');
                }

                firebase.auth().createUserWithEmailAndPassword(email, password).then(firebaseUserInfo => {
                    this._startSession(firebaseUserInfo).then(() => {
                        resolve();
                    });
                }).catch(err => {
                    reject(err.message);
                });
            });
        }

        logout() {
            return new Promise((resolve, reject) => {
                if (this.status === 'needlogin') {
                    reject('You have already logout.');
                }

                firebase.auth().signOut().then(() => {
                    this.uid            = null;
                    this.email          = null;
                    this.allowedAssets  = null;
                    this.authToken      = null;
                    this.wallets        = [];
                    this.status         = 'needlogin';

                    this._clearListeners();

                    resolve();
                }).catch(err => {
                    reject(err.message);
                });
            });
        }

        isLoggedIn() {
            return !!this.uid;
        }

        getWallets() {
            return new Promise((resolve, reject) => {
                this._getUserWallets().then(wallets => {
                    this._composeWallets(wallets).then(() => {
                        resolve();
                    }).catch(err => {
                        reject(err);
                    });
                }).catch(err => {
                    reject(err);
                });
            });
        }

        findWallet(address) {
            return this.wallets.filter(wallet => {
                return wallet.address === address;
            });
        }

        getTransactions(type, limit) {
            return new Promise((resolve, reject) => {
                limit = limit || 100;

                let queryRef = null;

                switch (type) {
                    case 'from':
                        queryRef = db.collection('transactions')
                            .where('from', '==', this.uid)
                            .limit(limit);
                        break;
                    case 'to':
                        queryRef = db.collection('transactions')
                            .where('to', '==', this.uid)
                            .limit(limit);
                        break;
                    default:
                        reject('You need to define transactions type (from or to).');
                        return;
                }

                queryRef.get().then(querySnapshot => {
                    var transactionKeys = querySnapshot.docs.map(doc => {
                        return doc.id;
                    });

                    this._composeTransactions(transactionKeys).then(transactions => {
                        resolve(transactions);
                    }).catch(err => {
                        reject(err);
                    });
                }).catch(err => {
                    console.log('Error getting document:', err);
                    reject(err.message);
                });
            });
        }

        getMyAssets() {
            return new Promise((resolve, reject) => {
                if (this.status === 'needlogin') {
                    reject('You need to login before.');
                }

                Tools.getAssetsList(this.uid).then(assets => {
                    resolve(assets)
                }).catch(err => {
                    reject(err);
                });
            });
        }

        _startSession(firebaseUserInfo) {
            return new Promise((resolve, reject) => {
                firebase.auth().currentUser.getIdToken().then(token => {
                    // Set authToken on Tokium API.
                    TokiumAPI.setAuthToken(token);

                    let userSession = firebase.auth().currentUser;
                    this.uid = userSession.uid;
                    this.email = userSession.email;
                    this.authToken = token;

                    this.status = 'loggedin';

                    this._startListeners();

                    resolve();
                });
            });
        }

        _clearListeners() {
            this.listeners.forEach(function(listener) {
                listener();
            });

            this.listener = [];
        }

        _composeWallets(wallets) {
            return new Promise((resolve, reject) => {
                let Wallet = require('./wallet.js');

                this.wallets = [];
                let promisesArray = [];

                wallets.forEach(wallet => {
                    let walletObj = new Wallet();
                    this.wallets.push(walletObj);

                    let promise = walletObj.init({
                        privateKey: wallet.private_key,
                        address: wallet.address,
                        assetName: wallet.asset_name
                    });

                    promisesArray.push(promise);
                });

                Promise.all(promisesArray).then(() => {
                    tokiumEvents.emit('wallets-changed', this);
                    resolve();
                }).catch(err => {
                    reject(err);
                });
            });
        }

        _composeTransactions(transactionKeys) {
            return new Promise((resolve, reject) => {
                let Transaction = require('./transaction.js');

                let transactions = [];
                let promisesArray = [];

                transactionKeys.forEach(transactionKey => {
                    let transactionObj = new Transaction();
                    transactions.push(transactionObj);

                    let promise = transactionObj.init({
                        transactionKey: transactionKey
                    });

                    promisesArray.push(promise);
                });

                Promise.all(promisesArray).then(() => {
                    resolve(transactions);
                }).catch(err => {
                    reject(err);
                });
            });
        }

        _getUserProfile() {
            return new Promise((resolve, reject) => {
                let docRef = db.collection('users').doc(this.uid);

                docRef.get().then(doc => {
                    if (doc.exists) {
                        resolve(doc.data());
                    } else {
                        reject();
                    }
                }).catch(err => {
                    console.log('Error getting document:', err);
                    reject(err.message);
                });
            });
        }

        _getUserWallets() {
            return new Promise((resolve, reject) => {
                var queryRef = db.collection('asset_accounts').where('owner', '==', this.uid);

                queryRef.get().then(querySnapshot => {
                    var results = querySnapshot.docs.map(doc => {
                      return doc.data();
                    });

                    resolve(results);
                }).catch(err => {
                    console.log('Error getting document:', err);
                    reject(err.message);
                });
            });
        }

        _startListeners() {
            this.listeners.push(this._listenWalletChanges());
            this.listeners.push(this._listenWaitingTransactions());
            this.listeners.push(this._listenUserProfile());
        }

        _listenWalletChanges() {
            var query = db.collection('asset_accounts')
                          .where('owner', '==', this.uid);

            var observer = query.onSnapshot(querySnapshot => {
                var wallets = querySnapshot.docs.map(doc => {
                    return doc.data();
                });

                this._composeWallets(wallets);
            });

            return observer;
        }

        _listenWaitingTransactions() {
            var query = db.collection('transactions')
                          .where('from', '==', this.uid)
                          .where('status', '==', 'waiting');

            var observer = query.onSnapshot(querySnapshot => {
                var transactionKeys = querySnapshot.docs.map(doc => {
                    return doc.id;
                });

                this._composeTransactions(transactionKeys).then(transactions => {
                    tokiumEvents.emit('waiting-transactions-changed', transactions);
                });
            });

            return observer;
        }

        _listenUserProfile() {
            var query = db.collection('users').doc(this.uid);

            var observer = query.onSnapshot(querySnapshot => {
                let profile = querySnapshot.data();
                
                if (profile) {
                    this.allowedAssets = profile.allowedAssets;
                    tokiumEvents.emit('profile-changed', this);
                }
            });

            return observer;
        }
    };

})();