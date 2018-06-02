var fs = require('fs');
var config = require('../config');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider(config.contract.url));
