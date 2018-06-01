var BookCopyrightCreate = artifacts.require("./BookCopyrightCreate.sol");

module.exports = function(deployer) {
  deployer.deploy(BookCopyrightCreate);
};
