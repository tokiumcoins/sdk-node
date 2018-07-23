# ``Profile``

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
| needlogin | Need to do login(). |
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

# ``Asset``

```js
const Tokium = require('sdk-node');
let Asset = Tokium.Asset();
let asset = new Asset();
```

**Asset Data Model**

```js
Asset {
    assetName: String(),
    amount: Int(),
    enabled: Boolean(),
    image: String(),
    owner: String(),
    server: String(),
    status: String()
}
```

**Flow**

| Status | Meaning |
| - | - |
| needinit | Need to do init(). |
| notexists | Asset doesn't exist on database. Need to do create(). |
| exists | Asset exists on database. You can use it to create wallets and do transactions. |

## Methods

### init()

```js
asset.init(assetData).then(() => {
    console.info(asset);
}).catch(err => {
    console.error(err);
});
```

* assetData:

```js
let assetData = {
    assetName: String(),    // Required
    amount: Int(),          // Optional (will be overwritten if asset exists)
    image: 'http://...'     // Optional (will be overwritten if asset exists)
}
```

* Note:

If assetName exists, its properties will be loaded and status will be ``exists``. If it doesn't exist, status will be ``notexists`` and you can create it with ``asset.create()``.

### create()

```js
asset.amount = Int();   // Required
asset.image = 'http://...';   // Required

asset.create().then(() => {
    console.info(asset);
}).catch(err => {
    console.error(err);
});
```

# ``Transaction``

```js
const Tokium = require('sdk-node');
let Transaction = Tokium.Transaction();
let transaction = new Transaction();
```

**Transaction Data Model**

```js
Asset {
    amount: Int(),
    assetName: String(),
    fromAddress: String(),
    toAddress: String(),
    transactionKey: String(),
    txHex: String(),
    status: String()
}
```

**Flow**

| Status | Meaning |
| - | - |
| needinit | Need to do init(). |
| local | Transaction doesn't exist on database and is local. Need to do requestTransaction() or initTransaction(). |
| waiting | Transaction exists on database but it is waiting to be sent completed. Need to do initTransaction() with ``signOnline = true``. |
| completed | Transaction is completed. Nothing more to do. |

## Methods

### init()

```js
transaction.init(txData).then(() => {
    console.info(transaction);
}).catch(err => {
    console.error(err);
});
```

* txData - DM 1

```js
txData = {
    transactionKey: String()
}
```

Allows to recover a transaction from database.

* txData - DM 2

```js
txData = {
    amount: Int(),
    assetName: String(),
    fromAddress: String(),
    toAddress: String()
}
```

Allows to start a new transaction.

### requestTransaction()

```js
transaction.requestTransaction().then(() => {
    console.info(transaction);
}).catch(err => {
    console.error(err);
});
```

Register the transaction on database but it isn't sended to blockchain. Very usefull to request transactions to other users.

### initTransaction()

```js
transaction.initTransaction(wallet, signOnline).then(() => {
    console.info(transaction);
}).catch(err => {
    console.error(err);
});
```

* wallet

```js
let wallet = {
    address: String(),
    privateKey: String(),
    walletPin: String()
};
```

or

```js
let wallet = new Tokium.Wallet();
```

* signOnline

If ``true``, the transaction will be signed online with ``wallet.privateKey`` and ``wallet.walletPin``. If ``false``, ``transaction.txHex`` need to be signed offline and be sent later.

NOTE: For the moment, only ``true`` is supported.

# ``Wallet``

```js
const Tokium = require('sdk-node');
let Wallet = Tokium.Wallet();
let wallet = new Wallet();
```

**Wallet Data Model**

```js
Wallet {
    walletPin: Int(),
    privateKey: String(),
    address: String(),
    asset: Asset(),
    balance: Int(),
    status: String()
}
```

**Flow**

| Status | Meaning |
| - | - |
| needlogin | Need to do init() or create(). |
| initiated | Wallet is initiated and you can use it. |

## Methods

### init()

```js
wallet.init(walletData).then(() => {
    console.info(wallet);
}).catch(err => {
    console.error(err);
});
```

* walletData

```js
walletData = {
    walletPin: String(),    // Required
    privateKey: String(),   // Required
    address: String(),      // Required
    assetName: String()     // Required
}

```

or

```js
walletData = {
    walletPin: String(),    // Required
    privateKey: String(),   // Required
    address: String(),      // Required
    asset: Asset()          // Required
}
```

### create()

```js
wallet.create(assetName, walletPin).then(() => {
    console.info(wallet);
}).catch(err => {
    console.error(err);
});
```

### update()

```js
wallet.update().then(() => {
    console.info(wallet);
}).catch(err => {
    console.error(err);
});
```
