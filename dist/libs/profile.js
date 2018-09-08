'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TokiumAPI = require('../utils/tokium.api.js');
var Tools = require('./tools.js');

module.exports = function () {

    return function () {
        function Profile() {
            _classCallCheck(this, Profile);

            this.uid = null;
            this.email = null;
            this.allowedAssets = null;
            this.authToken = null;
            this.wallets = [];
            this.status = 'needlogin';

            this.listeners = [];

            this._listenAuthChanges();
        }

        _createClass(Profile, [{
            key: 'login',
            value: function login(email, password) {
                return new Promise(function (resolve, reject) {
                    tokiumFirebase.auth().signInWithEmailAndPassword(email, password).then(function () {
                        var handler = function handler() {
                            resolve();
                            tokiumEvents.removeListener('user-logged-in', handler);
                        };

                        tokiumEvents.on('user-logged-in', handler);
                    }).catch(function (err) {
                        reject(err.message);
                    });
                });
            }
        }, {
            key: 'signup',
            value: function signup(email, password) {
                var _this = this;

                return new Promise(function (resolve, reject) {
                    if (_this.status === 'loggedin') {
                        reject('You have already loggedin.');
                    }

                    tokiumFirebase.auth().createUserWithEmailAndPassword(email, password).then(function () {
                        var handler = function handler() {
                            resolve();
                            tokiumEvents.removeListener('user-logged-in', handler);
                        };

                        tokiumEvents.on('user-logged-in', handler);
                    }).catch(function (err) {
                        reject(err.message);
                    });
                });
            }
        }, {
            key: 'logout',
            value: function logout() {
                var _this2 = this;

                return new Promise(function (resolve, reject) {
                    if (_this2.status === 'needlogin') {
                        reject('You have already logout.');
                    }

                    tokiumFirebase.auth().signOut().then(function () {
                        var handler = function handler() {
                            resolve();
                            tokiumEvents.removeListener('user-logged-out', handler);
                        };

                        tokiumEvents.on('user-logged-out', handler);
                    }).catch(function (err) {
                        reject(err.message);
                    });
                });
            }
        }, {
            key: 'isLoggedIn',
            value: function isLoggedIn() {
                return !!this.uid;
            }
        }, {
            key: 'getWallets',
            value: function getWallets() {
                var _this3 = this;

                return new Promise(function (resolve, reject) {
                    _this3._getUserWallets().then(function (wallets) {
                        _this3._composeWallets(wallets).then(function () {
                            resolve();
                        }).catch(function (err) {
                            reject(err);
                        });
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            }
        }, {
            key: 'findWallet',
            value: function findWallet(address) {
                return this.wallets.filter(function (wallet) {
                    return wallet.address === address;
                });
            }
        }, {
            key: 'getTransactions',
            value: function getTransactions(type, limit) {
                var _this4 = this;

                return new Promise(function (resolve, reject) {
                    limit = limit || 100;

                    var queryRef = null;

                    switch (type) {
                        case 'from':
                            queryRef = tokiumFirestore.collection('transactions').where('from', '==', _this4.uid).limit(limit);
                            break;
                        case 'to':
                            queryRef = tokiumFirestore.collection('transactions').where('to', '==', _this4.uid).limit(limit);
                            break;
                        default:
                            reject('You need to define transactions type (from or to).');
                            return;
                    }

                    queryRef.get().then(function (querySnapshot) {
                        var transactionKeys = querySnapshot.docs.map(function (doc) {
                            return doc.id;
                        });

                        _this4._composeTransactions(transactionKeys).then(function (transactions) {
                            resolve(transactions);
                        }).catch(function (err) {
                            reject(err);
                        });
                    }).catch(function (err) {
                        console.log('Error getting document:', err);
                        reject(err.message);
                    });
                });
            }
        }, {
            key: 'getMyAssets',
            value: function getMyAssets() {
                var _this5 = this;

                return new Promise(function (resolve, reject) {
                    if (_this5.status === 'needlogin') {
                        reject('You need to login before.');
                    }

                    Tools.getAssetsList(_this5.uid).then(function (assets) {
                        resolve(assets);
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            }
        }, {
            key: '_listenAuthChanges',
            value: function _listenAuthChanges() {
                var _this6 = this;

                tokiumFirebase.auth().onAuthStateChanged(function (user) {
                    if (user) {
                        // User is signed in.
                        _this6._clearListeners();

                        _this6._startSession(user).then(function () {
                            tokiumEvents.emit('user-logged-in', _this6);
                        });
                    } else {
                        // User is signed out.
                        _this6.uid = null;
                        _this6.email = null;
                        _this6.allowedAssets = null;
                        _this6.authToken = null;
                        _this6.wallets = [];
                        _this6.status = 'needlogin';

                        _this6._clearListeners();
                        tokiumEvents.emit('user-logged-out', _this6);
                    }
                });
            }
        }, {
            key: '_startSession',
            value: function _startSession(userSession) {
                var _this7 = this;

                return new Promise(function (resolve, reject) {
                    userSession.getIdToken().then(function (token) {
                        // Set authToken on Tokium API.
                        TokiumAPI.setAuthToken(token);

                        _this7.uid = userSession.uid;
                        _this7.email = userSession.email;
                        _this7.authToken = token;

                        _this7.status = 'loggedin';

                        _this7._startListeners();

                        resolve();
                    });
                });
            }
        }, {
            key: '_clearListeners',
            value: function _clearListeners() {
                this.listeners.forEach(function (listener) {
                    listener();
                });

                this.listeners = [];
            }
        }, {
            key: '_composeWallets',
            value: function _composeWallets(wallets) {
                var _this8 = this;

                return new Promise(function (resolve, reject) {
                    var Wallet = require('./wallet.js');

                    _this8.wallets = [];
                    var promisesArray = [];

                    wallets.forEach(function (wallet) {
                        var walletObj = new Wallet();
                        _this8.wallets.push(walletObj);

                        var promise = walletObj.init({
                            privateKey: wallet.private_key,
                            address: wallet.address,
                            assetName: wallet.asset_name
                        });

                        promisesArray.push(promise);
                    });

                    Promise.all(promisesArray).then(function () {
                        tokiumEvents.emit('wallets-changed', _this8);
                        resolve();
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            }
        }, {
            key: '_composeTransactions',
            value: function _composeTransactions(transactionKeys) {
                return new Promise(function (resolve, reject) {
                    var Transaction = require('./transaction.js');

                    var transactions = [];
                    var promisesArray = [];

                    transactionKeys.forEach(function (transactionKey) {
                        var transactionObj = new Transaction();
                        transactions.push(transactionObj);

                        var promise = transactionObj.init({
                            transactionKey: transactionKey
                        });

                        promisesArray.push(promise);
                    });

                    Promise.all(promisesArray).then(function () {
                        resolve(transactions);
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            }
        }, {
            key: '_getUserProfile',
            value: function _getUserProfile() {
                var _this9 = this;

                return new Promise(function (resolve, reject) {
                    var docRef = tokiumFirestore.collection('users').doc(_this9.uid);

                    docRef.get().then(function (doc) {
                        if (doc.exists) {
                            resolve(doc.data());
                        } else {
                            reject();
                        }
                    }).catch(function (err) {
                        console.log('Error getting document:', err);
                        reject(err.message);
                    });
                });
            }
        }, {
            key: '_getUserWallets',
            value: function _getUserWallets() {
                var _this10 = this;

                return new Promise(function (resolve, reject) {
                    var queryRef = tokiumFirestore.collection('asset_accounts').where('owner', '==', _this10.uid);

                    queryRef.get().then(function (querySnapshot) {
                        var results = querySnapshot.docs.map(function (doc) {
                            return doc.data();
                        });

                        resolve(results);
                    }).catch(function (err) {
                        console.log('Error getting document:', err);
                        reject(err.message);
                    });
                });
            }
        }, {
            key: '_startListeners',
            value: function _startListeners() {
                this.listeners.push(this._listenWalletChanges());
                this.listeners.push(this._listenWaitingTransactions());
                this.listeners.push(this._listenUserProfile());
            }
        }, {
            key: '_listenWalletChanges',
            value: function _listenWalletChanges() {
                var _this11 = this;

                var query = tokiumFirestore.collection('asset_accounts').where('owner', '==', this.uid);

                var observer = query.onSnapshot(function (querySnapshot) {
                    var wallets = querySnapshot.docs.map(function (doc) {
                        return doc.data();
                    });

                    _this11._composeWallets(wallets);
                });

                return observer;
            }
        }, {
            key: '_listenWaitingTransactions',
            value: function _listenWaitingTransactions() {
                var _this12 = this;

                var query = tokiumFirestore.collection('transactions').where('from', '==', this.uid).where('status', '==', 'waiting');

                var observer = query.onSnapshot(function (querySnapshot) {
                    var transactionKeys = querySnapshot.docs.map(function (doc) {
                        return doc.id;
                    });

                    _this12._composeTransactions(transactionKeys).then(function (transactions) {
                        tokiumEvents.emit('waiting-transactions-changed', transactions);
                    });
                });

                return observer;
            }
        }, {
            key: '_listenUserProfile',
            value: function _listenUserProfile() {
                var _this13 = this;

                var query = tokiumFirestore.collection('users').doc(this.uid);

                var observer = query.onSnapshot(function (querySnapshot) {
                    var profile = querySnapshot.data();

                    if (profile) {
                        _this13.allowedAssets = profile.allowedAssets;
                        tokiumEvents.emit('profile-changed', _this13);
                    }
                });

                return observer;
            }
        }]);

        return Profile;
    }();
}();