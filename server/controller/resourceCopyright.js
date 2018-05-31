var log4js = require('log4js');
var logger = log4js.getLogger('chainbook');
var userDao = require("../dao/user");
var ResourceCopyrightDao = require("../dao/resourceCopyright");

/**
 * 申请版权
 * @param req
 * @param res
 * @param next
 */
exports.applyCopyright = function(req,res,next){
  logger.info("apply copyright");
  
  res.send("apply copyright");
}

/**
 * 上传样本至服务器
 * @param req
 * @param res
 * @param next
 */
exports.uploadSample = function(req,res,next){
  logger.info("upload sample");
  
  res.send("upload sample");
}

/**
 * 登记版权至合约，将被登记合约的定时任务调用
 * @param req
 * @param res
 * @param next
 */
exports.registerCopyright = function(resourceCopyright){
  logger.info("register copyright");
  //1、根据userAccount捞取基本用户信息
  //2、将本地的最新样本上传至ipfs，并获得hash值
  //3、调用合约的登记版权的方法，登记合约,保存版权的信息和版权的hash值，并返回合约地址
  //4、登记hash，dhash,合约地址，审核状态等至resourceCopyright和user中
}

/**
 * 根据id获取资源版权细节
 * @param req
 * @param res
 * @param next
 */
exports.getResourceCopyrightDetailById = function(req, res, next) {
  logger.info("getResourceCopyrightDetailById");
  //1、先登记发布的资源基本数据
  res.send("getResourceCopyrightDetailById");
}
