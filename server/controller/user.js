const userDao = require("../dao/user");
const log4js = require("log4js");
const logger = log4js.getLogger("controller/user");
const encrypt = require('../utils/encrypt');
const thunder = require("../utils/thunder");
const transactionContract = require("../dao/transactionContract");

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
    account:"0x7cF2baAe306B1B0476843De3909097be0E6850f3"
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
  let user = req.session.passport.user;
  logger.info("selling file.", {
    tokenId: tokenId
  });
  
  try {
    //todo 校验
    
    //2、先判断拿到tokenId和合约地址,是否属于当前用个人账户，并且判断是否属于二手交易的首次交易，如果是则创建交易合约，如果不是就获取合约，将交易合约处于挂起状态，让资源处于售卖状态
    let tractionAddress = transactionContract.buy()
    //3、合约创建部署成功触发事件，更新登记合约的地址，还有售卖状态至1
    let updateObj = await userDao.modifySellStatus(user._id, tokenId, preSellStatus);
    if (updateObj !== undefined ) {
      res.send({ status: 1, msg: "the resource sell success." });
    } else {
      res.send({ status: 0, msg: "资源出售失败，请稍后重试" });
    }
  } catch (err) {
    logger.error("sell resource fail.", {
      tokenId: tokenId
    }, err);
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
  let tokenId = req.param("tokenId");
  logger.info("renting out file.", {
    tokenId: tokenId
  });
  
  try {
    //1、先拿到当前用户信息，判断用户是否是登录状态,获取当前用户的account
    
    //2、先判断拿到tokenId和合约地址,已经个人账户，创建交易合约，让资源处于售卖状态
    
    //3、合约创建部署成功触发事件，更新登记合约的地址，还有售卖状态至1
    let updateObj = await userDao.modifySellStatus("5b0e778305373eafe9ceed5f", tokenId, preRentStatus);
    if (updateObj !== undefined) {
      res.send({ status: 1, msg: "the resource sell success." });
    } else {
      res.send({ status: 0, msg: "资源出售失败，请稍后重试" });
    }
  } catch (err) {
    logger.error("rent out resource fail.", {
      tokenId: tokenId
    }, err);
    res.send({ status: 0, msg: "资源出租失败，请稍后重试" });
  }
};
