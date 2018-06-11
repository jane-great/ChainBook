var util = require("util");
var User = require("../model/user.js");
var Sessions = require("../model/session.js");
var SuperDao = require("./super.js");
var ObjectUtil = require("../utils/objectUtils");
var log4js = require('log4js');
var logger = log4js.getLogger('dao/user');
var encrypt = require('../utils/encrypt');



var UserDao = function () {
  SuperDao.call(this);
  this.model = User;
};

util.inherits(UserDao, SuperDao);

UserDao.prototype.deleteSessionById = function (id){
  return new Promise((resolve,reject) => {
    //TODO 清除
    Sessions.deleteOne({_id:id}, function (err) {
      if(err){
        reject(err);
      }
      resolve(null);
    });
  });
}

UserDao.prototype.verifyUser = function (userName, password) {
  return new Promise((resolve, reject) => {
    User.findOne({userName: userName},{
      userName:1,
      pwd:1,
      email:1,
      mobile:1,
      randomNum:1,
      account:1
    },function (err, obj) {
      if (err) {
        reject(err);
        return;
      }
      if(encrypt.getMD5(password, obj.randomNum) == obj.pwd){
        obj.randomNum = '';
        resolve(obj);
      }else{
        resolve(null);
      }
    });
  });
}

UserDao.prototype.findUserInfoById = function(id){
  return new Promise((resolve, reject) => {
    User.findOne({_id: id},{
      userName:1,
      email:1,
      mobile:1,
      account:1
    },function (err, obj) {
      if (err) {
        reject(err);
      }else {
        resolve(obj);
      }
    });
  });
}


UserDao.prototype.updatePwd = function (userObj, callback) {
  let id = userObj._id;
  if (userObj.password) {
    userObj['randomNum'] = getRandom();
    userObj.password = getMD5(userObj.password, userObj.randomNum);
  }
  userObj.updateDate = new Date();
  User.update({_id: id}, userObj, function (err) {
    callback(err);
  });
}

/**
 * 添加一条用户的版权登记信息
 * @param id
 * @param CopyRightObj
 * @returns {*}
 */
UserDao.prototype.addCopyRightByUser = async function(id,CopyRightObj){
  try{
    ObjectUtil.notNullAssert(id);
    ObjectUtil.notNullAssert(CopyRightObj);
    
    return new Promise((resolve, reject) => {
      User.update({_id:id},{"$push":{"copyrights":CopyRightObj}},function(err,updateObj) {
        if(err){
          reject(err);
        }else{
          resolve(updateObj);
        }
      });
    });
  }catch(err){
    logger.error("account:{},CopyRightObj:{}",account,CopyRightObj,err)
    return new Promise((reject) =>{
      reject(err);
    });
  }
}


/**
 * 添加一条用户购买资源的记录
 * @param account
 * @param PurchasedResourceObj
 * @returns {*}
 */
UserDao.prototype.addPurchasedResourceByUser = function(id,purchasedResourceObj){
  try{
    ObjectUtil.notNullAssert(id);
    ObjectUtil.notNullAssert(purchasedResourceObj);
    
    return new Promise((resolve, reject) => {
      User.update({_id:id},{"$push":{"purchasedResources":purchasedResourceObj}},function(err,updateObj){
        if(err){
          reject(err);
        }else{
          resolve(updateObj);
        }
      });
    });
  }catch(err){
    logger.error("addPurchasedResourceByUser error",{id:id},err);
    return new Promise((reject) =>{
      reject(err);
    });
  }
}

UserDao.prototype.findOneUserPurchasedResourceByResourceIdAndTokenId = function (userId,resourceId,tokenId){
  return new Promise((resolve, reject) => {
    User.findOne({
      _id:userId,
      "purchasedResources.resourceId":resourceId,
      "purchasedResources.tokenId":tokenId,
      "purchasedResources.sellStatus":0
  },{"purchasedResources":{$slice:-1}},function(err,data) {
      if(err){
        reject(err);
      }else{
        resolve(data);
      }
    });
  });
}


/**
 * 添加一条用户租赁资源的记录
 * @param account
 * @param rentResourceObj
 * @returns {*}
 */
UserDao.prototype.addRentResourceByUser = function(id,rentResourceObj){
  try{
    ObjectUtil.notNullAssert(id);
    ObjectUtil.notNullAssert(rentResourceObj);
    
    this.findOneUserPurchasedResourceByResourceIdAndTokenId()
    
    return new Promise((resolve, reject) => {
      User.update({_id:id},{"$push":{"rentResources":rentResourceObj}},function(err,updateObj){
        if(err){
          reject(err);
        }else{
          resolve(updateObj);
        }
      })
    });
  }catch(err){
    logger.error("addRentResourceByUser error",{
      id:id,
      rentResourceObj:rentResourceObj
    },err);
    return new Promise((reject) =>{
      reject(err);
    });
  }
}

