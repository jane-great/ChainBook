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
      ResourceInfo.findOne({_id:id,hasSellOut:0},{sellResources:0,tenantableResources:0},function(err,obj) {
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
      ResourceInfo.find(option,{sellResources:0,tenantableResources:0},function(err,list) {
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
      let option = {sellResources:{$elemMatch:{$ne:null}}};
      if(page.lastId != undefined && page.lastId != 0 && "" != page.lastId){
        option = {'_id' :{ "$gt" : page.lastId},sellResources:{$elemMatch:{$ne:null}}};
      }
      ResourceInfo.find(option,{sellResources:0,tenantableResources:0},function(err,list) {
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
      ResourceInfo.find({_id:id,sellResources:{$elemMatch:{$ne:null}}},{sellResources:1},function(err,list) {
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
      ResourceInfo.find(option,{sellResources:0,tenantableResources:0},function(err,list) {
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
      ResourceInfo.update({_id:id},{'$pull':{"sellResources":{"tokenId":tokenId}}},function(err,list) {
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
ResourceInfoDao.prototype.deleteTenantableResource = function(id,tokenId){
  try{
    return new Promise((resolve, reject) => {
      ResourceInfo.update({_id:id},{'$pull':{"tenantableResources":{"tokenId":tokenId}}},function(err,list) {
        if(err){
          reject(err);
        } else {
          resolve(list);
        }
      });
    });
  }catch(err){
    logger.error("deleteTenantableResource error.",{
      id:id,
      tokenId:tokenId
    },err);
    return new Promise(reject => {
      reject(err);
    });
  }
}

/**
 * 登记某个资源发布合约后的地址
 * @param id
 * @param tokenId
 * @param sellStatus 0:不售卖，1：售卖，2：已售卖
 * @returns {*}
 */
ResourceInfoDao.prototype.modifyResourceAddress = function(id,resourceAddress){
  try{
    ObjectUtil.notNullAssert(id);
    ObjectUtil.notNullAssert(resourceAddress);
    
    return new Promise((resolve,reject) => {
      ResourceInfo.update({'_id':id},
        {$set:{ 'resourceAddress': resourceAddress,'hasSellOut': 0}},function(err,updateObj){
          if(err){
            reject(err);
          }else{
            resolve(updateObj);
          }
        }
      )
    });
  }catch(err){
    logger.error("modifySellStatus error.id:{},tokenId:{},sellStatus:{}",id,tokenId,sellStatus,err);
    return new Promise(reject =>{
      reject(err);
    });
  }
}

/**
 * 添加一条用户确认记录
 * @param account
 * @param rentResourceObj
 * @returns {*}
 */
ResourceInfoDao.prototype.addSellResourceById= function(id,sellResourceObj){
  try{
    ObjectUtil.notNullAssert(id);
    ObjectUtil.notNullAssert(sellResourceObj);
    
    return new Promise((resolve, reject) => {
      ResourceInfo.update({_id:id},{"$push":{"sellResources":sellResourceObj}},function(err,updateObj){
        if(err){
          reject(err);
        }else{
          resolve(updateObj);
        }
      });
    });
  }catch(err){
    logger.error("addSellResourceById error",id,err);
    return new Promise((reject) =>{
      reject(err);
    });
  }
}


ResourceInfoDao.prototype.addRentOutResourceById= function(id,rentOutResourceObj){
  try{
    ObjectUtil.notNullAssert(id);
    ObjectUtil.notNullAssert(rentOutResourceObj);
    
    return new Promise((resolve, reject) => {
      ResourceInfo.update({_id:id},{"$push":{"tenantableResources":rentOutResourceObj}},function(err,updateObj){
        if(err){
          reject(err);
        }else{
          resolve(updateObj);
        }
      });
    });
  }catch(err){
    logger.error("addSellResourceById error",id,err);
    return new Promise((reject) =>{
      reject(err);
    });
  }
}

/**
 * 查询售卖图书owner信息
 * @returns {Promise<any>}
 */
ResourceInfoDao.prototype.findSellResourceOwner = function(id,tokenId){
  try{
    return new Promise((resolve, reject) => {
      ResourceInfo.find({_id:id,"sellResources.tokenId":tokenId},{"resourceName":1,"resourceAddress":1,"sellResources.$":1},function(err,list) {
        if(err){
          reject(err);
        } else {
          resolve(list);
        }
      });
    });
  }catch(err){
    logger.error("findSellResourceOwner error.",{
      id:id
    },err);
    return new Promise(reject => {
      reject(err);
    });
  }
}

/**
 * 查询出租图书owner信息
 * @returns {Promise<any>}
 */
ResourceInfoDao.prototype.findTenantableResourceOwner = function(id,tokenId){
  try{
    return new Promise((resolve, reject) => {
      ResourceInfo.find({_id:id,"tenantableResources.tokenId":tokenId},{"resourceName":1,"resourceAddress":1,"tenantableResources.$":1},function(err,list) {
        if(err){
          reject(err);
        } else {
          resolve(list);
        }
      });
    });
  }catch(err){
    logger.error("findTenantableResourcesOwner error.",{
      id:id
    },err);
    return new Promise(reject => {
      reject(err);
    });
  }
}

/*初始化*/
module.exports = new ResourceInfoDao();
