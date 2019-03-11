'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _services = require('../utils/services.js');

var _asset = require('./asset.js');

var _asset2 = _interopRequireDefault(_asset);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TokiumAPI = require('../utils/tokium.api.js');
var Storage = require('../utils/storage.js');

var Wallet = function () {
    function Wallet() {
        _classCallCheck(this, Wallet);

        this.walletPin = null;
        this.privateKey = null;
        this.address = null;
        this.asset = null;
        this.balance = null;
        this.status = 'needinit';
    }

    _createClass(Wallet, [{
        key: 'init',
        value: function init(walletData) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                _this.walletPin = walletData.walletPin || '';
                _this.privateKey = walletData.privateKey || '';
                _this.address = walletData.address;

                // With assetName string
                if (walletData.assetName) {
                    var asset = new _asset2.default();

                    asset.init({
                        assetName: walletData.assetName
                    }).then(function () {
                        _this.asset = asset;

                        _this._getWalletBalance().then(function () {
                            _this.status = 'initiated';
                            resolve();
                        }).catch(function (err) {
                            _this.status = 'initiated';
                            resolve();
                        });
                    });

                    // With Asset() object
                } else {
                    _this.asset = walletData.asset;

                    _this._getWalletBalance().then(function () {
                        _this.status = 'initiated';
                        resolve();
                    }).catch(function (err) {
                        _this.status = 'initiated';
                        resolve();
                    });
                }
            });
        }
    }, {
        key: 'create',
        value: function create(assetName, walletPin) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                var asset = new _asset2.default();

                asset.init({
                    assetName: assetName
                }).then(function () {
                    TokiumAPI.walletCreate(asset.server, {
                        assetName: assetName,
                        walletPin: walletPin
                    }).then(function (walletData) {
                        _this2.walletPin = walletPin;
                        _this2.privateKey = walletData.privateKey;
                        _this2.address = walletData.address;
                        _this2.asset = asset;
                        _this2.balance = 0;
                        _this2.status = 'initiated';

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
        key: 'update',
        value: function update() {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                if (_this3.status === 'needinit') {
                    reject('You need to init or create your wallet before.');
                    return;
                }

                _this3._getWalletBalance().then(function () {
                    resolve();
                }).catch(function (err) {
                    resolve();
                });
            });
        }
    }, {
        key: 'delete',
        value: function _delete() {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                if (_this4.status === 'needinit') {
                    reject('You need to init or create your wallet before.');
                    return;
                }

                if (!_services.firebase.auth().currentUser.uid) {
                    reject('You need to login before.');
                    return;
                }

                var query = _services.firestore.collection('asset_accounts').where('owner', '==', _services.firebase.auth().currentUser.uid).where('address', '==', _this4.address);

                query.get().then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
                        doc.ref.delete();
                    });
                    _this4._reset();

                    resolve();
                });
            });
        }
    }, {
        key: 'savePrivateKey',
        value: function savePrivateKey(privateKey) {
            var _this5 = this;

            var storage = new Storage();
            privateKey = privateKey || this.privateKey;

            return new Promise(function (resolve, reject) {
                if (!privateKey) {
                    reject('You need to define a privateKey.');
                    return;
                }

                storage.set(_this5.address + '.privKey', privateKey).then(function () {
                    _this5.privateKey = privateKey;
                    resolve();
                }).catch(function (err) {
                    reject(err);
                });
            });
        }
    }, {
        key: 'getPrivateKey',
        value: function getPrivateKey() {
            var _this6 = this;

            var storage = new Storage();

            return new Promise(function (resolve, reject) {
                storage.get(_this6.address + '.privKey').then(function (value) {
                    if (!value) {
                        reject('This private key is not stored on device storage.');
                        return;
                    }

                    _this6.privateKey = value;
                    resolve();
                }).catch(function (err) {
                    reject(err);
                });
            });
        }
    }, {
        key: 'clearPrivateKey',
        value: function clearPrivateKey() {
            var _this7 = this;

            var storage = new Storage();

            return new Promise(function (resolve, reject) {
                storage.remove(_this7.address + '.privKey').then(function (value) {
                    _this7.privateKey = '';
                    resolve();
                }).catch(function (err) {
                    reject(err);
                });
            });
        }
    }, {
        key: 'getPassbook',
        value: function getPassbook() {
            var _this8 = this;

            return new Promise(function (resolve, reject) {
                TokiumAPI.walletPassbook(_this8.asset.server, {
                    assetName: _this8.asset.assetName,
                    address: _this8.address
                }).then(function () {
                    resolve();
                }).catch(function (err) {
                    reject(err);
                });
            });
        }
    }, {
        key: '_reset',
        value: function _reset() {
            this.walletPin = null;
            this.privateKey = null;
            this.address = null;
            this.asset = null;
            this.balance = null;
            this.status = 'needinit';
        }
    }, {
        key: '_getWalletBalance',
        value: function _getWalletBalance() {
            var _this9 = this;

            return new Promise(function (resolve, reject) {
                if (!_this9.asset.server || !_this9.asset.assetName || !_this9.address) {
                    _this9.balance = '...';
                    resolve();
                    return;
                }

                TokiumAPI.walletBalance(_this9.asset.server, {
                    assetName: _this9.asset.assetName,
                    address: _this9.address
                }).then(function (balanceData) {
                    _this9.balance = balanceData ? balanceData.balance : '...';

                    resolve();
                }).catch(function (err) {
                    _this9.balance = '...';

                    resolve();
                });
            });
        }
    }]);

    return Wallet;
}();

exports.default = Wallet;
;