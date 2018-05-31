var log4js = require('log4js');
var logger = log4js.getLogger('chainbook');
var userDao = require("../dao/user");
var ResourceInfoDao = require("../dao/resourceInfo");

/**
 * 发布资源，post方法
 * @param req
 * @param res
 * @param next
 */
exports.publishResource = function(req, res, next) {
  logger.info("publish resource");
  //1、先登记发布的资源基本数据
  res.send("publish resource");
}

/**
 * 上传封面图片
 * @param req
 * @param res
 * @param next
 */
exports.uploadCoverImg = function(req, res, next) {
  logger.info("uploadCoverImg");
  //1、先登记发布的资源基本数据
  res.send("uploadCoverImg");
}

/**
 * 购买一个资源
 * @param req
 * @param res
 * @param next
 */
exports.buy = function (req, res, next) {
  logger.info("buy");
  //1、先登记发布的资源基本数据
  res.send("buy");
}

/**
 * 租赁一个资源
 * @param req
 * @param res
 * @param next
 */
exports.rent = function(req, res, next) {
  logger.info("rent");
  //1、先登记发布的资源基本数据
  res.send("rent");
}

/**
 * 根据id获取资源信息细节
 * @param req
 * @param res
 * @param next
 */
exports.getResourceDetailById = function(req, res, next) {
  logger.info("getResourceDetailById");
  //1、先登记发布的资源基本数据
  res.send("getResourceDetailById");
}
