const TokiumAPI = require('../utils/tokium.api.js');
const Storage = require('../utils/storage.js');

module.exports = (() => {

    return class Wallet {
        constructor() {
            this.walletPin       = null;
            this.privateKey      = null;
            this.address         = null;
            this.asset           = null;
            this.balance         = null;
            this.status          = 'needinit';
        }

        init(walletData) {
            return new Promise((resolve, reject) => {
                this.walletPin       = walletData.walletPin || '';
                this.privateKey      = walletData.privateKey || '';
                this.address         = walletData.address;

                // With assetName string
                if (walletData.assetName) {
                    let Asset = require('./asset.js');
                    let asset = new Asset();

                    asset.init({
                        assetName: walletData.assetName
                    }).then(() => {
                        this.asset = asset;

                        this._getWalletBalance().then(() => {
                            this.status = 'initiated';
                            resolve();
                        }).catch(err => {
                            this.status = 'initiated';
                            resolve();
                        });
                    });

                // With Asset() object
                } else {
                    this.asset = walletData.asset;

                    this._getWalletBalance().then(() => {
                        this.status = 'initiated';
                        resolve();
                    }).catch(err => {
                        this.status = 'initiated';
                        resolve();
                    });
                }
            });
        }

        create(assetName, walletPin) {
            return new Promise((resolve, reject) => {
                let Asset = require('./asset.js');
                let asset = new Asset();

                asset.init({
                    assetName: assetName
                }).then(() => {
                    TokiumAPI.walletCreate(asset.server, {
                        assetName: assetName,
                        walletPin: walletPin
                    }).then(walletData => {
                        this.walletPin = walletPin;
                        this.privateKey = walletData.privateKey;
                        this.address = walletData.address;
                        this.asset = asset;
                        this.balance = 0;
                        this.status = 'initiated';

                        resolve();
                    }).catch(err => {
                        reject(err);
                    });
                }).catch(err => {
                    reject(err);
                });
            });
        }

        update() {
            return new Promise((resolve, reject) => {
                if (this.status === 'needinit') {
                    reject('You need to init or create your wallet before.');
                    return;
                }

                this._getWalletBalance().then(() => {
                    resolve();
                }).catch(err => {
                    resolve();
                });
            });
        }

        delete() {
            return new Promise((resolve, reject) => {
                if (this.status === 'needinit') {
                    reject('You need to init or create your wallet before.');
                    return;
                }

                if (!tokiumFirebase.auth().currentUser.uid) {
                    reject('You need to login before.');
                    return;
                }

                var query = tokiumFirestore.collection('asset_accounts')
                    .where('owner', '==', tokiumFirebase.auth().currentUser.uid)
                    .where('address', '==', this.address);

                query.get().then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        doc.ref.delete();
                    });
                    this._reset();

                    resolve();
                });
            });
        }

        savePrivateKey(privateKey) {
            const storage = new Storage();
            privateKey = privateKey || this.privateKey;

            return new Promise((resolve, reject) => {
                if (!privateKey) {
                    reject('You need to define a privateKey.');
                    return;
                }

                storage.set(this.address + '.privKey', privateKey).then(() => {
                    this.privateKey = privateKey;
                    resolve();
                }).catch(err => {
                    reject(err);
                });
            });
        }

        getPrivateKey() {
            const storage = new Storage();

            return new Promise((resolve, reject) => {
                storage.get(this.address + '.privKey').then(value => {
                    if (!value) {
                        reject('This private key is not stored on device storage.');
                        return;
                    }

                    this.privateKey = value;
                    resolve();
                }).catch(err => {
                    reject(err);
                });
            });
        }

        clearPrivateKey() {
            const storage = new Storage();

            return new Promise((resolve, reject) => {
                storage.remove(this.address + '.privKey').then(value => {
                    this.privateKey = '';
                    resolve();
                }).catch(err => {
                    reject(err);
                });
            });
        }

        _reset() {
            this.walletPin       = null;
            this.privateKey      = null;
            this.address         = null;
            this.asset           = null;
            this.balance         = null;
            this.status          = 'needinit';
        }

        _getWalletBalance() {
            return new Promise((resolve, reject) => {
                if (!this.asset.server || !this.asset.assetName || !this.address) {
                    this.balance = '...';
                    resolve();
                    return;
                }

                TokiumAPI.walletBalance(this.asset.server, {
                    assetName: this.asset.assetName,
                    address: this.address
                }).then(balanceData => {
                    this.balance = balanceData ? balanceData.balance : '...';

                    resolve();
                }).catch(err => {
                    this.balance = '...';

                    resolve();
                });
            });
        }
    };

})();