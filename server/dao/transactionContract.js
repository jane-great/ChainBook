const fs = require('fs');
const config = require('../config');
const log4js = require('log4js');
const logger = log4js.getLogger('dao/copyrightContract');
const Web3 = require('web3');
let web3;
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider(config.contract.url));
}

//TODO: 参数化
const BookCopyrightCreate_SOURCE = './smartcontracts/contracts/BookCopyrightCreate.sol';

const CopyrightContractDao = class dao {
  constructor(){
    fs.readFile(BookCopyrightCreate_SOURCE,function(err, source) {
      //编译合约
      let bookCopyrightCreateComplied = web3.eth.compile.solidity(source);
      dao.bookCopyrightCreateComplied = bookCopyrightCreateComplied;
      logger.info("bookCopyrightCreateComplied:",bookCopyrightCreateComplied);
      logger.info("ABI definition:",bookCopyrightCreateComplied["info"]["abiDefinition"]);
      let abiDefinition = bookCopyrightCreateComplied["info"]["abiDefinition"];
      dao.bookCopyrightCreateContact = web3.eth.contract(abiDefinition);
      
    });
  }
  
  /**
   * TODO 私有的方法
   * @param _deployContract
   * @returns {Promise<any>}
   */
  _deployContract(userObj) {
    return new Promise((resolve, reject) => {
      //部署合约
      //1.1 获取合约的代码，部署时传递的就是合约编译后的二进制码
      let deployCode = dao.bookCopyrightCreateComplied["code"];
      //1.2 部署者的地址，当前取默认账户的第一个地址。
      let deployeAddr = userObj.account;
      //2.3 异步方式，部署合约
      dao.bookCopyrightCreateContact.new({
        data: deployCode,
        from: deployeAddr
      }, function(err, contract) {
        if (!err) {
          // 注意：这个回调会触发两次,一次是合约的交易哈希属性完成,另一次是在某个地址上完成部署
          // 通过判断是否有地址，来确认是第一次调用，还是第二次调用。
          if (!contract.address) {
            logger.info("contract deploy transaction hash: " + contract.transactionHash) //部署合约的交易哈希值
            // 合约发布成功后，才能调用后续的方法
          } else {
            logger.info("contract deploy address: " + contract.address) // 合约的部署地址
            //将web3，和拿到的合约对象都传出
            resolve(contract)
          }
        }
      });
    });
  }
  registerCopyright(userObj,copyrightObj){
    //使用transaction方式调用，写入到区块链上,sendTransaction 方式调用
    return dao._deployContract(userObj).then(contract =>{
      //调用其注册版权的方法,todo支持多个
      //TODO 怎么唤起钱包？？？
      contract.registerCopyright.sendTransaction(
        copyrightObj.workName,
        copyrightObj.author[0].authorName,
        this.copyrightObj.account,
        copyrightObj.resourceHash,{
          from: userObj.account
        });
      logger.info("getCopyright 1",contract.getCopyright());
      //设置注册成功的监听事件
      return contract.address;
    });
  }
}

module.exports = new CopyrightContractDao();
