var BookOwnerShip = artifacts.require("./BookOwnerShip.sol");
var BookCopyrightCreate = artifacts.require("./BookCopyrightCreate.sol");

module.exports = function(deployer) {
  var copyrightAddress = BookCopyrightCreate.address;
  deployer.deploy(BookOwnerShip,copyrightAddress, 0, 0, 3, 1);
};
