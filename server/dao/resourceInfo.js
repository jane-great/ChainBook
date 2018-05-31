var util = require("util");
var ResourceInfo = require("../model/resourceInfo.js");
var SuperDao = require("./super.js");
var ObjectUtil = require("../utils/objectUtils");
var log4js = require('log4js');
var logger = log4js.getLogger('dao/resourceInfo');



var ResourceInfoDao = function () {
  SuperDao.call(this);
  this.model = ResourceInfo;
};


util.inherits(ResourceInfoDao, SuperDao);

/**
 * 查询首发销售状态,hasSellout,0：首发销售中，1：首发销售已完成
 * @param id
 * @returns {*}
 */
ResourceInfoDao.prototype.findSellOutStatusById = function(id) {
  try{
    ObjectUtil.notNullAssert(id);
    
    return new Promise((resolve, reject) => {
      ResourceInfo.find({_id:id},{hasSellOut:1},function(err,obj) {
        if (err){
          reject(err);
        } else {
          resolve(obj);
        }
      });
    });
  }catch(err){
    logger.error("findSellOutStatusById error.id:{}",id,err);
    return new Promise(reject => {
      reject(err);
    });
  }
}
/**
 * TODO: 分页
 * 查询首发中的所有资源
 * @param hasSellout
 */
ResourceInfoDao.prototype.findAllResource = function(){
  try{
    return new Promise((resolve, reject) => {
      ResourceInfo.find({hasSellout:0},function(err,list) {
        if(err){
          reject(err);
        } else {
          resolve(list);
        }
      })
    });
  }catch(err){
    logger.error("findAllResource error.",err);
    return new Promise(reject => {
      reject(err);
    });
  }
}

/*初始化*/
module.exports = new ResourceInfoDao();
