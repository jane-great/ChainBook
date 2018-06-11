var BookCopyrightCreate = artifacts.require("./BookCopyrightCreate.sol");

module.exports = function(deployer) {
  var account = web3.eth.accounts[0];
  deployer.deploy(BookCopyrightCreate).then(function(instance) {
    instance.registerCopyright("chainbook","chainbook",account,"chainbook");
  })
};
