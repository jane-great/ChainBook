var PublishBook = artifacts.require("./PublishBook.sol");

module.exports = function(deployer) {
  deployer.deploy(PublishBook);
};
