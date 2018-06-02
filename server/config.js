/**
 *
 * App配置文件读取
 */
function getRootPath() {
  var breakIndex = __dirname.lastIndexOf('server');
  if (breakIndex > 0) {
    return __dirname.substring(0, breakIndex - 1);
  }
  
  return __dirname;
}
//应用主目录
var path = getRootPath();

//配置文件,优先从环境变量读取
var configPath = process.env.DR_CONFIG ? process.env.DR_CONFIG : path + '/config/chainbook_config.json';

var config = require('config.json')(configPath);

//app名称,反应到url中
config.appName = 'ChainBook';

//应用的日志配置
var log = {
  level: "INFO",
  file: "chainbook.log",
  maxLogSize: 1024 * 1024 * 10,//日志文件最大为10m
  backups: 5
}
config.log = log;

//TODO 从外部配置文件读取
var contract = {
  url:"http://localhost:7545"
}
config.contract = contract;

module.exports = config;
