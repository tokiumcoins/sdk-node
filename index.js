var firebase = null;
var user = {
    firebaseInfo:   null,   // Firebase user object
    profile:        null,   // User profile info
    assetAccounts:  null    // User asset accounts
};

module.exports = function(_firebase) {
    if (!_firebase) {
        console.error('Tokium SDK can\'t be used without a valid firebase instance.');
        return;
    }

    firebase = _firebase;

    return {
        login: login,
        register: register,
        newAssetAccount: newAssetAccount
    }
}

function login(email, password) {
    return new Promise(function(resolve, reject) {
        firebase.auth().signInWithEmailAndPassword(email, password).then(function(firebaseUserInfo) {
            user.firebaseInfo = firebaseUserInfo;

            completeUser().then(function() {
                resolve(user);
            });
        }).catch(function(err) {
            reject(err.message);
        });
    });
}

/**
  Get authenticated user's profile and assetAccounts
**/
function completeUser() {
  return new Promise(function(resolve, reject) {
    var getUserProfilePromise = getUserProfile();
    var getUserAssetAccountsPromise = getUserAssetAccounts();

    Promise.all([getUserProfilePromise, getUserAssetAccountsPromise]).then(function(results) {
      user.profile = results[0];
      user.assetAccounts = results[1];

      // Get assets server
      var promises = [];

      user.assetAccounts.forEach(function(assetAccount, index) {
        promises.push(getAssetInfo(assetAccount.asset_name).then(function (assetInfo) {
          user.assetAccounts[index].server = assetInfo.server;
          user.assetAccounts[index].balance = '...';
        }));
      });

      Promise.all(promises).then(function() {
        resolve();
      });
    });
  });
}

/**
  Get user data from 'users' firebase collection
**/
function getUserProfile() {
    return new Promise(function(resolve, reject) {
        var docRef = db.collection('users').doc(user.firebaseInfo.uid);

        docRef.get().then(function(doc) {
            if (doc.exists) {
                resolve(doc.data());
            } else {
                reject();
            }
        }).catch(function(error) {
            console.log('Error getting document:', error);
        });
    });
}

/**
  Get user asset accounts from 'asset_accounts' firebase collection
**/
function getUserAssetAccounts() {
    return new Promise(function(resolve, reject) {
        var queryRef = db.collection('asset_accounts').where('owner', '==', user.firebaseInfo.uid);

        queryRef.get().then(function(querySnapshot) {
            var results = querySnapshot.docs.map(function(doc) {
              return doc.data();
            });

            resolve(results);
        }).catch(function(error) {
            console.log('Error getting document:', error);
        });
    });
}

function register(email, password) {
    return new Promise(function(resolve, reject) {
        firebase.auth().createUserWithEmailAndPassword(email, password).then(function(firebaseUserInfo) {
            user.firebaseInfo = firebaseUserInfo;

            completeUser().then(function() {
                resolve(user);
            });
        }).catch(function(err) {
            reject(err.message);
        });
    });
}