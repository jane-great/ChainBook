const log4js = require("log4js");
const logger = log4js.getLogger("controller/user");
const encrypt = require('../utils/encrypt');
const thunder = require("../utils/thunder");
const transactionContract = require("../dao/transactionContract");
const userDao = require("../dao/user");
const resourceInfoDao = require("../dao/resourceInfo");
const config = require("../config");

//预出售的状态
const preSellStatus = 1;
const preRentStatus = 1;

/**
 * 登录
 * @param req
 * @param res
 * @param next
 */
exports.login = function(req, res, next) {
  res.send({status:1,msg:"login success"});
}

/**
 * 登出操作
 * @param req
 * @param res
 * @param next
 */
exports.logout = async function(req, res, next) {
  let user = req.session.passport.user;
  if (user) {
    logger.info("enter local logout", { "user": user });
    try{
      await userDao.deleteSessionById(req.session.id);
      req.logout();
      logger.info("success to logout from local", { "username": user.userName });
      res.send({status:1,msg:"local logout success"});
    }catch (e) {
      logger.error("local logout fail",{ "username": user.userName },e);
      res.send({status:0,msg:"local logout failed"});
    }
    
  } else {
    logger.warn("local logout failed,no user in req.session.passport object ,maybe already expired.", {
      "session": req.session.id,
      "user": user
    });
    res.send({status:0,msg:"local logout failed"});
  }
 
};

/**
 * // 注册用户，且注册用户的链克口袋 post：方法，用户只需要输入用户名，手机号，邮箱
 * //密码在传输的时候使用MD5加密，在存入进数据库的时候再次经过随机数加MD5加密保存
 * @param req
 * @param res
 * @param next
 */
exports.register = async function(req, res, next) {
  logger.info("register user");
  let random = encrypt.getRandom();
  let user = {
    userName:req.body.userName,
    pwd:encrypt.getMD5(req.body.pwd,random),
    email:req.body.email,
    mobile:req.body.mobile,
    randomNum:random,
    account:config.server.userAccount
  }
  
  //TODO 校验注册的基本内容
  try{
    //1、先向迅雷注册账号 TODO 测试
    /*let registerData = await thunder.register(user.email);
    user.account = registerData.service_id;*/
    //2、保存账号信息至数据库
    await userDao.add(user);
    res.send({status:1,msg:"恭喜注册成功"});
  } catch (e) {
    logger.error("register user fail.",user);
    res.send({status:0,msg:"注册失败"});
  }
};

/**
 * 获取当前登录的用户信息
 * @param req
 * @param res
 * @param next
 */
exports.getCurrentUserInfo = function(req, res, next) {
  var user = req.session.passport.user;
  res.send({ "success": true, "data": user });
};

exports.getUserInfoByAccount = async function(req,res,next){
  let account = req.param("account");
  
  if(account == undefined || account == "" || account == null){
    res.send({status:0,msg:"account 必传"});
    return;
  }
  try{
    let userInfo = await userDao.findUserInfoByAccount(account);
    res.send({status:1,msg:"success",data:userInfo});
  }catch (e) {
    logger.error("getUserInfoByAccount fail",{account:account},e);
    res.send({status:0,msg:"getUserInfoByAccount fail"});
  }
  
}

/**
 * 获取当前用户已购买的资源列表
 * @param req
 * @param res
 * @param next
 */
exports.getPurchasedResourcesByUser = async function(req, res, next) {
  logger.info("get purchased file");
  //1、先拿到当前用户信息，判断用户是否是登录状态
  var user = req.session.passport.user;
  //2、从数据库中获取当前已购买的资源列表
  let list = await userDao.getPurchasedResourcesByUserId(user._id);
  res.send({status:1,msg:"success",data:list});
};

/**
 * 获取当前用户已租赁的资源列表
 * @param req
 * @param res
 * @param next
 */
exports.getRentResourcesByUser = async function(req, res, next) {
  logger.info("get rent file");
  //1、先拿到当前用户信息，判断用户是否是登录状态
  var user = req.session.passport.user;
  //2、从数据库中获取当前已购买的资源列表
  let list = await userDao.getRentResourcesByUserId(user._id);
  res.send({status:1,msg:"success",data:list});
};

/**
 * 获取当前用户提交的版权记录
 * @param req
 * @param res
 * @param next
 */
exports.getCopyRightsByUser = async function(req, res, next) {
  logger.info("get rent file");
  //1、先拿到当前用户信息，判断用户是否是登录状态
  var user = req.session.passport.user;
  //2、从数据库中获取当前版权的资源列表
  let list = await userDao.getCopyrightsByUserId(user._id);
  res.send({status:1,msg:"success",data:list});
};

/**
 * 出售一个资源
 * @param req
 * @param res
 * @param next
 */
