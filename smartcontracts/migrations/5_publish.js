var BookOwnerShip = artifacts.require("./BookOwnerShip.sol");

module.exports = function(deployer) {
  deployer.deploy(BookOwnerShip,0,1000,3);
};
