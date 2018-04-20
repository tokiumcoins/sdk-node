var fetch = fetch || require('node-fetch');

function newAddress(host, authToken, data) {
    return new Promise(function(resolve, reject) {
        if (!data.assetName || !data.accountPin) {
            reject('Empty params.');
            return;
        }

        var uri = host + '/address/new';

        post(authToken, uri, {
            assetName: data.assetName,
            accountPin: data.accountPin
        }).then(function(result) {
            if (!result.success) {
                reject(result.message);
                return;
            }

            resolve(result.data);
        }).catch(function() {
            reject('There was an error requesting to tokium API.');
        });
    });
}

function getAddressBalance(host, authToken, data) {
    return new Promise(function(resolve, reject) {
        if (!data.assetName || !data.address) {
            reject('Empty params.');
            return;
        }

        var uri = host + '/balance/' + data.assetName + '/' + data.address;

        get(authToken, uri).then(function(result) {
            if (!result.success) {
                reject(result.message);
                return;
            }

            resolve(result.data);
        }).catch(function() {
            reject('There was an error requesting to tokium API.');
        });
    });
}

function prepareTransaction(host, authToken, data) {
    return new Promise(function(resolve, reject) {
        if (!data.fromAddress || !data.toAddress || !data.assetName || !data.amount) {
            reject('Empty params.');
            return;
        }

        var uri = host + '/transaction/prepare';

        post(authToken, uri, {
            fromAddress: data.fromAddress,
            toAddress: data.toAddress,
            assetName: data.assetName,
            amount: data.amount
        }).then(function(result) {
            if (!result.success) {
                reject(result.message);
                return;
            }

            resolve(result.data);
        }).catch(function() {
            reject('There was an error requesting to tokium API.');
        });
    });
}

function completeTransaction(host, authToken, data) {
    return new Promise(function(resolve, reject) {
        if (!data.accountPin || !data.privateKey || !data.transactionKey) {
            reject('Empty params.');
            return;
        }

        var uri = host + '/transaction/complete';

        post(authToken, uri, {
            accountPin: data.accountPin,
            privateKey: data.privateKey,
            transactionKey: data.transactionKey
        }).then(function(result) {
            if (!result.success) {
                reject(result.message);
                return;
            }

            resolve(result.data);
        }).catch(function() {
            reject('There was an error requesting to tokium API.');
        });
    });
}

function requestAsset(host, authToken, data) {
    return new Promise(function(resolve, reject) {
        if (!data.assetName || !data.assetImage || !data.amount) {
            reject('Empty params.');
            return;
        }

        var uri = host + '/asset/request';

        post(authToken, uri, {
            assetName:  data.assetName,
            assetImage: data.assetImage,
            amount:     data.amount
        }).then(function(result) {
            if (!result.success) {
                reject(result.message);
                return;
            }

            resolve(result.data);
        }).catch(function() {
            reject('There was an error requesting to tokium API.');
        });
    });
}

function get(authToken, uri) {
    return new Promise(function(resolve, reject) {
        var options = {
            headers: {
                authToken: authToken
            }
        };

        fetch(uri, options)
            .then(res => res.json())
            .then(json => resolve(json))
            .catch((err) => {
                console.info(err);
                resolve(err);
            });
    });
}

function post(authToken, uri, body) {
    return new Promise(function(resolve, reject) {
        var options = {
            method: 'POST',
            headers: {
                authToken: authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        };

        fetch(uri, options)
            .then(res => res.json())
            .then(json => resolve(json))
            .catch((err) => {
                console.info(err);
                resolve(err);
            });
    });
}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

module.exports = {
    newAddress: newAddress,
    getAddressBalance: getAddressBalance,
    prepareTransaction: prepareTransaction,
    completeTransaction: completeTransaction,
    requestAsset: requestAsset
}
