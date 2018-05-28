var express = require('express');
var router = express.Router();
var fs = require('fs');

var Web3 = require('web3');

var provider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
var contract = require("truffle-contract");

/* GET users listing. */
router.get('/', function(req, res, next) {
  fs.readFile('./smartcontracts/build/contracts/helloWorld.json',function(err,data){
    if(err)
      throw err;
    var helloWorldAbi = JSON.parse(data);
    var helloWorldContract = contract({
      abi:helloWorldAbi.abi,
      address:'0xc132c1e1a347883c5170a332eb2e61a024f354a8'
    });
    console.log(helloWorldAbi);

    helloWorldContract.setProvider(provider);
    if (typeof helloWorldContract.currentProvider.sendAsync !== "function") {
      helloWorldContract.currentProvider.sendAsync = function() {
        return helloWorldContract.currentProvider.send.apply(
          helloWorldContract.currentProvider, arguments
        );
      };
    }
    console.log(helloWorldContract);
    helloWorldContract.setNetwork("*");

    console.log(helloWorldContract.networks);


    helloWorldContract.deployed().then(function(i){
      var hi = i.sayhello;
      res.send("hi,2018"+hi);
    }).catch(console.error);

  });


});

module.exports = router;
