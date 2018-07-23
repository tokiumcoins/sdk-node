module.exports = (() => {

    const SERVER_FOR_NEW_ASSETS = 'https://blockchain-token.herokuapp.com';

    const TokiumAPI = require('../utils/tokium.api.js');

    return class Asset {
        constructor() {
            this.assetName      = null;
            this.amount         = null;
            this.enabled        = null;
            this.image          = null;
            this.owner          = null;
            this.server         = null;
            this.status         = 'needinit';
        }

        init(assetData) {
            return new Promise((resolve, reject) => {
                this._getAssetInfo(assetData.assetName).then(assetInfo => {
                    if (!assetInfo) {
                        this.assetName      = assetData.assetName;
                        this.amount         = assetData.amount;
                        this.image          = assetData.image;
                        this.status         = 'notexists';
                    } else {
                        this.assetName      = assetData.assetName;
                        this.amount         = assetInfo.amount;
                        this.enabled        = assetInfo.enabled;
                        this.image          = assetInfo.image;
                        this.owner          = assetInfo.owner;
                        this.server         = assetInfo.server;
                        this.status         = 'exists';
                    }

                    resolve();
                }).catch(err => {
                    reject(err);
                }); 
            });
        }

        create() {
            return new Promise((resolve, reject) => {
                if (this.status === 'needinit') {
                    reject('The asset need to be inited firstly.');
                    return;
                }

                if (this.status === 'exists') {
                    reject('The asset already exists.');
                    return;
                }

                TokiumAPI.assetCreate(SERVER_FOR_NEW_ASSETS, {
                    assetName:   this.assetName,
                    amount:      this.amount,
                    image:       this.image
                }).then(wallet => {
                    this._getAssetInfo(this.assetName).then(assetInfo => {
                        this.amount         = assetInfo.amount;
                        this.enabled        = assetInfo.enabled;
                        this.image          = assetInfo.image;
                        this.owner          = assetInfo.owner;
                        this.server         = assetInfo.server;
                        this.status         = 'exists';

                        let Wallet = require('./wallet.js');
                        let adminAssetWallet = new Wallet();

                        adminAssetWallet.init({
                            address: wallet.address,
                            assetName: wallet.assetName,
                            privateKey: wallet.privateKey
                        }).then(() => {
                            resolve(adminAssetWallet);
                        }).catch(err => {
                            reject(err);
                        });
                    }).catch(err => {
                        reject(err);
                    });
                }).catch(err => {
                    reject(err);
                });
            });
        }

        _getAssetInfo(assetName) {
            return new Promise((resolve, reject) => {
                var docRef = db.collection('assets').doc(assetName);

                docRef.get().then(doc => {
                    if (doc.exists) {
                        resolve(doc.data());
                    } else {
                        resolve();
                    }
                }).catch(err => {
                    console.error('Error getting document:', err);
                    reject(err);
                });
            });
        }
    };

})();
