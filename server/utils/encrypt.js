const crypto = require('crypto');

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

exports.getMD5 = getMD5;
exports.getRandom = getRandom;
