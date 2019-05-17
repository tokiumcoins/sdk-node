# Test Tokium SDK!

Do you want to test Tokium SDK? Send us an email to [hello@tokium.one](mailto:hello@tokium.one) and we will enable you our test environment.

# 1. General description

Tokium is a SDK that allows to develop blockchain based apps easily without a big technical knowledge of blockchain. Tokium uses a private blockchain hosted on AWS and hosts all assets inside this network.

At this moment, Tokium supports these features:

- Create new accounts.
- Create new assets.
- Create new wallets.
- Secure wallet keys inside secure storage.
- Make transactions.
- Generate a Passbook of your wallet.

On this guide, we will expose all Tokium current features. If you need help with our SDK you can contact us on [hello@tokium.one](mailto:hello@tokium.one).

## 1.1 Create Asset

If you want to create a new asset and exchange it with Tokium, mail us to [hello@tokium.one](mailto:hello@tokium.one).

## 1.2 Environment

Tokium has been developed to be compatible with React and React Native. You can use the SDK with more platforms, but we don't guarantee the correct behavior. We will integrate Tokium on more platforms in the future.

To integrate Tokium SDK on your project you need to start a new React  / React Native app. You can check React / React Native documentation on the next links:

- [https://github.com/facebook/create-react-app](https://github.com/facebook/create-react-app)
- [https://github.com/react-community/create-react-native-app](https://github.com/react-community/create-react-native-app)
- [https://expo.io/learn](https://expo.io/learn)

Then, you need to install Tokium SDK:

```sh
npm i --save @tokium/tokium-sdk
```

or 

```sh
yarn add @tokium/tokium-sdk
```

With NPM dependency installed, you can start to use Tokium SDK on your React / React Native app:

```js
const Tokium = require('@tokium/tokium-sdk');

const currentUser = Tokium.currentUser;

currentUser.login('email@email.com', 'password').then(() => {
    console.info(currentUser);
}).catch(err => {
    console.error(err);
});
```

## 1.3 Tokium SDK features

### 1.3.1 Create new account

```js
const Tokium = require('@tokium/tokium-sdk');

const newProfile = new Tokium.Profile();

newProfile.signup('email@email.com', 'password').then(() => {
    console.info(newProfile);
}).catch(err => {
    console.error(err);
});
```

### 1.3.2 Login

```js
const Tokium = require('@tokium/tokium-sdk');

const currentUser = Tokium.currentUser;

currentUser.login('email@email.com', 'password').then(() => {
    console.info(currentUser);
}).catch(err => {
    console.error(err);
});
```

### 1.3.3 Logout

```js
const Tokium = require('@tokium/tokium-sdk');

const currentUser = Tokium.currentUser;

currentUser.logout().then(() => {
    console.info(currentUser);
}).catch(err => {
    console.error(err);
});
```

### 1.3.4 Get your wallets

```js
const Tokium = require('@tokium/tokium-sdk');

const currentUser = Tokium.currentUser;
console.info(currentUser.wallets);
```

### 1.3.5 Create new wallet

```js
const Tokium = require('@tokium/tokium-sdk');

const wallet = new Tokium.Wallet();

wallet.create('your-asset-name', '').then(() => {
    console.info(wallet);
}).catch(err => {
    console.error(err);
});
```

**Result:**

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

**IMPORTANT**: Private Key is not saved on our systems, it's your responsibility to save it on a safe place.  You can save it on your local storage with ``Secure wallet keys inside secure storage`` Tokium SDK Feature. You can read about it on the next point.

### 1.3.6 Secure wallet keys inside secure storage

This feature allows you to save private keys on a safe place inside your mobile. Your keys will be saved locally. If you change your mobile, you need to transfer the keys to the new device.

When you create a new wallet, privateKey value is defined and is the best moment to execute this feature.

#### Save key

```js
wallet.savePrivateKey(wallet.privateKey).then(() => {
    console.info(wallet);
}).catch(err => {
    console.error(err);
});
```

#### Get key

Only works if you have saved privateKey before.

```js
wallet.getPrivateKey().then(() => {
    console.info(wallet);
}).catch(err => {
    console.error(err);
});
```

#### Technical details

Tokium SDK tries to save privateKey on the safest place disponible. The default places where Tokium tries to save your keys are:

- **SecureStorage**: Keychain on iOS or encrypted storage on Android. This storage will be used if you use Expo (React Native).
- **AsyncStorage**: React Native basic storage. Unencrypted, asynchronous and persistent.
- **LocalStorage**: React Web storage. Unencrypted, asynchronous and persistent.

If you want to use an alternative storage you can overwrite ``global.storageController`` object with the next class example:

```js
class StorageMock {
    constructor() {};

    setItem(key, data) {
        return new Promise((resolve) => {
            resolve();
        });
    };

    getItem(key) {
        return new Promise((resolve) => {
            const examplePrivKey = 'fake_priv_key';
            resolve(examplePrivKey);
        });
    };

    removeItem(key) {
        return new Promise((resolve) => {
            resolve();
        });
    };
}
```

### 1.3.7 Make transactions

Transactions are composed of two steps. The first step is to report the transaction to our systems. The second step is to sign the transaction.

This two steps can be done from different devices. One user can request a payment and other can sign and complete it.

```js
const Tokium = require('@tokium/tokium-sdk');

const transaction = new Tokium.Transaction();

const fromWallet = {
    address: '<from_wallet_address>',
    privateKey: '<from_wallet_private_key>',
    walletPin: ''
};

const txData = {
    amount = 100,
    assetName: '<wallet_asset_name>',
    fromAddress: fromWallet.address,
    toAddress: '<to_wallet_address>'
};

transaction.init(txData).then(() => {
    transaction.initTransaction(fromWallet, true).then(() => {
        console.info('Transaction completed!');
    }).catch(err => {
        console.error('Error signing transaction', err);
    });
}).catch(err => {
    console.error('Error initializing transaction', err);
});
```

### 1.3.8 Generate pkpass of new wallet

**From Node.js:**

```js
const Tokium = require('@tokium/tokium-sdk');

const wallet = new Tokium.Wallet();

wallet.create('your-asset-name', '').then(() => {
    wallet.getPassbook(path).then(() => {
        // Passbook saved
    })
}).catch(err => {
    console.error(err);
});
```

**Direct download:**

- GET: https://api.tokium.one/test/wallet/passbook/[your-asset-name]/[wallet-address]
- Header: authtoken [firebase-auth-token]

# 2 Advanced documentation

## ``Profile``

```js
const Tokium = require('@tokium/tokium-sdk');
const profile = new Tokium.Profile();
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

### Methods

#### Login

```js
profile.login('email@email.com', 'password').then(() => {
    console.info(profile);
}).catch(err => {
    console.error(err);
});
```

#### Logout

```js
profile.logout().then(() => {
    console.info(profile);
}).catch(err => {
    console.error(err);
});
```

#### Is logged in

```js
let isLoggedIn = profile.isLoggedIn(); // True or false
```

#### Get Wallets

```js
profile.getWallets().then(() => {
    console.info(profile.wallets);
}).catch(err => {
    console.error(err);
});
```

#### Get Transactions

```js
profile.getTransactions(type, limit).then(transactions => { // type = 'from' or 'to'
    console.info(transactions); // [ Transaction(), Transaction(), ... ]
}).catch(err => {
    console.error(err);
});
```

### Events

#### wallets-changed

```js
const Tokium = require('@tokium/tokium-sdk');
Tokium.on('wallets-changed', profile => {
    console.info(profile); // Profile()
});
```

#### waiting-transactions-changed

```js
const Tokium = require('@tokium/tokium-sdk');
Tokium.on('waiting-transactions-changed', transactions => {
    console.info(transactions); // [ Transaction(), Transaction(), ... ]
})
```

#### profile-changed

```js
const Tokium = require('@tokium/tokium-sdk');
Tokium.on('profile-changed', profile => {
    console.info(profile); // Profile()
})
```

## ``Asset``

```js
const Tokium = require('@tokium/tokium-sdk');
const asset = new Tokium.Asset();
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

### Methods

#### init()

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

#### create()

```js
asset.amount = Int();   // Required
asset.image = 'http://...';   // Required

asset.create().then(() => {
    console.info(asset);
}).catch(err => {
    console.error(err);
});
```

## ``Transaction``

```js
import Tokium from 'sdk-node';
const transaction = new Tokium.Transaction();
```

**Transaction Data Model**

```js
Transaction {
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

### Methods

#### init()

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

#### requestTransaction()

```js
transaction.requestTransaction().then(() => {
    console.info(transaction);
}).catch(err => {
    console.error(err);
});
```

Register the transaction on database but it isn't sended to blockchain. Very usefull to request transactions to other users.

#### initTransaction()

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

## ``Wallet``

```js
const Tokium = require('@tokium/tokium-sdk');
const wallet = new Tokium.Wallet();
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

### Methods

#### init()

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

#### create()

```js
wallet.create(assetName, walletPin).then(() => {
    console.info(wallet);
}).catch(err => {
    console.error(err);
});
```

#### update()

```js
wallet.update().then(() => {
    console.info(wallet);
}).catch(err => {
    console.error(err);
});
```
