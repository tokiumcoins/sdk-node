require('cross-fetch/polyfill');

var authorizationToken = null;

const walletCreate = (host, data) => {
    return new Promise((resolve, reject) => {
        if (!data.assetName || ( !data.walletPin && data.walletPin !== '' )) {
            reject('Empty params.');
            return;
        }

        var uri = `${host}/wallet/create`;

        post(uri, data).then(result => {
            if (!result.success) {
                reject(result.message);
                return;
            }

            resolve(result.data);
        }).catch(() => {
            reject('There was an error requesting to tokium API.');
        });
    });
}

const walletBalance = (host, data) => {
    return new Promise((resolve, reject) => {
        if (!data.assetName || !data.address) {
            reject('Empty params.');
            return;
        }

        var uri = `${host}/wallet/balance/${data.assetName}/${data.address}`;

        get(uri).then(result => {
            if (!result.success) {
                reject(result.message);
                return;
            }

            resolve(result.data);
        }).catch(() => {
            reject('There was an error requesting to tokium API.');
        });
    });
}

const walletPassbook = (host, data) => {
    return new Promise((resolve, reject) => {
        if (!data.assetName || !data.address) {
            reject('Empty params.');
            return;
        }

        const uri = `${host}/wallet/passbook/${data.assetName}/${data.address}`;
        const options = {
            headers: {
                authToken: authorizationToken
            }
        };

        fetch(uri, options).then(res => {
            const dest = '/Users/jorge.prudencio/Desktop/blockchain/test/sdk-node-test/passbook.pkpass'
            const fileStream = fs.createWriteStream(dest);

            res.body.pipe(fileStream);

            res.body.on('error', (err) => {
                reject(err);
            });

            fileStream.on('finish', () => {
                resolve();
            });
        }).catch(err => {
            console.error(err);
            resolve(err);
        });
    });
};

const transactionRequest = (host, data) => {
    return new Promise((resolve, reject) => {
        if (!data.fromAddress || !data.toAddress || !data.assetName || !data.amount) {
            reject('Empty params.');
            return;
        }

        var uri = `${host}/transaction/request`;

        post(uri, data).then(result => {
            if (!result.success) {
                reject(result.message);
                return;
            }

            resolve(result.data);
        }).catch(() => {
            reject('There was an error requesting to tokium API.');
        });
    });
}

const transactionInitExplicit = (host, data) => {
    return new Promise((resolve, reject) => {
        if (!data.transactionInfo || data.signOnline === undefined) {
            reject('Empty params.');
            return;
        }

        if (!data.transactionInfo.fromAddress || !data.transactionInfo.toAddress || !data.transactionInfo.assetName || !data.transactionInfo.amount) {
            reject('Invalid transaction info.');
            return;
        }

        var uri = `${host}/transaction/init`;

        post(uri, data).then(result => {
            if (!result.success) {
                reject(result.message);
                return;
            }

            resolve(result.data);
        }).catch(() => {
            reject('There was an error requesting to tokium API.');
        });
    });
}

const transactionInitImplicit = (host, data) => {
    return new Promise((resolve, reject) => {
        if (!data.transactionKey || data.signOnline === undefined) {
            reject('Empty params.');
            return;
        }

        var uri = `${host}/transaction/init`;

        post(uri, data).then(result => {
            if (!result.success) {
                reject(result.message);
                return;
            }

            resolve(result.data);
        }).catch(() => {
            reject('There was an error requesting to tokium API.');
        });
    });
}

const transactionSend = (host, data) => {
    return new Promise((resolve, reject) => {
        if (!data.transactionKey || !data.signedTxHex) {
            reject('Empty params.');
            return;
        }

        var uri = `${host}/transaction/send`;

        post(uri, data).then(result => {
            if (!result.success) {
                reject(result.message);
                return;
            }

            resolve(result.data);
        }).catch(() => {
            reject('There was an error requesting to tokium API.');
        });
    });
}

const assetCreate = (host, data) => {
    return new Promise((resolve, reject) => {
        if (!data.assetName || !data.amount || !data.image) {
            reject('Empty params.');
            return;
        }

        var uri = `${host}/asset/create`;

        post(uri, data).then(result => {
            if (!result.success) {
                reject(result.message);
                return;
            }

            resolve(result.data);
        }).catch(() => {
            reject('There was an error requesting to tokium API.');
        });
    });
}

const assetReissuance = (host, data) => {
    return new Promise((resolve, reject) => {
        if (!data.privateKey || !data.transactionInfo) {
            reject('Empty params.');
            return;
        }

        if (!data.transactionInfo.fromAddress || !data.transactionInfo.toAddress || !data.transactionInfo.assetName || !data.transactionInfo.amount) {
            reject('Invalid transaction info.');
            return;
        }

        var uri = `${host}/asset/reissuance`;

        post(uri, data).then(result => {
            if (!result.success) {
                reject(result.message);
                return;
            }

            resolve(result.data);
        }).catch(() => {
            reject('There was an error requesting to tokium API.');
        });
    });
}

const get = uri => {
    return new Promise((resolve, reject) => {
        var options = {
            headers: {
                authToken: authorizationToken
            }
        };

        fetch(uri, options).then(res => {
            res.text().then(text => {
                if (isJson(text)) return resolve(JSON.parse(text));
                resolve(text);
            });
        }).catch(err => {
            console.error(err);
            resolve(err);
        });
    });
}

const post = (uri, body) => {
    return new Promise((resolve, reject) => {
        var options = {
            method: 'POST',
            headers: {
                authToken: authorizationToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        };

        fetch(uri, options).then(res => {
            res.text().then(text => {
                resolve(JSON.parse(text));
            });
        }).catch(err => {
            resolve(err);
        });
    });
}

const isJson = str => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

const setAuthToken = authToken => {
    authorizationToken = authToken;
}

module.exports = {
    walletCreate,
    walletBalance,
    walletPassbook,
    transactionRequest,
    transactionInitExplicit,
    transactionInitImplicit,
    assetCreate,
    assetReissuance,
    setAuthToken
}