/**
 * 根据id获取用户登记的版权信息列表
 * @param id
 * @returns {*}
 */
UserDao.prototype.getCopyrightsByUserId = function(id){
  try{
    ObjectUtil.notNullAssert(id);
    return new Promise((resolve,reject)=>{
      User.find({_id:id},{copyrights:1},function(err,list){
        if(err) {
          reject(err);
        } else {
          resolve(list);
        }
      });
    });
  }catch(err){
    logger.error("getCopyrightsByUserId error,id:{}",id,err);
    return new Promise((reject) =>{
      reject(err);
    });
  }
}

/**
 * 根据id获取用户购买书籍信息列表
 * @param id
 * @returns {*}
 */
UserDao.prototype.getPurchasedResourcesByUserId = function(id){
  try{
    ObjectUtil.notNullAssert(id);
    return new Promise((resolve,reject)=>{
      User.find({_id:id},{purchasedResources:1},function(err,list){
        if(err) {
          reject(err);
        } else {
          resolve(list);
        }
      });
    });
  }catch(err){
    logger.error("getPurchasedResourcesByUserId error,id:{}",id,err);
    return new Promise((reject) =>{
      reject(err);
    });
  }
}

/**
 * 根据id获取用户租赁书籍列表
 * @param id
 * @returns {*}
 */
UserDao.prototype.getRentResourcesByUserId = function(id){
  try{
    ObjectUtil.notNullAssert(id);
    return new Promise((resolve,reject)=>{
      User.find({_id:id},{rentResources:1},function(err,list){
        if(err) {
          reject(err);
        } else {
          resolve(list);
        }
      });
    });
  }catch(err){
    logger.error("getRentResourcesByUserId error.id:{}",id,err);
    return new Promise(reject =>{
      reject(err);
    });
  }
}



/**
 * 登记期望租赁的某个资源
 * @param id
 * @param tokenId
 * @param rentStatus 0:不出租，1：出租，2：已出租
 * @returns {*}
 */
UserDao.prototype.modifySellStatus = function(id,tokenId,sellStatus){
  try{
    ObjectUtil.notNullAssert(id);
    ObjectUtil.notNullAssert(tokenId);
    ObjectUtil.notNullAssert(sellStatus);
    
    let setData = {$set:{ 'purchasedResources.$.sellStatus': sellStatus}};
    return new Promise((resolve,reject) => {
      User.update({'_id':id,'purchasedResources.tokenId':tokenId},setData,function(err,updateObj){
          if(err){
            reject(err);
          }else{
            resolve(updateObj);
          }
        }
      )
    });
  }catch(err){
    logger.error("modifyRentStatus error",{
      id:id,
      tokenId:tokenId,
      sellStatus:sellStatus
    },err);
    return new Promise(reject =>{
      reject(err);
    });
  }
}

UserDao.prototype.modifySellStatusAndTransactionAddress = function(id,tokenId,sellStatus,transactionAddress,sellPrice){
  try{
    ObjectUtil.notNullAssert(id);
    ObjectUtil.notNullAssert(tokenId);
    ObjectUtil.notNullAssert(sellPrice);
    let setData = {$set:{ 'purchasedResources.$.sellStatus': sellStatus,"purchasedResources.$.sellPrice":sellPrice}};
    if(transactionAddress != undefined && transactionAddress != null){
      setData = {$set:{ 'purchasedResources.$.sellStatus': sellStatus,
          "purchasedResources.$.sellPrice":sellPrice,
          'purchasedResources.$.transactionAddress':transactionAddress}};
    }
    
    return new Promise((resolve,reject) => {
      User.update({'_id':id,'purchasedResources.tokenId':tokenId},setData,function(err,updateObj){
          if(err){
            reject(err);
          }else{
            resolve(updateObj);
          }
        }
      )
    });
  }catch(err){
    logger.error("modifySellStatus error.id:{},tokenId:{},sellStatus:{}",{
      id:id,
      tokenId:tokenId,
      sellStatus:sellStatus
    },err);
    return new Promise(reject =>{
      reject(err);
    });
  }
}

/**
 * 登记期望租赁的某个资源
 * @param id
 * @param tokenId
 * @param rentStatus 0:不出租，1：出租，2：已出租
 * @returns {*}
 */
UserDao.prototype.modifyRentStatus = function(id,tokenId,rentStatus){
  try{
    ObjectUtil.notNullAssert(id);
    ObjectUtil.notNullAssert(tokenId);
    ObjectUtil.notNullAssert(rentStatus);
    
    let setData = {$set:{ 'purchasedResources.$.rentOutStatus': rentStatus}};
    return new Promise((resolve,reject) => {
      User.update({'_id':id,'purchasedResources.tokenId':tokenId},setData,function(err,updateObj){
          if(err){
            reject(err);
          }else{
            resolve(updateObj);
          }
        }
      )
    });
  }catch(err){
    logger.error("modifyRentStatus error",{
      id:id,
      tokenId:tokenId,
      rentStatus:rentStatus
    },err);
    return new Promise(reject =>{
      reject(err);
    });
  }
}

