'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getAssetsList = undefined;

var _services = require('../utils/services.js');

var _asset = require('./asset.js');

var _asset2 = _interopRequireDefault(_asset);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getAssetsList(uid) {
    return new Promise(function (resolve, reject) {
        var queryRef = uid ? _services.firestore.collection('assets').where('owner', '==', uid) : _services.firestore.collection('assets');

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
        var assets = [];
        var promisesArray = [];

        assetNamesArray.forEach(function (assetName) {
            var assetObj = new _asset2.default();
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

exports.getAssetsList = getAssetsList;