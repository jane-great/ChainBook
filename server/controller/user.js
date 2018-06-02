var userDao = require("../dao/user");
var log4js = require('log4js');
var logger = log4js.getLogger('controller/user');

//预出售的状态
//TODO 常量
const preSellStatus = 1;
const preRentStatus = 1;

/**
 * 使用passport来控制权限,和存储session，密码加密存储
 * @param req
 * @param res
 * @param next
 */
exports.login = function (req, res, next) {
  userDao.verifyUser(req.body.userName,req.body.pwd,function(err,data){
  
  });
}

/**
 * // 注册用户，且注册用户的链克口袋 post：方法，用户只需要输入用户名，手机号，邮箱
 * @param req
 * @param res
 * @param next
 */
exports.register = function(req, res, next){
  logger.info("register user");
  res.send("register success");
}

/**
 * 获取当前登录的用户信息
 * @param req
 * @param res
 * @param next
 */
exports.getCurrentUserInfo = function (req, res, next) {
  //获得到登录用户，将其传入前台页面
  //var user = req.session.passport.user;
  res.send({'success': true, 'data': user});
}

/**
 * 获取当前用户已购买的资源列表
 * @param req
 * @param res
 * @param next
 */
exports.getPurchasedResourcesByUser = async function(req, res, next) {
  logger.info('get purchased resources');
  //1、先拿到当前用户信息，判断用户是否是登录状态
  //2、从数据库中获取当前已购买的资源列表
  let list = await userDao.getPurchasedResourcesByUserId("5b0e778305373eafe9ceed5f");
  res.send(list);
}

/**
 * 获取当前用户已租赁的资源列表
 * @param req
 * @param res
 * @param next
 */
exports.getRentResourcesByUser = async function(req, res, next) {
  logger.info('get rent resources');
  //1、先拿到当前用户信息，判断用户是否是登录状态
  //2、从数据库中获取当前已购买的资源列表
  let list = await userDao.getRentResourcesByUserId("5b0e778305373eafe9ceed5f");
  res.send(list);
}

/**
 * 获取当前用户提交的版权记录
 * @param req
 * @param res
 * @param next
 */
exports.getCopyRightsByUser = async function(req, res, next) {
  logger.info('get rent resources');
  //1、先拿到当前用户信息，判断用户是否是登录状态
  //2、从数据库中获取当前版权的资源列表
  let list = await userDao.getRentResourcesByUserId("5b0e778305373eafe9ceed5f");
  res.send(list);
}

/**
 * 出售一个资源
 * @param req
 * @param res
 * @param next
 */
exports.sell = async function(req, res, next) {
  let tokenId = req.param("tokenId");
  logger.info('selling resources.',{
    tokenId:tokenId
  });
  
  try{
    //1、先拿到当前用户信息，判断用户是否是登录状态,获取当前用户的account
    
    //2、先判断拿到tokenId和合约地址,已经个人账户，创建交易合约，让资源处于售卖状态
  
    //3、合约创建部署成功触发事件，更新登记合约的地址，还有售卖状态至1
    let updateObj = await userDao.modifySellStatus("5b0e778305373eafe9ceed5f",tokenId,preSellStatus);
    if(updateObj !== undefined){
      res.send({status:1,msg:"the resource sell success."})
    }else{
      res.send({status:0,msg:"资源出售失败，请稍后重试"});
    }
  } catch (err) {
    logger.error("sell resource fail.",{
      tokenId:tokenId
    },err);
    res.send({status:0,msg:"资源出售失败，请稍后重试"});
  }
}

/**
 * 出租一个资源
 * @param req
 * @param res
 * @param next
 */
exports.rentOut = async function(req, res, next) {
  let tokenId = req.param("tokenId");
  logger.info('renting out resources.',{
    tokenId:tokenId
  });
  
  try{
    //1、先拿到当前用户信息，判断用户是否是登录状态,获取当前用户的account
    
    //2、先判断拿到tokenId和合约地址,已经个人账户，创建交易合约，让资源处于售卖状态
    
    //3、合约创建部署成功触发事件，更新登记合约的地址，还有售卖状态至1
    let updateObj = await userDao.modifySellStatus("5b0e778305373eafe9ceed5f",tokenId,preRentStatus);
    if(updateObj !== undefined){
      res.send({status:1,msg:"the resource sell success."})
    }else{
      res.send({status:0,msg:"资源出售失败，请稍后重试"});
    }
  } catch (err) {
    logger.error("rent out resource fail.",{
      tokenId:tokenId
    },err);
    res.send({status:0,msg:"资源出租失败，请稍后重试"});
  }
}
