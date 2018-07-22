const TokiumAPI = require('../utils/tokium.api.js');
const Asset = require('./asset.js');

module.exports = class Wallet {
    constructor(walletData) {
        this.walletPin       = null;
        this.privateKey      = null;
        this.address         = null;
        this.asset           = null;
        this.balance         = null;
        this.status          = 'needinit';
    }

    init(walletData) {
        return new Promise((resolve, reject) => {
            this.walletPin       = walletData.walletPin;
            this.privateKey      = walletData.privateKey;
            this.address         = walletData.address;

            if (walletData.assetName) {
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
                        console.error(err);
                        resolve();
                    });
                });
            } else {
                this.asset = walletData.asset;

                this._getWalletBalance().then(() => {
                    this.status = 'initiated';
                    resolve();
                }).catch(err => {
                    this.status = 'initiated';
                    console.error(err);
                    resolve();
                });
            }
        });
    }

    create(assetName, walletPin) {
        return new Promise((resolve, reject) => {
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

    _getWalletBalance() {
        return new Promise((resolve, reject) => {
            TokiumAPI.walletBalance(this.asset.server, {
                assetName: this.asset.assetName,
                address: this.address
            }).then(balanceData => {
                this.balance = balanceData.balance;

                resolve();
            }).catch(err => {
                this.balance = '...';

                reject(err);
            });
        });
    }
};