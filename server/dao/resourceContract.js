const fs = require('fs');
const config = require('../config');
const log4js = require('log4js');
const logger = log4js.getLogger('dao/resourceContract');
const copyrightDao = require('./copyrightContract');
const Web3 = require('web3');
const solc = require('solc');

let web3;
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider(config.contract.url));
}

const BookOwnerShip_SOURCE = config.server.bookOwnerShip_source;
const basePath = config.server.contract_path;
const chainbookAddress = config.server.address;
const chainbookGas = config.server.gas;
const limit = config.server.bookOwnership_limit;

const ResourceContractDao = class dao {
  constructor(){
    this._compile();
  }
  
  //编译合约
  _compile(){
    let output;
    try{
      let bookOwnerShip= fs.readFileSync(BookOwnerShip_SOURCE,'utf-8');
      
      var input = {
        'BookOwnerShip.sol': bookOwnerShip
      }
      
      function findImports (path) {
        let dependentContract = fs.readFileSync(basePath+path,'utf-8');
        if (dependentContract !== undefined && dependentContract !== null)
          return { contents: dependentContract }
        else
          return { error: 'File not found' }
      }
      
      output = solc.compile({ sources: input },1,findImports)
      for (var contractName in output.contracts){
        logger.info(contractName + ': ' + output.contracts[contractName]);
        if(contractName.includes("BookOwnerShip.sol")){
          dao.bookOwnerShipCompiled = output.contracts[contractName];
          dao.bookOwnerShipContactWeb3 = web3.eth.contract(JSON.parse(dao.bookOwnerShipCompiled.interface));
        }
      }
    }catch (e) {
      logger.error("compile contract fail",e);
      //如果捕捉到异常就直接抛出去，就可以启动时就知道合约编译异常
      throw e;
    }
    
    //如果编译后依然为空的话，说明合约有问题，直接启动报错
    if(dao.bookOwnerShipCompiled == undefined || dao.bookOwnerShipContactWeb3 == undefined){
      logger.error("compile BookOwnerShip.sol contract fail",output);
      throw new Error("compile BookOwnerShip.sol error");
    }
  }
  
  /**
   * TODO 私有的方法
   * 部署合约，这个合约由平台部署，所属地址是平台的
   * @param _deployContract
   * @returns {Promise<any>}
   */
  _deployContract(userObj,resourceObj) {
    //TODO 判空
    return new Promise((resolve, reject) => {
      //获取合约的代码，部署时传递的就是合约编译后的二进制码,
      let deployCode = dao.bookOwnerShipCompiled.bytecode;
      //获取部署该合约预估的费用
      let gasEstimate = dao.bookOwnerShipContactWeb3.estimateGas({data:deployCode});
      dao.bookOwnerShipContactWeb3.new(copyrightDao.getCopyrightContractAddress(),parseInt(resourceObj.copyrightAddress),parseInt(resourceObj.price),resourceObj.total,limit,{
        data: deployCode,
        from: userObj.account,
        gas:6000000
      }, function(err, contract) {
        if (!err) {
          // 注意：这个回调会触发两次,一次是合约的交易哈希属性完成,另一次是在某个地址上完成部署
          // 通过判断是否有地址，来确认是第一次调用，还是第二次调用。
          if (!contract.address) {
            logger.info("contract deploy transaction hash: " + contract.transactionHash) //部署合约的交易哈希值
          } else {
            // 合约发布成功后，才能调用后续的方法
            logger.info("contract deploy address: " + contract.address) // 合约的部署地址
            resolve(contract);
          }
        }else {
          reject(err);
        }
      });
    });
  }
  
  async publishResource(userObj,resourceInfoObj){
    //使用transaction方式调用，写入到区块链上,sendTransaction 方式调用
    logger.info("enter resources contract",{
      userObj:userObj,
      resourceInfoObj:resourceInfoObj
    });
    
    let contract = await this._deployContract(userObj,resourceInfoObj);
    //返回一个资源合约地址
    return contract.address;
   
  }
  
  buyFromAuthor(resourceAddress,userObj,price){
    return new Promise((resolve, reject) => {
      if(resourceAddress == undefined){
        reject(new Error("resourceAddress not null"));
      }
      //已有bookOwnership地址先获取实例
      let contractInstance = dao.bookOwnerShipContactWeb3.at(resourceAddress);
      var sendTransactionId = contractInstance.buyFromAuthor.sendTransaction({from:userObj.account, value:price,gas:chainbookGas});
  
      //设置注册成功的监听事件
      let buyFromAuthorEvent = contractInstance.CreatBook();
      // 监听事件，监听到事件后会执行回调函数
      buyFromAuthorEvent.watch(function(err, result) {
        if (err) {
          reject(e);
        }else{
          if(sendTransactionId === result.transactionHash){
            logger.info("_BuyFromAuthor event",{
              result:result,
              _tokenId:result.args._tokenId.toString()
            });
            buyFromAuthorEvent.stopWatching();
            resolve(result.args._tokenId.toString());
          }
        }
      });
    });
  }
  
  // 允许第三方平台交易图书
  approve(resourceAddress,sender, _to, _tokenId) {
    let contractInstance = dao.bookOwnerShipContactWeb3.at(resourceAddress);
    contractInstance.approve.sendTransaction(_to, _tokenId, {from:sender});
  }
  
}

module.exports = new ResourceContractDao();
