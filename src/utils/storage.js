let Expo = null;

// try {
//     Expo = require('expo');
// } catch(e) {}

const AsyncStorage = global.AsyncStorage || null;
const localStorage = global.localStorage || null;

module.exports = (() => {
    return class Storage {
        constructor() {
            this.controller = global.storageController;

            if (!this.controller) {
                if (!!Expo && !!Expo.SecureStore) {
                    this.controller = new ExpoSecureStorage();
                    return;
                }

                if (!!AsyncStorage) {
                    this.controller = AsyncStorage;
                    return;
                }

                if (!!localStorage) {
                    this.controller = new LocalStorage();
                    return;
                }

                this.controller = new StorageMock();
            }
        }

        set(key, data, options) {
            return this.controller.setItem(key, data, options);
        }

        get(key, options) {
            return this.controller.getItem(key, options);
        }

        remove(key, options) {
            return this.controller.removeItem(key, options);
        }
    };
})();

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

class LocalStorage {
    constructor() {};

    setItem(key, data) {
        return new Promise((resolve) => {
            localStorage.setItem(key, data);
            resolve();
        });
    };

    getItem(key) {
        return new Promise((resolve) => {
            const data = localStorage.getItem(key);
            resolve(data);
        });
    };

    removeItem(key) {
        return new Promise((resolve) => {
            localStorage.removeItem(key);
            resolve();
        });
    };
}

class ExpoSecureStorage {
    constructor() {};

    setItem(key, data) {
        return Expo.SecureStore.setItemAsync(key, data, {
            keychainService: 'tokiumSecureStorage'
        });
    };

    getItem(key) {
        return Expo.SecureStore.getItemAsync(key, {
            keychainService: 'tokiumSecureStorage'
        });
    };

    removeItem(key) {
        return Expo.SecureStore.deleteItemAsync(key, {
            keychainService: 'tokiumSecureStorage'
        });
    };
}