exports.sell = async function(req, res, next) {
  let tokenId = req.body.tokenId;
  let resourceId = req.body.resourceId;
  let sellPrice = req.body.sellPrice;
  let user = req.session.passport.user;
  logger.info("selling file.", {
    tokenId: tokenId,
    resourceId:resourceId
  });
  
  try {
    //todo 校验
    //1、先查看这个资源个体的交易信息
    let purchasedResourceDoc = await userDao.findOneUserPurchasedResourceByResourceIdAndTokenId(user._id,resourceId,tokenId);
    let sellResource = purchasedResourceDoc.purchasedResources[0];
    //校验这个资源是否可以售卖
    if(sellResource.sellStatus>0){
      logger.warn("sell resource fail.",{
        user:user,
        sellResource:sellResource
      });
      res.send({ status: 0, msg: "资源出售失败，该资源可能已出售、或正在出售中" });
      return;
    }
    //如果这资源已出租也不能售卖
    if(sellResource.rentOutStatus>1){
      logger.warn("rent out resource fail.",{
        user:user,
        sellResource:sellResource
      });
      res.send({ status: 0, msg: "资源出售失败，该资源已出租成功，请出租时间结束后再出售" });
      return;
    }
    
    let resourceInfo = await resourceInfoDao.findById(resourceId);
    //2、先判断拿到tokenId和合约地址,是否属于当前用个人账户，并且判断是否属于二手交易的首次交易，如果是则创建交易合约，如果不是就获取交易合约地址合约，将交易合约处于挂起状态，让资源处于售卖状态
    let transactionAddressTmp = transactionContract.sell(resourceInfo.resourceAddress,tokenId,sellResource.transactionAddress);
    //3、合约创建部署成功触发事件，更新登记交易合约的地址，还有售卖状态至1
    let transactionAddress = transactionAddressTmp == null?sellResource.transactionAddress:transactionAddressTmp;
    var sellResourceObj = {
      tokenId:tokenId,
      ownerAccount:user.account,
      ownerId:user._id,
      sellPrice:sellPrice,
      transactionAddress:transactionAddress
    }
    await resourceInfoDao.addSellResourceById(resourceId,sellResourceObj)
    let updateObj = await userDao.modifySellStatusAndTransactionAddress(user._id, tokenId, preSellStatus,transactionAddress,sellPrice);
    if (updateObj !== undefined ) {
      res.send({ status: 1, msg: "the resource sell success." });
    } else {
      res.send({ status: 0, msg: "资源出售失败，请稍后重试." });
    }
  } catch (err) {
    logger.error("sell resource fail.",{
      tokenId: tokenId,
      user:user
    },err);
    res.send({ status: 0, msg: "资源出售失败，请稍后重试" });
  }
};

/**
 * 出租一个资源
 * @param req
 * @param res
 * @param next
 */
exports.rentOut = async function(req, res, next) {
    let tokenId = req.body.tokenId;
    let resourceId = req.body.resourceId;
    let rentPrice = req.body.rentPrice;
    let rentTime = req.body.rentTime;
    let user = req.session.passport.user;
    logger.info("rentOut file.", {
      tokenId: tokenId,
      resourceId:resourceId,
      rentPrice:rentPrice,
      rentTime:rentTime,
      user:user
    });
  
    try {
      //todo 校验
      //1、先查看这个资源个体的交易信息
      let purchasedResourceDoc = await userDao.findOneUserPurchasedResourceByResourceIdAndTokenId(user._id,resourceId,tokenId);
      let rentOutResource = purchasedResourceDoc.purchasedResources[0];
      //校验这个资源是否可以售卖
      if(rentOutResource.sellStatus>0){
        logger.warn("sell resource fail.",{
          user:user,
          rentOutResource:rentOutResource
        });
        res.send({ status: 0, msg: "资源出租失败，该资源可能已出售、或正在出售中" });
        return;
      }
      //如果这资源已出租也不能售卖
      if(rentOutResource.rentOutStatus>0){
        logger.warn("rent out resource fail.",{
          user:user,
          rentOutResource:rentOutResource
        });
        res.send({ status: 0, msg: "资源出租失败，该资源已出租成功，请出租时间结束后再出售" });
        return;
      }
  
      let resourceInfo = await resourceInfoDao.findById(resourceId);
      //2、先判断拿到tokenId和合约地址,是否属于当前用个人账户，并且判断是否属于二手交易的首次交易，如果是则创建交易合约，如果不是就获取交易合约地址合约，将交易合约处于挂起状态，让资源处于售卖状态
      let transactionAddressTmp = transactionContract.rentOut(resourceInfo.resourceAddress,tokenId,rentOutResource.transactionAddress);
  
      let transactionAddress = transactionAddressTmp == null?rentOutResource.transactionAddress:transactionAddressTmp;
      //3、合约创建部署成功触发事件，更新登记交易合约的地址，还有售卖状态至1
      var rentOutResourceObj = {
        tokenId:tokenId,
        ownerId:user._id,
        ownerAccount:user.account,
        rentPrice:rentPrice,
        rentTime:rentTime,
        transactionAddress:transactionAddress
      }
      await resourceInfoDao.addRentOutResourceById(resourceId,rentOutResourceObj)
      let updateObj = await userDao.modifyRentStatusAndTransactionAddress(user._id, tokenId, preRentStatus,rentPrice,transactionAddress);
      if (updateObj !== undefined ) {
        res.send({ status: 1, msg: "the resource rent out success." });
      } else {
        res.send({ status: 0, msg: "资源出租失败，请稍后重试" });
      }
    } catch (err) {
      logger.error("sell resource fail.",{
        tokenId: tokenId,
        user:user
      },err);
      res.send({ status: 0, msg: "资源出租失败，请稍后重试" });
    }
}
