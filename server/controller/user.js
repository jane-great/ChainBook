var userDao = require("../dao/user");
var log4js = require('log4js');
var logger = log4js.getLogger('chainbook');

/**
 * 使用passport来控制权限,和存储session，密码加密存储
 * @param req
 * @param res
 * @param next
 */
exports.login = function (req, res, next) {
  userDao.verifyUser(req.body.userName,req.body.pwd,function(err,data){
    if(err){
      logger.error(err);
      return res.send(err);
    } else {
      logger.info("user info:"+data);
      res.send(data);
    }
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
exports.getPurchasedResourcesByUser = function(req, res, next) {
  logger.info('get purchased resources');
  res.send("get purchased resources");
}

/**
 * 获取当前用户已租赁的资源列表
 * @param req
 * @param res
 * @param next
 */
exports.getRentResourcesByUser = function(req, res, next) {
  logger.info('get rent resources');
  res.send("get rent resources");
}

/**
 * 获取当前用户提交的版权记录
 * @param req
 * @param res
 * @param next
 */
exports.getCopyRightsByUser = function(req, res, next) {
  logger.info('get rent resources');
  res.send("get rent resources");
}

/**
 * 出售一个资源
 * @param req
 * @param res
 * @param next
 */
exports.sell = function(req, res, next) {
  logger.info('get rent resources');
  res.send("get rent resources");
}

/**
 * 出租一个资源
 * @param req
 * @param res
 * @param next
 */
exports.rentOut = function(req, res, next) {
  logger.info('rent out resources');
  res.send("rent out resources");
}
