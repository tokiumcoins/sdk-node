'use strict';

require('./utils/fix.js');

var _services = require('./utils/services.js');

var _tools = require('./libs/tools.js');

var Tools = _interopRequireWildcard(_tools);

var _wallet = require('./libs/wallet.js');

var _wallet2 = _interopRequireDefault(_wallet);

var _transaction = require('./libs/transaction.js');

var _transaction2 = _interopRequireDefault(_transaction);

var _asset = require('./libs/asset.js');

var _asset2 = _interopRequireDefault(_asset);

var _profile = require('./libs/profile.js');

var _profile2 = _interopRequireDefault(_profile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var on = function on() {
    _services.eventsEmitter.on.apply(_services.eventsEmitter, arguments);
}; // Fix for react-native


module.exports = {
    Asset: _asset2.default,
    Profile: _profile2.default,
    Transaction: _transaction2.default,
    Wallet: _wallet2.default,
    Tools: Tools,
    currentUser: new _profile2.default(),
    on: on
};