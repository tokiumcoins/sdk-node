'use strict';

require('cross-fetch/polyfill');

var authorizationToken = null;

var walletCreate = function walletCreate(host, data) {
    return new Promise(function (resolve, reject) {
        if (!data.assetName || !data.walletPin && data.walletPin !== '') {
            reject('Empty params.');
            return;
        }

        var uri = host + '/wallet/create';

        post(uri, data).then(function (result) {
            if (!result.success) {
                reject(result.message);
                return;
            }

            resolve(result.data);
        }).catch(function () {
            reject('There was an error requesting to tokium API.');
        });
    });
};

var walletBalance = function walletBalance(host, data) {
    return new Promise(function (resolve, reject) {
        if (!data.assetName || !data.address) {
            reject('Empty params.');
            return;
        }

        var uri = host + '/wallet/balance/' + data.assetName + '/' + data.address;

        get(uri).then(function (result) {
            if (!result.success) {
                reject(result.message);
                return;
            }

            resolve(result.data);
        }).catch(function () {
            reject('There was an error requesting to tokium API.');
        });
    });
};

var walletPassbook = function walletPassbook(host, data, path) {
    return new Promise(function (resolve, reject) {
        if (!data.assetName || !data.address) {
            reject('Empty params.');
            return;
        }

        var uri = host + '/wallet/passbook/' + data.assetName + '/' + data.address;
        var options = {
            headers: {
                authToken: authorizationToken
            }
        };

        fetch(uri, options).then(function (res) {
            var fileStream = fs.createWriteStream(path);

            res.body.pipe(fileStream);

            res.body.on('error', function (err) {
                reject(err);
            });

            fileStream.on('finish', function () {
                resolve();
            });
        }).catch(function (err) {
            console.error(err);
            resolve(err);
        });
    });
};

var transactionRequest = function transactionRequest(host, data) {
    return new Promise(function (resolve, reject) {
        if (!data.fromAddress || !data.toAddress || !data.assetName || !data.amount) {
            reject('Empty params.');
            return;
        }

        var uri = host + '/transaction/request';

        post(uri, data).then(function (result) {
            if (!result.success) {
                reject(result.message);
                return;
            }

            resolve(result.data);
        }).catch(function () {
            reject('There was an error requesting to tokium API.');
        });
    });
};

var transactionInitExplicit = function transactionInitExplicit(host, data) {
    return new Promise(function (resolve, reject) {
        if (!data.transactionInfo || data.signOnline === undefined) {
            reject('Empty params.');
            return;
        }

        if (!data.transactionInfo.fromAddress || !data.transactionInfo.toAddress || !data.transactionInfo.assetName || !data.transactionInfo.amount) {
            reject('Invalid transaction info.');
            return;
        }

        var uri = host + '/transaction/init';

        post(uri, data).then(function (result) {
            if (!result.success) {
                reject(result.message);
                return;
            }

            resolve(result.data);
        }).catch(function () {
            reject('There was an error requesting to tokium API.');
        });
    });
};

var transactionInitImplicit = function transactionInitImplicit(host, data) {
    return new Promise(function (resolve, reject) {
        if (!data.transactionKey || data.signOnline === undefined) {
            reject('Empty params.');
            return;
        }

        var uri = host + '/transaction/init';

        post(uri, data).then(function (result) {
            if (!result.success) {
                reject(result.message);
                return;
            }

            resolve(result.data);
        }).catch(function () {
            reject('There was an error requesting to tokium API.');
        });
    });
};

var transactionSend = function transactionSend(host, data) {
    return new Promise(function (resolve, reject) {
        if (!data.transactionKey || !data.signedTxHex) {
            reject('Empty params.');
            return;
        }

        var uri = host + '/transaction/send';

        post(uri, data).then(function (result) {
            if (!result.success) {
                reject(result.message);
                return;
            }

            resolve(result.data);
        }).catch(function () {
            reject('There was an error requesting to tokium API.');
        });
    });
};

var assetCreate = function assetCreate(host, data) {
    return new Promise(function (resolve, reject) {
        if (!data.assetName || !data.amount || !data.image) {
            reject('Empty params.');
            return;
        }

        var uri = host + '/asset/create';

        post(uri, data).then(function (result) {
            if (!result.success) {
                reject(result.message);
                return;
            }

            resolve(result.data);
        }).catch(function () {
            reject('There was an error requesting to tokium API.');
        });
    });
};

var assetReissuance = function assetReissuance(host, data) {
    return new Promise(function (resolve, reject) {
        if (!data.privateKey || !data.transactionInfo) {
            reject('Empty params.');
            return;
        }

        if (!data.transactionInfo.fromAddress || !data.transactionInfo.toAddress || !data.transactionInfo.assetName || !data.transactionInfo.amount) {
            reject('Invalid transaction info.');
            return;
        }

        var uri = host + '/asset/reissuance';

        post(uri, data).then(function (result) {
            if (!result.success) {
                reject(result.message);
                return;
            }

            resolve(result.data);
        }).catch(function () {
            reject('There was an error requesting to tokium API.');
        });
    });
};

var get = function get(uri) {
    return new Promise(function (resolve, reject) {
        var options = {
            headers: {
                authToken: authorizationToken
            }
        };

        fetch(uri, options).then(function (res) {
            res.text().then(function (text) {
                if (isJson(text)) return resolve(JSON.parse(text));
                resolve(text);
            });
        }).catch(function (err) {
            console.error(err);
            resolve(err);
        });
    });
};

var post = function post(uri, body) {
    return new Promise(function (resolve, reject) {
        var options = {
            method: 'POST',
            headers: {
                authToken: authorizationToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        };

        fetch(uri, options).then(function (res) {
            res.text().then(function (text) {
                resolve(JSON.parse(text));
            });
        }).catch(function (err) {
            resolve(err);
        });
    });
};

var isJson = function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

var setAuthToken = function setAuthToken(authToken) {
    authorizationToken = authToken;
};

module.exports = {
    walletCreate: walletCreate,
    walletBalance: walletBalance,
    walletPassbook: walletPassbook,
    transactionRequest: transactionRequest,
    transactionInitExplicit: transactionInitExplicit,
    transactionInitImplicit: transactionInitImplicit,
    assetCreate: assetCreate,
    assetReissuance: assetReissuance,
    setAuthToken: setAuthToken
};