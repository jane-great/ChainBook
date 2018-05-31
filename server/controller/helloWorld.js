var express = require('express');
var fs = require('fs');

var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

exports.sayHello = function(req, res, next) {
  fs.readFile('./smartcontracts/build/contracts/helloWorld.json',function(err,data){
    var helloWorldContract = new web3.eth.Contract(JSON.parse(data).abi,'0xc132c1e1a347883c5170a332eb2e61a024f354a8', {
      from: '0x1234567890123456789012345678901234567891',
      gasPrice: '20000000000'
    });

    console.log(helloWorldContract);
    helloWorldContract.methods.sayHello().call().then(function(str) {
      res.send(str+"2018");
    });
  });
};
