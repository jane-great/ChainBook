/**
 * 迅雷api交互模块
 */
const axios = require('axios')
const config = require('../config');
const log4js = require('log4js');
const logger = log4js.getLogger("utils/thunder");

//创建一个axios实例
const instance = axios.create({
  baseURL: config.thunder.baseURL,
  timeout: 1000,
  headers: {'X-Custom-Header': 'foobar'}
});

const register = function(email) {
  return instance.post('/api/linktest/regist',{
    email:email
  });
}


exports.register = register;
