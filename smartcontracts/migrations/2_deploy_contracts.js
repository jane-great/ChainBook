var helloWorld = artifacts.require("./helloWorld.sol");

module.exports = function(deployer) {
  deployer.deploy(helloWorld);
};
