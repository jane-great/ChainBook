var util = require("util");
var User = require("../model/user.js");
var SuperDao = require("./super.js");
var crypto = require('crypto');
var ObjectUtil = require("../utils/objectUtils");
var log4js = require('log4js');
var logger = log4js.getLogger('dao/user');


var UserDao = function () {
  SuperDao.call(this);
  this.model = User;
};

util.inherits(UserDao, SuperDao);

UserDao.prototype.verifyUser = function (userName, password, callback) {
  User.findOne({
    userName: userName,
    pwd: password
  }, function (err, obj) {
    callback(err, obj);
  });
}


UserDao.prototype.update = function (userObj, callback) {
  var id = userObj._id;
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
UserDao.prototype.addCopyRightByUser = async function(account,CopyRightObj){
  try{
    ObjectUtil.notNullAssert(account);
    ObjectUtil.notNullAssert(CopyRightObj);
    
    return new Promise((resolve, reject) => {
      User.update({account:account},{"$push":{"copyright":CopyRightObj}},function(err,updateObj) {
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
UserDao.prototype.addPurchasedResourceByUser = function(account,purchasedResourceObj){
  try{
    ObjectUtil.notNullAssert(account);
    ObjectUtil.notNullAssert(purchasedResourceObj);
    
    return new Promise((resolve, reject) => {
      User.update({account:account},{"$push":{"purchasedResources":purchasedResourceObj}},function(err,updateObj){
        if(err){
          reject(err);
        }else{
          resolve(updateObj);
        }
      });
    });
  }catch(err){
    logger.error("addPurchasedResourceByUser error,id:{}",id,err);
    return new Promise((reject) =>{
      reject(err);
    });
  }
}

/**
 * 添加一条用户租赁资源的记录
 * @param account
 * @param rentResourceObj
 * @returns {*}
 */
UserDao.prototype.addRentResourceByUser = function(account,rentResourceObj){
  try{
    ObjectUtil.notNullAssert(account);
    ObjectUtil.notNullAssert(rentResourceObj);
    
    return new Promise((resolve, reject) => {
      User.update({account:account},{"$push":{"rentResources":rentResourceObj}},function(err,updateObj){
        if(err){
          reject(err);
        }else{
          resolve(updateObj);
        }
      })
    });
  }catch(err){
    logger.error("addRentResourceByUser error,id:{}",id,err);
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
      User.find({_id:id},{copyright:1},function(err,list){
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
 * 登记出售已有的某个资源
 * @param id
 * @param tokenId
 * @param sellStatus 0:不售卖，1：售卖，2：已售卖
 * @returns {*}
 */
UserDao.prototype.modifySellStatus = function(id,tokenId,sellStatus){
  try{
    ObjectUtil.notNullAssert(id);
    ObjectUtil.notNullAssert(tokenId);
    
    return new Promise((resolve,reject) => {
      User.update({'_id':id,'purchasedResources.tokenId':tokenId},
        {$set:{ 'purchasedResources.sellStatus': sellStatus }},function(err,updateObj){
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
  
    return new Promise((resolve,reject) => {
      User.update({'_id':id,'purchasedResources.tokenId':tokenId},
        {$set:{ 'purchasedResources.rentStatus': rentStatus }},function(err,updateObj){
          if(err){
            reject(err);
          }else{
            resolve(updateObj);
          }
        }
      )
    });
  }catch(err){
    logger.error("modifyRentStatus error.id:{},tokenId:{},rentStatus:{}",id,tokenId,rentStatus,err);
    return new Promise(reject =>{
      reject(err);
    });
  }
}



//获取md5加密
function getMD5(password, randomNum) {
  var md5 = crypto.createHash('md5');
  md5.update(password + randomNum);
  return md5.digest('hex');
}

/*产生一个随机数*/
function getRandom() {
  return Math.random().toString(36).substring(7);
}

module.exports = new UserDao();
