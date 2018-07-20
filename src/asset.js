var TokiumAPI = require('../utils/tokium.api.js');

module.exports = class Asset {
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
            this.getAssetInfo(assetData.assetName).then(assetInfo => {
                if (!assetInfo) {
                    this.assetName      = assetData.assetName;
                    this.amount         = assetData.amount;
                    this.enabled        = assetData.enabled;
                    this.image          = assetData.image;
                    this.owner          = assetData.owner;
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

    getAssetInfo(assetName) {
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