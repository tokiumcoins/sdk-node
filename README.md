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

### Logout

```js
logout().then(function() {
    // Do something
});
```

### Is Logged In

```js
var isLoggedIn = isLoggedIn(); // true or false
```

### New Account

```js
newAccount(assetName, accountPin).then(function(account) {
    // Do something
});
```

```js
account = {
    address: <address>,
    privateKey: <privkey>,
    assetName: <assetName>
}
```

### Get Account

```js
getAccount(address).then(function(account) {
    // Do something
});
```

```js
account = {
    "address": "<address>",
    "asset_name": "<asset_name>",
    "balance": "<balance>",
    "owner": "<owner>",
    "private_key": "<private_key>",
    "public_key": "<public_key>",
    "server": "<server>"
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
getAssetsList(options).then(function(assetsList) {
    // Do something
});
```

```js
options = {
    "onlyMyAssets": "boolean"
}
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

### Get Transactions List

```js
getTransactionsList().then(function(transactionsList) {
    // Do something
});
```

```js
transactionsList = {
    receiver: [
        {
            "transactionKey": "<transactionKey>",
            "amount": "<amount>",
            "asset_name": "<asset_name>",
            "from": "<from>",
            "fromAddress": "<fromAddress>",
            "status": "<status>",
            "to": "<to>",
            "toAddress": "<toAddress>"
        },
        ...
    ],
    sender: [
        {
            "transactionKey": "<transactionKey>",
            "amount": "<amount>",
            "asset_name": "<asset_name>",
            "from": "<from>",
            "fromAddress": "<fromAddress>",
            "status": "<status>",
            "to": "<to>",
            "toAddress": "<toAddress>"
        },
        ...
    ]
}
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
    {
        "transactionKey": "<transactionKey>",
        "amount": "<amount>",
        "asset_name": "<asset_name>",
        "from": "<from>",
        "fromAddress": "<fromAddress>",
        "status": "<status>",
        "to": "<to>",
        "toAddress": "<toAddress>"
    },
    ...
}
```

### accounts-changed

```js
data = [
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