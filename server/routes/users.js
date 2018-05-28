var express = require('express');
var router = express.Router();
var fs = require('fs');

var Web3 = require('web3');

var provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545");
var contract = require("truffle-contract");

/* GET users listing. */
router.get('/', function(req, res, next) {
  fs.readFile('./smartcontracts/build/contracts/helloWorld.json',function(err,data){
    if(err)
      throw err;
    var helloWorldAbi = JSON.parse(data);
    var helloWorldContract = contract({
      abi:helloWorldAbi,
      address:'0x192Aa6873a4B8DAf59Fd0aDe090878d250d1dAeD'
    });

    helloWorldContract.setProvider(provider);
    if (typeof helloWorldContract.currentProvider.sendAsync !== "function") {
      helloWorldContract.currentProvider.sendAsync = function() {
        return helloWorldContract.currentProvider.send.apply(
          helloWorldContract.currentProvider, arguments
        );
      };
    }

    console.log(helloWorldContract.currentProvider);

    helloWorldContract.deployed().then(function(hi){
      res.send(hi.sayHello.call())
    }).catch(console.error);

  });


});

module.exports = router;
