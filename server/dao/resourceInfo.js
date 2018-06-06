var util = require("util");
var ResourceInfo = require("../model/resourceInfo.js");
var ObjectId = require("../model/resourceInfo").ObjectId;
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
      ResourceInfo.find({_id:id,hasSellOut:0},{purchasedResources:0,tenantableResources:0},function(err,obj) {
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
ResourceInfoDao.prototype.findAllResource = function(page){
  try{
    return new Promise((resolve, reject) => {
      let option = {hasSellOut:0};
      if(page.lastId != undefined && page.lastId != 0 && "" != page.lastId){
        option = {'_id' :{ "$gt" : page.lastId},hasSellOut:0}
      }
      ResourceInfo.find(option,{purchasedResources:0,tenantableResources:0},function(err,list) {
        if(err){
          reject(err);
        } else {
          resolve(list);
        }
      }).limit(page.pageSize).sort({_id:1});
    });
  }catch(err){
    logger.error("findAllResource error.",err);
    return new Promise(reject => {
      reject(err);
    });
  }
}

/**
 * 查询二手的所有资源
 * @returns {Promise<any>}
 */
ResourceInfoDao.prototype.findPurchasedResources = function(page){
  try{
    return new Promise((resolve, reject) => {
      let option = {purchasedResources:{$elemMatch:{$ne:null}}};
      if(page.lastId != undefined && page.lastId != 0 && "" != page.lastId){
        option = {'_id' :{ "$gt" : page.lastId},purchasedResources:{$elemMatch:{$ne:null}}};
      }
      ResourceInfo.find(option,{purchasedResources:0,tenantableResources:0},function(err,list) {
        if(err){
          reject(err);
        } else {
          resolve(list);
        }
      }).limit(page.pageSize).sort({_id:1});
    });
  }catch(err){
    logger.error("findPurchasedResources error.",{
      page:page
    },err);
    return new Promise(reject => {
      reject(err);
    });
  }
}

/**
 * 查询二手的所有资源
 * @returns {Promise<any>}
 */
ResourceInfoDao.prototype.findPurchasedResourceOwners = function(id){
  try{
    return new Promise((resolve, reject) => {
      ResourceInfo.find({_id:id,purchasedResources:{$elemMatch:{$ne:null}}},{purchasedResources:1},function(err,list) {
        if(err){
          reject(err);
        } else {
          resolve(list);
        }
      });
    });
  }catch(err){
    logger.error("findPurchasedResourceOwners error.",{
      id:id
    },err);
    return new Promise(reject => {
      reject(err);
    });
  }
}

/**
 * 查询二手的所有资源
 * @returns {Promise<any>}
 */
ResourceInfoDao.prototype.findTenantableResourceOwners = function(id){
  try{
    return new Promise((resolve, reject) => {
      ResourceInfo.find({_id:id,tenantableResources:{$elemMatch:{$ne:null}}},{tenantableResources:1},function(err,list) {
        if(err){
          reject(err);
        } else {
          resolve(list);
        }
      });
    });
  }catch(err){
    logger.error("findTenantableResourceOwners error.",{
      id:id
    },err);
    return new Promise(reject => {
      reject(err);
    });
  }
}

/**
 * 查询租赁的所有资源
 * @returns {Promise<any>}
 */
ResourceInfoDao.prototype.findTenantableResources = function(page){
  try{
    return new Promise((resolve, reject) => {
      let option = {tenantableResources:{$elemMatch:{$ne:null}}};
      if(page.lastId != undefined && page.lastId != 0 && "" != page.lastId){
        option = {'_id' :{ "$gt" : page.lastId},tenantableResources:{$elemMatch:{$ne:null}}};
      }
      ResourceInfo.find(option,{purchasedResources:0,tenantableResources:0},function(err,list) {
        if(err){
          reject(err);
        } else {
          resolve(list);
        }
      }).limit(page.pageSize).sort({_id:1});
    });
  }catch(err){
    logger.error("findTenantableResources error.",err);
    return new Promise(reject => {
      reject(err);
    });
  }
}

/**
 * 删除已被二次购买的记录
 * @param id
 * @param tokenId
 * @returns {Promise<any>}
 */
ResourceInfoDao.prototype.deletePurchasedResource = function(id,tokenId){
  try{
    return new Promise((resolve, reject) => {
      ResourceInfo.update({_id,id},{'$pull':{"purchasedResources":{"tokenId":tokenId}}},function(err,list) {
        if(err){
          reject(err);
        } else {
          resolve(list);
        }
      });
    });
  }catch(err){
    logger.error("deletePurchasedResource error.",{
      id:id,
      tokenId:tokenId
    },err);
    return new Promise(reject => {
      reject(err);
    });
  }
}

/**
 * 删除已被租赁的记录
 * @param id
 * @param tokenId
 * @returns {Promise<any>}
 */
ResourceInfoDao.prototype.deleteTenantableResources = function(id,tokenId){
  try{
    return new Promise((resolve, reject) => {
      ResourceInfo.update({_id,id},{'$pull':{"tenantableResources":{"tokenId":tokenId}}},function(err,list) {
        if(err){
          reject(err);
        } else {
          resolve(list);
        }
      });
    });
  }catch(err){
    logger.error("deleteTenantableResources error.",{
      id:id,
      tokenId:tokenId
    },err);
    return new Promise(reject => {
      reject(err);
    });
  }
}

/*初始化*/
module.exports = new ResourceInfoDao();
