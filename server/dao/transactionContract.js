const fs = require('fs');
const config = require('../config');
const log4js = require('log4js');
const logger = log4js.getLogger('dao/transactionContract');
const Web3 = require('web3');
const solc = require('solc');

let web3;
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider(config.contract.url));
}

const chainbookAddress = config.server.address;
const chainbookGas = config.server.gas;

const TransactionContractDao = class dao {
  constructor() {
    this._init();
  }
  
  async _init(){
    logger.info("hiiiiii");
    //编译buyAndSell
    let buyAndSell = fs.readFileSync(config.server.buyAndSell_source,'utf-8');
    dao.buyAndSellContract = this._compile({ 'BuyAndSell.sol': buyAndSell});
  
    //编译rentAndLease
    let rentAndLease = fs.readFileSync(config.server.rentAndLease_source,'utf-8');
    dao.rentAndLeaseContract = this._compile({ 'RentAndLease.sol': rentAndLease});
    //编译transaction
    let transaction = fs.readFileSync(config.server.transaction_source,'utf-8');
    dao.transactionContract = this._compile({ 'Transtaction.sol': transaction});
    //部署buyAndSell
    let buyContract = await this._deployContract(dao.buyAndSellContract);
    dao.buyAndSellContract.address = buyContract.address;
    dao.buyAndSellContract.contractInstance = dao.buyAndSellContract.contractWeb3.at(buyContract.address);
    //部署rentAndLease
    let rentContract = await this._deployContract(dao.rentAndLeaseContract);
    dao.rentAndLeaseContract.address = rentContract.address;
    dao.rentAndLeaseContract.contractInstance = dao.rentAndLeaseContract.contractWeb3.at(rentContract.address);
  
    //部署transaction
    let transtractContract = await this._deployContract(dao.transactionContract);
    dao.transactionContract.address = transtractContract.address;
    dao.transactionContract.contractInstance = dao.transactionContract.contractWeb3.at(transtractContract.address);
  
    //初始化合约的之间的关系
    dao.transactionContract.contractInstance.setBuyAndSell(dao.buyAndSellContract.address,{from:chainbookAddress});
    dao.transactionContract.contractInstance.setRentAndLease(dao.rentAndLeaseContract.address,{from:chainbookAddress});
    dao.buyAndSellContract.contractInstance.addAddressToWhitelist(dao.transactionContract.address,{from:chainbookAddress})
    dao.rentAndLeaseContract.contractInstance.addAddressToWhitelist(dao.transactionContract.address,{from:chainbookAddress});
  }
  
  //编译合约
  _compile(input){
    let output;
    let compileInfo;
    try{
      function findImports (path) {
        let dependentContract = fs.readFileSync(config.server.contract_path+path,'utf-8');
        if (dependentContract !== undefined && dependentContract !== null)
          return { contents: dependentContract }
        else
          return { error: 'File not found' }
      }
      
      output = solc.compile({ sources: input },1,findImports);
      for (var contractName in output.contracts){
        logger.info(contractName + ': ' + output.contracts[contractName]);
        for(let key in input){
          if(contractName.includes(key)){
            compileInfo = {
              compiled:output.contracts[contractName],
              contractWeb3:web3.eth.contract(JSON.parse(output.contracts[contractName].interface))
            };
          }
        }
        
      }
    }catch (e) {
      logger.error("compile contract fail",e);
      //如果捕捉到异常就直接抛出去，就可以启动时就知道合约编译异常
      throw e;
    }
    
    //如果编译后依然为空的话，说明合约有问题，直接启动报错
    if(compileInfo == undefined ||compileInfo.compiled ==  undefined || compileInfo.contractWeb3 == undefined ){
      logger.error("compile contract fail",{
        input:input,
        output:output
      });
      throw new Error("compile error,"+input);
    }else{
      return compileInfo;
    }
  }
  
  /**
   * TODO 私有的方法
   * 部署合约，这个合约由平台部署，所属地址是平台的
   * @param _deployContract
   * @returns {Promise<any>}
   */
  _deployContract(contractInfo) {
    return new Promise((resolve, reject) => {
      //获取合约的代码，部署时传递的就是合约编译后的二进制码,
      let deployCode = contractInfo.compiled.bytecode;
      //获取部署该合约预估的费用
      let gasEstimate = web3.eth.estimateGas({data:deployCode});
      contractInfo.contractWeb3.new({
        data: deployCode,
        from: chainbookAddress,
        gas:gasEstimate
      }, function(err, contract) {
        if (!err) {
          // 注意：这个回调会触发两次,一次是合约的交易哈希属性完成,另一次是在某个地址上完成部署
          // 通过判断是否有地址，来确认是第一次调用，还是第二次调用。
          if (!contract.address) {
            logger.info("contract deploy transaction hash: ",{
              transactionHash:contract.transactionHash,
              contractInfo:contractInfo
            }); //部署合约的交易哈希值
          } else {
            // 合约发布成功后，才能调用后续的方法
            logger.info("contract deploy address: ",{
              transactionHash:contract.transactionHash,
              address:contract.address,
              contractInfo:contractInfo
            });
            contractInfo.address = contract.address;
            contractInfo.contractInstance = contractInfo.contractWeb3.at(contract.address);
            resolve(contract);
          }
        }else {
          reject(err);
        }
      });
    });
  }
  
  address() {
    return dao.transactionContract.address;
  }
  
  setBuyAndSell(sender, _addr){
    dao.transactionContract.contractInstance.setBuyAndSell.sendTransaction(_addr, {from:sender,gas:6000000});
  }
  
  setRentAndLease(sender, _addr){
    dao.transactionContract.contractInstance.setRentAndLease.sendTransaction(_addr,{from:sender,gas:6000000});
  }
  
  setNewAddress(sender, _addr) {
    dao.transactionContract.contractInstance.setNewAddress.sendTransaction(_addr, {from:sender,gas:6000000});
  }
  
  setBuyFees(sender, _price){
    dao.transactionContract.contractInstance.setBuyFees.sendTransaction(_price, {from:sender,gas:6000000});
  }
  
  setLeaseFess(sender, _price) {
    dao.transactionContract.contractInstance.setLeaseFess.sendTransaction(_price, {from:sender,gas:6000000});
  }
  
  sell(sender, _contract, _tokenId, _price) {
    return dao.transactionContract.contractInstance.sell.sendTransaction(_contract, _tokenId, _price, {from:sender,gas:6000000});
  }
  
  rent(sender, _contract, _tokenId, _price, _rentTime) {
    return dao.transactionContract.contractInstance.rent.sendTransaction(_contract, _tokenId, _price, _rentTime, {from:sender,gas:6000000});
  }
  
  buy(sender, val, _contract, _tokenId) {
    return dao.transactionContract.contractInstance.buy.sendTransaction(_contract, _tokenId, {from:sender, value:val,gas:6000000});
  }
  
  lease(sender, val, _contract, _tokenId) {
    return dao.transactionContract.contractInstance.lease.sendTransaction(_contract, _tokenId, {from:sender, value:val,gas:6000000});
  }
  
  cancelSell(sender, _contract, _tokenId) {
    dao.transactionContract.contractInstance.cancelSell.sendTransaction(_contract, _tokenId, {from:sender,gas:6000000});
  }
  
  cancelRent(sender, _contract, _tokenId) {
    dao.transactionContract.contractInstance.cancelRent.sendTransaction(_contract, _tokenId, {from:sender,gas:6000000});
  }
  
  setSellPrice(sender, _contract, _tokenId, _price) {
    dao.transactionContract.contractInstance.setSellPrice.sendTransaction(_contract, _tokenId, _price, {from:sender,gas:6000000});
  }
  
  setRentInfo(sender, _contract, _tokenId, _price, _rentTime) {
    dao.transactionContract.contractInstance.setRentInfo.sendTransaction(_contract, _tokenId, _price, _rentTime, {from:sender,gas:6000000});
  }
  
  getSellInfo( _contract, _tokenId) {
    return dao.transactionContract.contractInstance.getSellInfo.call(_contract, _tokenId);
  }
  
  getRentInfo( _contract, _tokenId) {
    return dao.transactionContract.contractInstance.getRentInfo.call(_contract, _tokenId);
  }
  
  pauseContract(sender) {
    dao.transactionContract.contractInstance.pauseContract.sendTransaction({from:sender,gas:6000000});
  }
  
  unpauseContract(sender) {
    dao.transactionContract.contractInstance.pauseContract.sendTransaction({from:sender,gas:6000000});
  }
  
}

module.exports = new TransactionContractDao();
