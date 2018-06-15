var util = require("util");
var ResourceCopyright = require("../model/resourceCopyright");
var SuperDao = require("./super");
var ObjectUtil = require("../utils/objectUtils");
var log4js = require('log4js');
var logger = log4js.getLogger('dao/user');


var ResourceCopyrightDao = function () {
  SuperDao.call(this);
  this.model = ResourceCopyright;
};

util.inherits(ResourceCopyrightDao, SuperDao);

/**
 * 查找版权的审核和发行状态
 * @param id
 * @returns {*}
 */
ResourceCopyrightDao.prototype.findStatusById = function(id) {
  try{
    ObjectUtil.notNullAssert(id);
    return new Promise((resolve, reject) => {
      ResourceCopyright.find({_id:id},{auditStatus:1,publishStatus:1},function(err,obj){
        if(err){
          reject(err);
        }else{
          resolve(obj);
        }
      });
    });
  }catch(err){
    logger.error("findStatusById error.id:{}",id,err)
    return new Promise((reject) =>{
      reject(err);
    });
  }
}

/**
 * 修改版权的审核状态
 * @param id
 * @param auditStatus 0：未审核，1：审核成功，-1：审核失败
 * @returns {*}
 */
ResourceCopyrightDao.prototype.modifyAuditStatus = function(id,auditStatus){
  try{
    ObjectUtil.notNullAssert(id);
    ObjectUtil.notNullAssert(auditStatus);
    
    return new Promise((resolve, reject) => {
      ResourceCopyright.update({'_id':id},
        {$set:{ 'auditStatus': auditStatus }},function(err,updateObj){
          if(err){
            reject(err);
          }else{
            resolve(updateObj);
          }
        }
      );
    });
  }catch(err){
    logger.error("findStatusById error.id:{}",id,err)
    return new Promise((reject) =>{
      reject(err);
    });
  }
}

/**
 * 改版权的发行状态
 * @param id
 * @param publishStatus 0：未发行，1：已发行
 * @returns {*}
 */
ResourceCopyrightDao.prototype.modifyPublishStatus = function(id,publishStatus,resourceAddress,resourceId){
  try{
    ObjectUtil.notNullAssert(id);
    ObjectUtil.notNullAssert(publishStatus);
    ObjectUtil.notNullAssert(resourceAddress);
    
    return new Promise((resolve, reject) => {
      ResourceCopyright.update({'_id':id},
        {$set:{ 'publishStatus': publishStatus,'resourceAddress':resourceAddress,'resourceId':resourceId }},function(err,updateObj){
          if(err){
            reject(err);
          }else{
            resolve(updateObj);
          }
        }
      );
    });
  }catch(err){
    logger.error("modifyPublishStatus error.",{
      id:id,
      publishStatus:publishStatus
    },err)
    return new Promise((reject) =>{
      reject(err);
    });
  }
}

ResourceCopyrightDao.prototype.updateResourceCopyrightInfo = function(id, copyrightAddress, resourceHash, resourceDhash, auditStatus){
  try{
    ObjectUtil.notNullAssert(id);
    ObjectUtil.notNullAssert(copyrightAddress);
    ObjectUtil.notNullAssert(resourceHash);
    ObjectUtil.notNullAssert(resourceDhash);
    
    return new Promise((resolve, reject) => {
      ResourceCopyright.update({'_id':id},
        {$set:{
          'auditStatus': auditStatus,
          'copyrightAddress':copyrightAddress,
          'resourceHash':resourceHash,
          'resourceDhash':resourceDhash
        }},function(err,updateObj){
          if(err){
            reject(err);
          }else{
            resolve(updateObj);
          }
        }
      );
    });
  }catch(err){
    logger.error("updateResourceCopyrightInfo error",{
      id:id,
      auditStatus: auditStatus,
      copyrightAddress:copyrightAddress,
      resourceHash:resourceHash,
      resourceDhash:resourceDhash
    },err)
    return new Promise((reject) =>{
      reject(err);
    });
  }
}

/*初始化*/
module.exports = new ResourceCopyrightDao();
