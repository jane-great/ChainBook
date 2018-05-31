var util = require("util");
var User = require("../model/resourceCopyright");
var SuperDao = require("./super");


var ResourceCopyrightDao = function () {
  SuperDao.call(this);
  this.model = User;
};

util.inherits(ResourceCopyrightDao, SuperDao);

ResourceCopyrightDao.prototype.findByName = function (userName, callback) {
  var op = {userName: userName};
  this.findOne(op, function (err, obj) {
    callback(err, obj);
  });
}

ResourceCopyrightDao.prototype.findByNameStatus = function (userName, status, callback) {
  var op = {userName: userName, status: status};
  this.findOne(op, function (err, obj) {
    callback(err, obj);
  });
}

/*初始化*/
module.exports = new ResourceCopyrightDao();
