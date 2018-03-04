var fetch = fetch || require('node-fetch');

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
