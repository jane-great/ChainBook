/**
 * Created by jane.zhang on 2016/1/4.
 */
var util = require("util");

var isEmptyObject = function (obj) {
  if (util.isObject(obj)) {
    for (var name in obj) {
      if (obj[name]) return false;
    }
    return true;
  }
  return false;
}

var toRegex = function (obj) {
  var option = obj;
  for (item in obj) {
    if (obj[item] != undefined) {
      option[item] = new RegExp(obj[item]);
    }
  }
  return option;
}

/**
 * 数组去重。
 * @param array
 * @returns {Array}
 */
var uniqueArray = function (array) {
  var n = [];//临时数组
  for (var i = 0; i < array.length; i++) {
    if (n.indexOf(array[i]) == -1) n.push(array[i]);
  }
  return n;
}
/**
 * 参数为空断言
 * @param param
 * @returns {Error}
 */
var notNullAssert = function(param) {
  if(param == null || param == undefined ){
    throw new Error("param is not null or undefined");
  }
}

var notEmptyObjectAssert = function(obj) {
  if(obj == undefined || obj == null || util.isEmpty(obj)){
    throw new Error("obj is empty");
  }
}
exports.isEmptyObject = isEmptyObject;
exports.toRegex = toRegex;
exports.uniqueArray = uniqueArray;
exports.notNullAssert = notNullAssert;
exports.notEmptyObjectAssert = notEmptyObjectAssert;

