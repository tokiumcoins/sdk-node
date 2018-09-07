'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Expo = null;

try {
    Expo = require('expo');
} catch (e) {}

var AsyncStorage = global.AsyncStorage || null;
var localStorage = global.localStorage || null;

module.exports = function () {
    return function () {
        function Storage() {
            _classCallCheck(this, Storage);

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

        _createClass(Storage, [{
            key: 'set',
            value: function set(key, data, options) {
                return this.controller.setItem(key, data, options);
            }
        }, {
            key: 'get',
            value: function get(key, options) {
                return this.controller.getItem(key, options);
            }
        }, {
            key: 'remove',
            value: function remove(key, options) {
                return this.controller.removeItem(key, options);
            }
        }]);

        return Storage;
    }();
}();

var StorageMock = function () {
    function StorageMock() {
        _classCallCheck(this, StorageMock);
    }

    _createClass(StorageMock, [{
        key: 'setItem',
        value: function setItem(key, data) {
            return new Promise(function (resolve) {
                resolve();
            });
        }
    }, {
        key: 'getItem',
        value: function getItem(key) {
            return new Promise(function (resolve) {
                var examplePrivKey = 'fake_priv_key';
                resolve(examplePrivKey);
            });
        }
    }, {
        key: 'removeItem',
        value: function removeItem(key) {
            return new Promise(function (resolve) {
                resolve();
            });
        }
    }]);

    return StorageMock;
}();

var LocalStorage = function () {
    function LocalStorage() {
        _classCallCheck(this, LocalStorage);
    }

    _createClass(LocalStorage, [{
        key: 'setItem',
        value: function setItem(key, data) {
            return new Promise(function (resolve) {
                localStorage.setItem(key, data);
                resolve();
            });
        }
    }, {
        key: 'getItem',
        value: function getItem(key) {
            return new Promise(function (resolve) {
                var data = localStorage.getItem(key);
                resolve(data);
            });
        }
    }, {
        key: 'removeItem',
        value: function removeItem(key) {
            return new Promise(function (resolve) {
                localStorage.removeItem(key);
                resolve();
            });
        }
    }]);

    return LocalStorage;
}();

var ExpoSecureStorage = function () {
    function ExpoSecureStorage() {
        _classCallCheck(this, ExpoSecureStorage);
    }

    _createClass(ExpoSecureStorage, [{
        key: 'setItem',
        value: function setItem(key, data) {
            return Expo.SecureStore.setItemAsync(key, data, {
                keychainService: 'tokiumSecureStorage'
            });
        }
    }, {
        key: 'getItem',
        value: function getItem(key) {
            return Expo.SecureStore.getItemAsync(key, {
                keychainService: 'tokiumSecureStorage'
            });
        }
    }, {
        key: 'removeItem',
        value: function removeItem(key) {
            return Expo.SecureStore.deleteItemAsync(key, {
                keychainService: 'tokiumSecureStorage'
            });
        }
    }]);

    return ExpoSecureStorage;
}();