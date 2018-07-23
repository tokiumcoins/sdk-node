# Profile

```js
const Tokium = require('sdk-node');
let Profile = Tokium.Profile();
let profile = new Profile();
```

**Profile Data Model**

```js
Profile {
    uid: String(),
    email: String(),
    allowedAssets: Int(),
    wallets: [ Wallet(), Wallet(), ... ],
    status: String(),
    listeners: [ Object(), Object(), ... ]
}
```

**Flow**

| Status | Meaning |
| - | - |
| needlogin | Need to do login. |
| loggedin | Loggued in, you can call logout(), and other methods. |

## Methods

### Login

```js
profile.login('email@email.com', 'password').then(() => {
    console.info(profile);
}).catch(err => {
    console.error(err);
});
```

### Logout

```js
profile.logout().then(() => {
    console.info(profile);
}).catch(err => {
    console.error(err);
});
```

### Is logged in

```js
let isLoggedIn = profile.isLoggedIn(); // True or false
```

### Get Wallets

```js
profile.getWallets().then(() => {
    console.info(profile.wallets);
}).catch(err => {
    console.error(err);
});
```

### Get Transactions

```js
profile.getTransactions().then(transactions => {
    console.info(transactions); // [ Transaction(), Transaction(), ... ]
}).catch(err => {
    console.error(err);
});
```

## Events

### wallets-changed

```js
tokiumEvents.on('wallets-changed', profile => {
    console.info(profile); // Profile()
});
```

### waiting-transactions-changed

```js
tokiumEvents.on('waiting-transactions-changed', transactions => {
    console.info(transactions); // [ Transaction(), Transaction(), ... ]
})
```

## Asset

## Transaction

## Wallet

## Services

------

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
newAccount(assetName, walletPin).then(function(account) {
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
completeTransaction(walletPin, privateKey, transactionKey).then(function() {
    // Do something
});
```

### Request asset

```js
requestAsset(assetName, assetImage, amount).then(function() {
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