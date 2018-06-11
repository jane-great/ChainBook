const fs = require('fs');
const config = require('../config');
const log4js = require('log4js');
const logger = log4js.getLogger('dao/resourceContract');
const Web3 = require('web3');
let web3;
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider(config.contract.url));
}

//TODO: 参数化
const BookOwnerShip_SOURCE = './smartcontracts/contracts/BookOwnerShip.sol';
const limitNum = 100;

const ResourceContractDao = class dao {
  constructor(){
    fs.readFile(BookOwnerShip_SOURCE,function(err, source) {
      //编译合约
      //let complied = web3.eth.compile.solidity(source);
      //dao.complied = complied;
      //logger.info("bookCopyrightCreateComplied:",complied);
      //logger.info("ABI definition:",complied["info"]["abiDefinition"]);
      //let abiDefinition = complied["info"]["abiDefinition"];
      //dao.contact = web3.eth.contract(abiDefinition);
    });
  }
  
  /**
   * TODO 私有的方法
   * @param _deployContract
   * @returns {Promise<any>}
   */
  _deployContract(userObj,resourceInfoObj) {
    return new Promise((resolve, reject) => {
      //部署合约
      //1.1 获取合约的代码，部署时传递的就是合约编译后的二进制码
      let deployCode = dao.complied["code"];
      //1.2 部署者的地址，当前取默认账户的第一个地址。
      let deployeAddr = userObj.account;
      //2.3 异步方式，部署合约
      dao.contact.new(resourceInfoObj.copyrightAddress,resourceInfoObj.price,resourceInfoObj.limit,limitNum,{
        data: deployCode,
        from: deployeAddr
      }, function(err, contract) {
        if (!err) {
          // 注意：这个回调会触发两次,一次是合约的交易哈希属性完成,另一次是在某个地址上完成部署
          // 通过判断是否有地址，来确认是第一次调用，还是第二次调用。
          if (!contract.address) {
            logger.warn("contract deploy transaction hash: " + contract.transactionHash) //部署合约的交易哈希值
          } else {
            logger.info("contract deploy address: " + contract.address) // 合约的部署地址
            //将web3，和拿到的合约对象都传出
            resolve(contract)
          }
        }else{
          reject(err);
        }
      });
    });
  }
  
  publishResource(userObj,resourceInfoObj){
    //使用transaction方式调用，写入到区块链上,sendTransaction 方式调用
    logger.info("enter resources contract",{
      userObj:userObj,
      resourceInfoObj:resourceInfoObj
    });
    
    //返回一个资源合约地址
    return "resourceAddress_test";
    /*return dao._deployContract(userObj,resourceInfoObj).then(contract =>{
      //创建合约成功，监听事件，将对应的图书的批量的存入数据，
      //tokenId TODO 初始化创建合约的时候，初始化了一个资源tokenId返回
      let tokenId = "test_tokenId";
      return {resourceAddress:contract.address,tokenIds:[{tokenId}]};
    });*/
  }
  
  buyFromAuthor(resourceAddress,buyerAccount){
    return new Promise((resolve, reject) => {
      let tokenId = web3.eth.contract(abi).at(resourceAddress).buyFromAuthor(buyerAccount);
      //监听事件 todo
      resolve(tokenId);
    });
  }
}

module.exports = new ResourceContractDao();
