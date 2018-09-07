'use strict';

function getAssetsList(uid) {
    return new Promise(function (resolve, reject) {
        var queryRef = uid ? tokiumFirestore.collection('assets').where('owner', '==', uid) : tokiumFirestore.collection('assets');

        queryRef.get().then(function (querySnapshot) {
            var assetNamesArray = querySnapshot.docs.map(function (doc) {
                return doc.id;
            });

            _composeAssets(assetNamesArray).then(function (assets) {
                resolve(assets);
            }).catch(function (err) {
                reject(err);
            });
        }).catch(function (err) {
            console.log('Error getting document:', err);
            reject(err.message);
        });
    });
}

function _composeAssets(assetNamesArray) {
    return new Promise(function (resolve, reject) {
        var Asset = require('./asset.js');

        var assets = [];
        var promisesArray = [];

        assetNamesArray.forEach(function (assetName) {
            var assetObj = new Asset();
            assets.push(assetObj);

            var promise = assetObj.init({
                assetName: assetName
            });

            promisesArray.push(promise);
        });

        Promise.all(promisesArray).then(function () {
            resolve(assets);
        }).catch(function (err) {
            reject(err);
        });
    });
}

module.exports = {
    getAssetsList: getAssetsList
};