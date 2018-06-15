const fs = require('fs');
const config = require('../config');
const log4js = require('log4js');
const logger = log4js.getLogger('dao/copyrightContract');
const Web3 = require('web3');
const solc = require('solc');

let web3;
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider(config.contract.url));
}

const BookCopyrightCreate_SOURCE = config.server.bookCopyrightCreate_source;
const basePath = config.server.contract_path;
const chainbookAddress = config.server.address;
const chainbookGas = config.server.gas;

const CopyrightContractDao = class dao {
  constructor(){
    this._compile();
    this._deployContract();
  }
  
  //编译合约
  _compile(){
    let output;
    try{
      let bookCopyrightCreate = fs.readFileSync(BookCopyrightCreate_SOURCE,'utf-8');
    
      var input = {
        'BookCopyrightCreate.sol': bookCopyrightCreate
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
        if(contractName.includes("BookCopyrightCreate.sol")){
          dao.bookCopyrightCreateCompiled = output.contracts[contractName];
          dao.bookCopyrightCreateContactWeb3 = web3.eth.contract(JSON.parse(dao.bookCopyrightCreateCompiled.interface));
        }
      }
    }catch (e) {
      logger.error("compile contract fail",e);
      //如果捕捉到异常就直接抛出去，就可以启动时就知道合约编译异常
      throw e;
    }
  
    //如果编译后依然为空的话，说明合约有问题，直接启动报错
    if(dao.bookCopyrightCreateCompiled == undefined || dao.bookCopyrightCreateContactWeb3 == undefined){
      logger.error("compile BookCopyrightCreate.sol contract fail",output);
      throw new Error("compile BookCopyrightCreate.sol error");
    }
  }
  
  /**
   * TODO 私有的方法
   * 部署合约，这个合约由平台部署，所属地址是平台的
   * @param _deployContract
   * @returns {Promise<any>}
   */
  _deployContract() {
    return new Promise((resolve, reject) => {
      //获取合约的代码，部署时传递的就是合约编译后的二进制码,
      let deployCode = dao.bookCopyrightCreateCompiled.bytecode;
      //获取部署该合约预估的费用
      let gasEstimate = web3.eth.estimateGas({data:deployCode});
      dao.bookCopyrightCreateContactWeb3.new({
        data: deployCode,
        from: chainbookAddress,
        gas:gasEstimate
      }, function(err, contract) {
        if (!err) {
          // 注意：这个回调会触发两次,一次是合约的交易哈希属性完成,另一次是在某个地址上完成部署
          // 通过判断是否有地址，来确认是第一次调用，还是第二次调用。
          if (!contract.address) {
            logger.info("contract deploy transaction hash: " + contract.transactionHash) //部署合约的交易哈希值
          } else {
            // 合约发布成功后，才能调用后续的方法
            dao.bookCopyrightAddress = contract.address;//合约的部署后的地址
            dao.contractInstance = dao.bookCopyrightCreateContactWeb3.at(dao.bookCopyrightAddress);
            logger.info("contract deploy address: " + contract.address) // 合约的部署地址
            resolve(contract)
          }
        }else {
          reject(err);
        }
      });
    });
  }
  
  registerCopyright(userObj,copyrightObj) {
    return new Promise((resolve, reject) => {
      //获取一个已有地址的合约实例
      try{
        //调用这个合约的
        let transactionId = dao.contractInstance.registerCopyright(
          copyrightObj.workName,
          copyrightObj.authors[0].authorName,
          copyrightObj.account,
          copyrightObj.resourceHash,{
            from: chainbookAddress,
            gas:chainbookGas  //由平台提供gas
          });
        logger.info("registerCopyright transactionId:",transactionId);
  
        //设置注册成功的监听事件
        let registerCopyrightEvent = dao.contractInstance._RegisterCopyright();
        // 监听事件，监听到事件后会执行回调函数
        registerCopyrightEvent.watch(function(err, result) {
          if (err) {
            reject(e);
          }else{
            if(transactionId === result.transactionHash){
              logger.info("_RegisterCopyright event",{
                result:result,
                _newBookCopyrightId:result.args._newBookCopyrightId.toString()
              });
              registerCopyrightEvent.stopWatching();
              resolve(result.args._newBookCopyrightId.toString());
            }
          }
        });
      }catch (e) {
        reject(e);
      }
    });
  }
  
  getCopyRightsByCopyrightAddress(copyrightAddress) {
    return new Promise((resolve, reject) => {
      try{
        resolve(dao.contractInstance.getCopyright.call(copyrightAddress));
      }catch (e) {
        reject(e);
      }
    });
  }
  
  //返回版权合约得地址
  getCopyrightContractAddress(){
    return dao.bookCopyrightAddress;
  }
}

module.exports = new CopyrightContractDao();
