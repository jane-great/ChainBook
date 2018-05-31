var util = require("util");
var User = require("../model/user.js");
var SuperDao = require("./super.js");
var crypto = require('crypto');


var UserDao = function () {
  SuperDao.call(this);
  this.model = User;
};


util.inherits(UserDao, SuperDao);

UserDao.prototype.findByName = function (userName, callback) {
  var op = {userName: userName};
  this.findOne(op, function (err, obj) {
    callback(err, obj);
  });
}

UserDao.prototype.findByNameStatus = function (userName, status, callback) {
  var op = {userName: userName, status: status};
  this.findOne(op, function (err, obj) {
    callback(err, obj);
  });
}

/*初始化*/
UserDao.prototype.initUser = function (userObj, callback) {
  var randomNum = getRandom();
  userObj['randomNum'] = randomNum;
  userObj['password'] = getMD5(userObj.password, randomNum);

  var instance = new user(userObj); // entity
  User.find({userName: userObj["userName"]}, {_id: 1}, function (err, Ids) {
    if (!err) {
      //instance["userName"] += new Date().toLocaleString();
      if (logger.isDebugEnabled()) {
        logger.debug("init user", userObj["userName"] + " is exists,remove it fist.");
      }
      User.remove({_id: {$in: Ids}}, function (err) {
      });
    }
    instance.save(function (err) {
      callback(err);
    });
  });
}


//找出含有某roleCode的user
UserDao.prototype.findByRoleCode = function (roleCode, callback) {
  User.find({roles: {$in: [roleCode]}}, function (err, list) {
    callback(err, list);
  });
}

UserDao.prototype.verifyUser = function (userName, password, callback) {
  User.findOne({
    userName: userName,
    pwd: password
  }, function (err, obj) {
    callback(err, obj);
  });
}

UserDao.prototype.findOneByParams = function (params, callback) {
  if (typeof params == 'undefined') {
    params = {};
  }
  User.findOne(params, function (err, user) {
    callback(err, user);
  });
}

/*

 UserDao.prototype.deleteById = function (userId, callback) {
 User.remove({'_id': userId}, function (err, deletedUser) {
 callback(err, deletedUser);
 });
 }*/

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

UserDao.prototype.addRoles = function (userName, roleCodes, callback) {
  User.update({'userName': userName}, {'roles': roleCodes, 'updateDate': new Date()}, function (err) {
    callback(err);
  });
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