/**
 * 登记期望出租的某个资源
 * @param id
 * @param tokenId
 * @param rentStatus 0:不出租，1：出租，2：已出租
 * @returns {*}
 */
UserDao.prototype.modifyRentStatusAndTransactionAddress = function(id,tokenId,rentStatus,rentPrice,transactionAddress){
  try{
    ObjectUtil.notNullAssert(id);
    ObjectUtil.notNullAssert(tokenId);
    ObjectUtil.notNullAssert(rentStatus);
    ObjectUtil.notNullAssert(rentPrice);
    
    let setData = {$set:{ 'purchasedResources.$.rentOutStatus': rentStatus, "purchasedResources.$.rentPrice":rentPrice}};
    if(transactionAddress != undefined && transactionAddress != null){
      setData = {$set:{ 'purchasedResources.$.rentOutStatus': rentStatus,
          "purchasedResources.$.rentPrice":rentPrice,
          'purchasedResources.$.transactionAddress':transactionAddress}};
    }
    
    return new Promise((resolve,reject) => {
      User.update({'_id':id,'purchasedResources.tokenId':tokenId},setData,function(err,updateObj){
          if(err){
            reject(err);
          }else{
            resolve(updateObj);
          }
        }
      )
    });
  }catch(err){
    logger.error("modifyRentStatus error",{
      id:id,
      tokenId:tokenId,
      rentStatus:rentStatus
    },err);
    return new Promise(reject =>{
      reject(err);
    });
  }
}


/**
 * 登记出售已有的某个资源
 * @param id
 * @param tokenId
 * @param sellStatus 0:不售卖，1：售卖，2：已售卖
 * @returns {*}
 */
UserDao.prototype.modifyCopyrightInfo = function(id,copyrightId,resourceAddress){
  try{
    ObjectUtil.notNullAssert(id);
    ObjectUtil.notNullAssert(copyrightId);
    ObjectUtil.notNullAssert(resourceAddress);
    
    return new Promise((resolve,reject) => {
      User.update({'_id':id,'copyrights.copyrightId':copyrightId},
        {$set:{ 'copyrights.$.resourceAddress': resourceAddress }},function(err,updateObj){
          if(err){
            reject(err);
          }else{
            resolve(updateObj);
          }
        }
      )
    });
  }catch(err){
    logger.error("modifyCopyrightInfo error.",{
      userId:id,
      copyrightId:copyrightId
    },err);
    return new Promise(reject =>{
      reject(err);
    });
  }
}

/**
 * 登记出售已有的某个资源
 * @param id
 * @param tokenId
 * @param sellStatus 0:不售卖，1：售卖，2：已售卖
 * @returns {*}
 */
UserDao.prototype.modifyCopyrightAuditInfo = function(id,copyrightId,resourcesIpfsHash,resourcesIpfsDHash,copyrightAddress){
  try{
    ObjectUtil.notNullAssert(id);
    ObjectUtil.notNullAssert(copyrightId);
    ObjectUtil.notNullAssert(resourcesIpfsHash);
    ObjectUtil.notNullAssert(resourcesIpfsDHash);
    ObjectUtil.notNullAssert(copyrightAddress);
    
    return new Promise((resolve,reject) => {
      User.update({'_id':id,'copyrights.copyrightId':copyrightId},
        {$set:{ 'copyrights.$.resourcesIpfsHash': resourcesIpfsHash,
            'copyrights.$.resourcesIpfsDHash': resourcesIpfsDHash,
            'copyrights.$.copyrightAddress': copyrightAddress,
          }},function(err,updateObj){
          if(err){
            reject(err);
          }else{
            resolve(updateObj);
          }
        }
      )
    });
  }catch(err){
    logger.error("modifyCopyrightInfo error.",{
      userId:id,
      copyrightId:copyrightId
    },err);
    return new Promise(reject =>{
      reject(err);
    });
  }
}

UserDao.prototype.buildEmptyCopyright = function(){
  return {
    copyrightId:"",
    workName: "",
    resourcesIpfsHash:"",
    resourcesIpfsDHash:"",
    localUrl:"",
    copyrightAddress:"",
    resourceAddress:"",
  }
}


UserDao.prototype.buildEmptyPurchasedResource = function(){
  return {
    resourceId:"",
    resourceName: "",
    type:"book",
    tokenId:"",
    sellStatus:0,
    sellPrice:"",
    rentOutStatus:0,
    rentPrice:""
  };
}

UserDao.prototype.buildEmptyRentResource = function(){
  return {
    resourceId:"",
    tokenId:"",
    type:"book",
    rentPrice:"",
    rentTime:"",
  };
}

module.exports = new UserDao();
