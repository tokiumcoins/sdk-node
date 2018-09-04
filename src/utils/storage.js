const Expo = Expo || null;
const AsyncStorage = AsyncStorage || null;
const localStorage = localStorage || null;

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

                this.controller = new LocalStorage();
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

class LocalStorage {
    constructor() {
        this.localStorage = localStorage;

        if (typeof this.localStorage === 'undefined' || this.localStorage === null) {
            var LocalStorage = require('node-localstorage').LocalStorage;
            this.localStorage = new LocalStorage('./tokiumLocalStorage');
        }
    };

    setItem(key, data) {
        return new Promise((resolve) => {
            this.localStorage.setItem(key, data);
            resolve();
        });
    };

    getItem(key) {
        return new Promise((resolve) => {
            let value = this.localStorage.getItem(key);
            resolve(value);
        });
    };

    removeItem(key) {
        return new Promise((resolve) => {
            this.localStorage.removeItem(key);
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