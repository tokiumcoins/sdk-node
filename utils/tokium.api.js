const _fetch = fetch || require('node-fetch');

let authorizationToken = null;

function walletCreate(host, data) {
    return new Promise(function(resolve, reject) {
        if (!data.assetName || !data.accountPin) {
            reject('Empty params.');
            return;
        }

        var uri = host + '/wallet/create';

        post(uri, data).then(function(result) {
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

function walletBalance(host, data) {
    return new Promise(function(resolve, reject) {
        if (!data.assetName || !data.address) {
            reject('Empty params.');
            return;
        }

        var uri = host + '/wallet/balance/' + data.assetName + '/' + data.address;

        get(uri).then(function(result) {
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

function transactionRequest(host, data) {
    return new Promise(function(resolve, reject) {
        if (!data.fromAddress || !data.toAddress || !data.assetName || !data.amount) {
            reject('Empty params.');
            return;
        }

        var uri = host + '/transaction/request';

        post(uri, data).then(function(result) {
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

function transactionInitExplicit(host, data) {
    return new Promise(function(resolve, reject) {
        if (!data.transactionInfo || !data.signOnline) {
            reject('Empty params.');
            return;
        }

        if (!data.transactionInfo.fromAddress || !data.transactionInfo.toAddress || !data.transactionInfo.assetName || !data.transactionInfo.amount) {
            reject('Invalid transaction info.');
            return;
        }

        var uri = host + '/transaction/init';

        post(uri, data).then(function(result) {
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

function transactionInitImplicit(host, data) {
    return new Promise(function(resolve, reject) {
        if (!data.transactionKey || !data.signOnline) {
            reject('Empty params.');
            return;
        }

        var uri = host + '/transaction/init';

        post(uri, data).then(function(result) {
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

function transactionSend(host, data) {
    return new Promise(function(resolve, reject) {
        if (!data.transactionKey || !data.signedTxHex) {
            reject('Empty params.');
            return;
        }

        var uri = host + '/transaction/send';

        post(uri, data).then(function(result) {
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

function assetCreate(host, data) {
    return new Promise(function(resolve, reject) {
        if (!data.assetName || !data.amount || !data.assetImage) {
            reject('Empty params.');
            return;
        }

        var uri = host + '/asset/create';

        post(uri, data).then(function(result) {
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

function get(uri) {
    return new Promise(function(resolve, reject) {
        var options = {
            headers: {
                authToken: authorizationToken
            }
        };

        _fetch(uri, options).then(function(res) {
            res.json();
        }).then(function(json) {
            resolve(json);
        }).catch(function(err) {
            resolve(err);
        });
    });
}

function post(uri, body) {
    return new Promise(function(resolve, reject) {
        var options = {
            method: 'POST',
            headers: {
                authToken: authorizationToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        };

        _fetch(uri, options).then(function(res) {
            res.json();
        }).then(function(json) {
            resolve(json);
        }).catch(function(err) {
            console.error(err);
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

function setAuthToken(authToken) {
    authorizationToken = authToken;
}

module.exports = {
    walletCreate:            walletCreate,
    walletBalance:           walletBalance,
    transactionRequest:      transactionRequest,
    transactionInitExplicit: transactionInitExplicit,
    transactionInitImplicit: transactionInitImplicit,
    assetCreate:             assetCreate,
    setAuthToken:            setAuthToken
}
