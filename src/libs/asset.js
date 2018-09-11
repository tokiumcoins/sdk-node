import { firestore } from '../utils/services.js';
import Wallet from './wallet.js';

const TokiumAPI = require('../utils/tokium.api.js');
const SERVER_FOR_NEW_ASSETS = 'https://blockchain-token.herokuapp.com';

export default class Asset {
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

            if (!this.assetName || !this.amount || !this.image) {
                reject('You need to define assetName, amount and image before.');
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

    reissuance(reissuranceInfo, wallet) {
        return new Promise((resolve, reject) => {
            if (this.status === 'needinit') {
                reject('The asset need to be inited firstly.');
                return;
            }

            if (this.status !== 'exists') {
                reject('The asset need to exist before.');
                return;
            }

            if (wallet.asset.assetName !== this.assetName) {
                reject('You can\'t reissue assets with defined wallet.');
                return;
            }

            if (!reissuranceInfo.amount || !reissuranceInfo.toAddress) {
                reject('Reissurance amount and toAddress are not defined.');
                return;
            }

            TokiumAPI.assetReissuance(this.server, {
                walletPin: wallet.walletPin,
                privateKey: wallet.privateKey,
                transactionInfo: {
                    fromAddress: wallet.address,
                    toAddress: reissuranceInfo.toAddress,
                    assetName: this.assetName,
                    amount: reissuranceInfo.amount
                }
            }).then(() => {
                resolve();
            }).catch(err => {
                reject(err);
            });
        });
    }

    _getAssetInfo(assetName) {
        return new Promise((resolve, reject) => {
            var docRef = firestore.collection('assets').doc(assetName);

            docRef.get().then(doc => {
                if (doc.exists) {
                    resolve(doc.data());
                } else {
                    resolve();
                }
            }).catch(err => {
                reject(err);
            });
        });
    }
};
