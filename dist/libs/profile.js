'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _services = require('../utils/services.js');

var _tools = require('./tools.js');

var Tools = _interopRequireWildcard(_tools);

var _wallet = require('./wallet.js');

var _wallet2 = _interopRequireDefault(_wallet);

var _transaction = require('./transaction.js');

var _transaction2 = _interopRequireDefault(_transaction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TokiumAPI = require('../utils/tokium.api.js');

var Profile = function () {
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
            var _this = this;

            return new Promise(function (resolve, reject) {

                // User already have session.
                if (_services.firebase.auth().currentUser && _services.firebase.auth().currentUser.email === email) {
                    // User is signed in.
                    _this._clearListeners();

                    _this._startSession(_services.firebase.auth().currentUser).then(function () {
                        _services.eventsEmitter.emit('user-logged-in', _this);
                    });

                    return resolve();
                }

                _services.firebase.auth().signInWithEmailAndPassword(email, password).then(function () {
                    var handler = function handler() {
                        resolve();
                        _services.eventsEmitter.removeListener('user-logged-in', handler);
                    };

                    _services.eventsEmitter.on('user-logged-in', handler);
                }).catch(function (err) {
                    reject(err.message);
                });
            });
        }
    }, {
        key: 'signup',
        value: function signup(email, password) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                if (_this2.status === 'loggedin') {
                    reject('You have already loggedin.');
                }

                _services.firebase.auth().createUserWithEmailAndPassword(email, password).then(function () {
                    var handler = function handler() {
                        resolve();
                        _services.eventsEmitter.removeListener('user-logged-in', handler);
                    };

                    _services.eventsEmitter.on('user-logged-in', handler);
                }).catch(function (err) {
                    reject(err.message);
                });
            });
        }
    }, {
        key: 'logout',
        value: function logout() {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                if (_this3.status === 'needlogin') {
                    reject('You have already logout.');
                }

                _services.firebase.auth().signOut().then(function () {
                    var handler = function handler() {
                        resolve();
                        _services.eventsEmitter.removeListener('user-logged-out', handler);
                    };

                    _services.eventsEmitter.on('user-logged-out', handler);
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
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                _this4._getUserWallets().then(function (wallets) {
                    _this4._composeWallets(wallets).then(function () {
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
            var _this5 = this;

            return new Promise(function (resolve, reject) {
                limit = limit || 100;

                var queryRef = null;

                switch (type) {
                    case 'from':
                        queryRef = _services.firestore.collection('transactions').where('from', '==', _this5.uid).limit(limit);
                        break;
                    case 'to':
                        queryRef = _services.firestore.collection('transactions').where('to', '==', _this5.uid).limit(limit);
                        break;
                    default:
                        reject('You need to define transactions type (from or to).');
                        return;
                }

                queryRef.get().then(function (querySnapshot) {
                    var transactionKeys = querySnapshot.docs.map(function (doc) {
                        return doc.id;
                    });

                    _this5._composeTransactions(transactionKeys).then(function (transactions) {
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
            var _this6 = this;

            return new Promise(function (resolve, reject) {
                if (_this6.status === 'needlogin') {
                    reject('You need to login before.');
                }
                console.info(Tools);
                Tools.getAssetsList(_this6.uid).then(function (assets) {
                    resolve(assets);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }
    }, {
        key: '_listenAuthChanges',
        value: function _listenAuthChanges() {
            var _this7 = this;

            _services.firebase.auth().onAuthStateChanged(function (user) {
                if (user) {
                    // User is signed in.
                    _this7._clearListeners();

                    _this7._startSession(user).then(function () {
                        _services.eventsEmitter.emit('user-logged-in', _this7);
                    });
                } else {
                    // User is signed out.
                    _this7.uid = null;
                    _this7.email = null;
                    _this7.allowedAssets = null;
                    _this7.authToken = null;
                    _this7.wallets = [];
                    _this7.status = 'needlogin';

                    _this7._clearListeners();
                    _services.eventsEmitter.emit('user-logged-out', _this7);
                }
            });
        }
    }, {
        key: '_startSession',
        value: function _startSession(userSession) {
            var _this8 = this;

            return new Promise(function (resolve, reject) {
                userSession.getIdToken().then(function (token) {
                    // Set authToken on Tokium API.
                    TokiumAPI.setAuthToken(token);

                    _this8.uid = userSession.uid;
                    _this8.email = userSession.email;
                    _this8.authToken = token;

                    _this8.status = 'loggedin';

                    _this8._startListeners();

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
            var _this9 = this;

            return new Promise(function (resolve, reject) {
                _this9.wallets = [];
                var promisesArray = [];

                wallets.forEach(function (wallet) {
                    var walletObj = new _wallet2.default();
                    _this9.wallets.push(walletObj);

                    var promise = walletObj.init({
                        privateKey: wallet.private_key,
                        address: wallet.address,
                        assetName: wallet.asset_name
                    });

                    promisesArray.push(promise);
                });

                Promise.all(promisesArray).then(function () {
                    _services.eventsEmitter.emit('wallets-changed', _this9);
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
                var transactions = [];
                var promisesArray = [];

                transactionKeys.forEach(function (transactionKey) {
                    var transactionObj = new _transaction2.default();
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
            var _this10 = this;

            return new Promise(function (resolve, reject) {
                var docRef = _services.firestore.collection('users').doc(_this10.uid);

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
            var _this11 = this;

            return new Promise(function (resolve, reject) {
                var queryRef = _services.firestore.collection('asset_accounts').where('owner', '==', _this11.uid);

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
            var _this12 = this;

            var query = _services.firestore.collection('asset_accounts').where('owner', '==', this.uid);

            var observer = query.onSnapshot(function (querySnapshot) {
                var wallets = querySnapshot.docs.map(function (doc) {
                    return doc.data();
                });

                _this12._composeWallets(wallets);
            });

            return observer;
        }
    }, {
        key: '_listenWaitingTransactions',
        value: function _listenWaitingTransactions() {
            var _this13 = this;

            var query = _services.firestore.collection('transactions').where('from', '==', this.uid).where('status', '==', 'waiting');

            var observer = query.onSnapshot(function (querySnapshot) {
                var transactionKeys = querySnapshot.docs.map(function (doc) {
                    return doc.id;
                });

                _this13._composeTransactions(transactionKeys).then(function (transactions) {
                    _services.eventsEmitter.emit('waiting-transactions-changed', transactions);
                });
            });

            return observer;
        }
    }, {
        key: '_listenUserProfile',
        value: function _listenUserProfile() {
            var _this14 = this;

            var query = _services.firestore.collection('users').doc(this.uid);

            var observer = query.onSnapshot(function (querySnapshot) {
                var profile = querySnapshot.data();

                if (profile) {
                    _this14.allowedAssets = profile.allowedAssets;
                    _services.eventsEmitter.emit('profile-changed', _this14);
                }
            });

            return observer;
        }
    }]);

    return Profile;
}();

exports.default = Profile;
;