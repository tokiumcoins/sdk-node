const TokiumAPI = require('../utils/tokium.api.js');

module.exports = (() => {

    return class Transaction {
        constructor() {
            this.amount         = null;
            this.assetName      = null;
            this.fromAddress    = null;
            this.toAddress      = null;
            this.transactionKey = null;
            this.txHex          = null;
            this.status         = 'needinit';
        }

        init(txData) {
            return new Promise((resolve, reject) => {
                if (txData.transactionKey) {
                    // Get info from Firebase
                    this._getTransactionWithTransactionKey(txData.transactionKey).then(txInfo => {
                        this.amount         = txInfo.amount;
                        this.assetName      = txInfo.asset_name;
                        this.fromAddress    = txInfo.fromAddress;
                        this.toAddress      = txInfo.toAddress;
                        this.status         = txInfo.status;
                        this.transactionKey = txData.transactionKey;

                        resolve();
                    }).catch(err => {
                        reject(err);
                    });
                } else {
                    this.amount         = txData.amount;
                    this.assetName      = txData.assetName;
                    this.fromAddress    = txData.fromAddress;
                    this.toAddress      = txData.toAddress;
                    this.status         = 'local';

                    resolve();
                }
            });
        }

        requestTransaction() {
            return new Promise((resolve, reject) => {
                if (this.status !== 'local') {
                    reject('Your transaction have already been requested.');
                    return;
                }

                let Asset = require('./asset.js');
                let asset = new Asset();

                asset.init({
                    assetName: this.assetName
                }).then(() => {
                    if (asset.status === 'notexists') {
                        reject('Your transaction can\'t be requested. The asset doesn\'t exist.');
                        return;
                    }

                    TokiumAPI.transactionRequest(asset.server, this).then(txData => {
                        this.transactionKey = txData.transactionKey;
                        this.status = 'waiting';

                        resolve();
                    }).catch(err => {
                        reject(err);
                    });
                });

            });
        }

        initTransaction(wallet, signOnline) {
            return new Promise((resolve, reject) => {
                if (this.status === 'completed' || this.status === 'needinit') {
                    reject('Your transaction have already been completed on need to be init.');
                    return;
                }

                var asset = new Asset();
                asset.init({
                    assetName: this.assetName
                }).then(() => {
                    if (asset.status === 'notexists') {
                        reject('Your transaction can\'t be requested. The asset doesn\'t exist.');
                        return;
                    }

                    let transactionInitFn = (this.transactionKey) ? TokiumAPI.transactionInitImplicit : TokiumAPI.transactionInitExplicit;
                    let data = {
                        ...wallet,
                        signOnline
                    };

                    (this.transactionKey) ? (data.transactionKey = this.transactionKey) : (data.transactionInfo = this);

                    transactionInitFn(asset.server, data).then(txData => {
                        this.status = txData.status;
                        this.transactionKey = txData.transactionKey;
                        if (txData.status === 'waiting') this.txHex = txData.tx;

                        resolve();
                    }).catch(err => {
                        reject(err);
                    });
                });
            });
        }

        _getTransactionWithTransactionKey(transactionKey) {
            return new Promise((resolve, reject) => {
                var docRef = db.collection('transactions').doc(transactionKey);

                docRef.get().then(doc => {
                    if (doc.exists) {
                        resolve(doc.data());
                    } else {
                        reject();
                    }
                }).catch(err => {
                    console.error('Error getting document:', err);
                    reject(err);
                });
            });
        }
    };

})();