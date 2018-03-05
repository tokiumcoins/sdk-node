## Services

### Login

```js
login(email, password).then(function(firebaseUserInfo) {
    // Do something
});
```

```js
firebaseUserInfo = {
    ...
    "uid": "<uid>",
    ...
}
```

### Get Accounts

```js
getAccounts().then(function(accounts) {
    // Do something
});
```

```js
accounts = [
    {
        "address": "<address>",
        "asset_name": "<asset_name>",
        "balance": "<balance>",
        "owner": "<owner>",
        "private_key": "<private_key>",
        "public_key": "<public_key>",
        "server": "<server>"
    },
    ...
]
```

### Prepare Transaction

```js
prepareTransaction(fromAddress, toAddress, assetName, amount).then(function(transactionData) {
    // Do something
});
```

```js
transactionData = {
    "transactionKey": "<transactionKey>"
}
```

### Complete Transaction

```js
completeTransaction(accountPin, privateKey, transactionKey).then(function() {
    // Do something
});
```

### Get Assets List

```js
getAssetsList().then(function(assetsList) {
    // Do something
});
```

```js
assetsList = [
    {
        "name": "<name>",
        "owner": "<owner>",
        "server": "<server>",
    },
    ...
]
```

## Events

```js
tokiumEvents.on('event-name', function(data) {
    // Do something
});
```

### waiting-transactions-changed

```js
data = {
    "transaction_id_1": {
        "amount": "amount",
        "asset_name": "asset_name",
        "from": "from",
        "fromAddress": "fromAddress",
        "status": "status",
        "to": "to",
        "toAddress": "toAddress"
    },
    ...
}
```

### accounts-changed

```js
data = {
    {
        "address": "<address>",
        "asset_name": "<asset_name>",
        "balance": "<balance>",
        "owner": "<owner>",
        "private_key": "<private_key>",
        "public_key": "<public_key>",
        "server": "<server>"
    },
    ...
}
```