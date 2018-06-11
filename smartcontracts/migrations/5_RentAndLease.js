var RentAndLease = artifacts.require("./RentAndLease.sol");

module.exports = function(deployer) {
  deployer.deploy(RentAndLease);
};
