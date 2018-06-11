var BuyAndSell = artifacts.require("./BuyAndSell.sol");

module.exports = function(deployer) {
  deployer.deploy(BuyAndSell);
};
