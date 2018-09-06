'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TokiumAPI = require('../utils/tokium.api.js');
var SERVER_FOR_NEW_ASSETS = 'https://blockchain-token.herokuapp.com';

module.exports = function () {

    return function () {
        function Asset() {
            _classCallCheck(this, Asset);

            this.assetName = null;
            this.amount = null;
            this.enabled = null;
            this.image = null;
            this.owner = null;
            this.server = null;
            this.status = 'needinit';
        }

        _createClass(Asset, [{
            key: 'init',
            value: function init(assetData) {
                var _this = this;

                return new Promise(function (resolve, reject) {
                    _this._getAssetInfo(assetData.assetName).then(function (assetInfo) {
                        if (!assetInfo) {
                            _this.assetName = assetData.assetName;
                            _this.amount = assetData.amount;
                            _this.image = assetData.image;
                            _this.status = 'notexists';
                        } else {
                            _this.assetName = assetData.assetName;
                            _this.amount = assetInfo.amount;
                            _this.enabled = assetInfo.enabled;
                            _this.image = assetInfo.image;
                            _this.owner = assetInfo.owner;
                            _this.server = assetInfo.server;
                            _this.status = 'exists';
                        }

                        resolve();
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            }
        }, {
            key: 'create',
            value: function create() {
                var _this2 = this;

                return new Promise(function (resolve, reject) {
                    if (_this2.status === 'needinit') {
                        reject('The asset need to be inited firstly.');
                        return;
                    }

                    if (_this2.status === 'exists') {
                        reject('The asset already exists.');
                        return;
                    }

                    if (!_this2.assetName || !_this2.amount || !_this2.image) {
                        reject('You need to define assetName, amount and image before.');
                        return;
                    }

                    TokiumAPI.assetCreate(SERVER_FOR_NEW_ASSETS, {
                        assetName: _this2.assetName,
                        amount: _this2.amount,
                        image: _this2.image
                    }).then(function (wallet) {
                        _this2._getAssetInfo(_this2.assetName).then(function (assetInfo) {
                            _this2.amount = assetInfo.amount;
                            _this2.enabled = assetInfo.enabled;
                            _this2.image = assetInfo.image;
                            _this2.owner = assetInfo.owner;
                            _this2.server = assetInfo.server;
                            _this2.status = 'exists';

                            var Wallet = require('./wallet.js');
                            var adminAssetWallet = new Wallet();

                            adminAssetWallet.init({
                                address: wallet.address,
                                assetName: wallet.assetName,
                                privateKey: wallet.privateKey
                            }).then(function () {
                                resolve(adminAssetWallet);
                            }).catch(function (err) {
                                reject(err);
                            });
                        }).catch(function (err) {
                            reject(err);
                        });
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            }
        }, {
            key: '_getAssetInfo',
            value: function _getAssetInfo(assetName) {
                return new Promise(function (resolve, reject) {
                    var docRef = tokiumFirestore.collection('assets').doc(assetName);

                    docRef.get().then(function (doc) {
                        if (doc.exists) {
                            resolve(doc.data());
                        } else {
                            resolve();
                        }
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            }
        }]);

        return Asset;
    }();
}();