'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TokiumAPI = require('../utils/tokium.api.js');

module.exports = function () {

    return function () {
        function Transaction() {
            _classCallCheck(this, Transaction);

            this.amount = null;
            this.assetName = null;
            this.fromAddress = null;
            this.toAddress = null;
            this.transactionKey = null;
            this.txHex = null;
            this.status = 'needinit';
        }

        _createClass(Transaction, [{
            key: 'init',
            value: function init(txData) {
                var _this = this;

                return new Promise(function (resolve, reject) {
                    if (txData.transactionKey) {
                        // Get info from Firebase
                        _this._getTransactionWithTransactionKey(txData.transactionKey).then(function (txInfo) {
                            _this.amount = txInfo.amount;
                            _this.assetName = txInfo.asset_name;
                            _this.fromAddress = txInfo.fromAddress;
                            _this.toAddress = txInfo.toAddress;
                            _this.status = txInfo.status;
                            _this.transactionKey = txData.transactionKey;

                            resolve();
                        }).catch(function (err) {
                            reject(err);
                        });
                    } else {
                        _this.amount = txData.amount;
                        _this.assetName = txData.assetName;
                        _this.fromAddress = txData.fromAddress;
                        _this.toAddress = txData.toAddress;
                        _this.status = 'local';

                        resolve();
                    }
                });
            }
        }, {
            key: 'requestTransaction',
            value: function requestTransaction() {
                var _this2 = this;

                return new Promise(function (resolve, reject) {
                    if (_this2.status !== 'local') {
                        reject('Your transaction have already been requested.');
                        return;
                    }

                    var Asset = require('./asset.js');
                    var asset = new Asset();

                    asset.init({
                        assetName: _this2.assetName
                    }).then(function () {
                        if (asset.status === 'notexists') {
                            reject('Your transaction can\'t be requested. The asset doesn\'t exist.');
                            return;
                        }

                        TokiumAPI.transactionRequest(asset.server, _this2).then(function (txData) {
                            _this2.transactionKey = txData.transactionKey;
                            _this2.status = 'waiting';

                            resolve();
                        }).catch(function (err) {
                            reject(err);
                        });
                    });
                });
            }
        }, {
            key: 'initTransaction',
            value: function initTransaction(wallet, signOnline) {
                var _this3 = this;

                return new Promise(function (resolve, reject) {
                    if (_this3.status === 'completed' || _this3.status === 'needinit') {
                        reject('Your transaction have already been completed on need to be init.');
                        return;
                    }

                    var Asset = require('./asset.js');
                    var asset = new Asset();
                    asset.init({
                        assetName: _this3.assetName
                    }).then(function () {
                        if (asset.status === 'notexists') {
                            reject('Your transaction can\'t be requested. The asset doesn\'t exist.');
                            return;
                        }

                        var transactionInitFn = _this3.transactionKey ? TokiumAPI.transactionInitImplicit : TokiumAPI.transactionInitExplicit;
                        var data = {
                            privateKey: wallet.privateKey,
                            walletPin: wallet.walletPin,
                            signOnline: signOnline
                        };

                        _this3.transactionKey ? data.transactionKey = _this3.transactionKey : data.transactionInfo = _this3;

                        transactionInitFn(asset.server, data).then(function (txData) {
                            _this3.status = txData.status;
                            _this3.transactionKey = txData.transactionKey;
                            if (txData.status === 'waiting') _this3.txHex = txData.tx;

                            resolve();
                        }).catch(function (err) {
                            reject(err);
                        });
                    });
                });
            }
        }, {
            key: '_getTransactionWithTransactionKey',
            value: function _getTransactionWithTransactionKey(transactionKey) {
                return new Promise(function (resolve, reject) {
                    var docRef = tokiumFirestore.collection('transactions').doc(transactionKey);

                    docRef.get().then(function (doc) {
                        if (doc.exists) {
                            resolve(doc.data());
                        } else {
                            reject();
                        }
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            }
        }]);

        return Transaction;
    }();
}();