const Expo = Expo || null;
const AsyncStorage = AsyncStorage || null;

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

class ExpoSecureStorage {
    constructor() {};

    setItem(key, data) {
        return Expo.SecureStore.setItemAsync(key, data, {
            keychainService: 'tokiumSecureStorage'
        });
    };

    getItem(key) {
        return new Promise((resolve) => {
            localStorage.getItemAsync(key, {
                keychainService: 'tokiumSecureStorage'
            });
        });
    };

    removeItem(key) {
        return new Promise((resolve) => {
            localStorage.deleteItemAsync(key, {
                keychainService: 'tokiumSecureStorage'
            });
        });
    };
}