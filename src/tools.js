function getAssetsList(uid) {
    return new Promise(function(resolve, reject) {
        var queryRef = uid ? db.collection('assets').where('owner', '==', uid) : db.collection('assets');

        queryRef.get().then(querySnapshot => {
            var assetNamesArray = querySnapshot.docs.map(doc => {
                return doc.id;
            });

            _composeAssets(assetNamesArray).then(assets => {
                resolve(assets);
            }).catch(err => {
                reject(err);
            });
        }).catch(err => {
            console.log('Error getting document:', err);
            reject(err.message);
        });
    });
}

function _composeAssets(assetNamesArray) {
    return new Promise((resolve, reject) => {
        let Asset = require('./asset.js');

        let assets = [];
        let promisesArray = [];

        assetNamesArray.forEach(assetName => {
            let assetObj = new Asset();
            assets.push(assetObj);

            let promise = assetObj.init({
                assetName: assetName
            });

            promisesArray.push(promise);
        });

        Promise.all(promisesArray).then(() => {
            resolve(assets);
        }).catch(err => {
            reject(err);
        });
    });
}

module.exports = {
    getAssetsList: getAssetsList
}