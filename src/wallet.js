var TokiumAPI = require('../utils/tokium.api.js');

module.exports = class Wallet {
    constructor() {
        this.accountPin      = null;
        this.privateKey      = null;
        this.address         = null;
    }
};