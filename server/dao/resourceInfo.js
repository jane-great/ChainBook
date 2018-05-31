var util = require("util");
var User = require("../model/resourceInfo.js");
var SuperDao = require("./super.js");


var ResourceInfoDao = function () {
  SuperDao.call(this);
  this.model = User;
};


util.inherits(ResourceInfoDao, SuperDao);

ResourceInfoDao.prototype.findByName = function (userName, callback) {
  var op = {userName: userName};
  this.findOne(op, function (err, obj) {
    callback(err, obj);
  });
}

ResourceInfoDao.prototype.findByNameStatus = function (userName, status, callback) {
  var op = {userName: userName, status: status};
  this.findOne(op, function (err, obj) {
    callback(err, obj);
  });
}

/*初始化*/
module.exports = new ResourceInfoDao();
