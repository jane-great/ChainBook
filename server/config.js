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
const path = getRootPath();

//配置文件,优先从环境变量读取
const configPath = process.env.DR_CONFIG ? process.env.DR_CONFIG : path + '/chainbook_config.json';

const config = require('config.json')(configPath);

config.appName = 'ChainBook';
config.log = {
  level: "INFO",
  file: "chainbook.log",
  maxLogSize: 1024 * 1024 * 10,//日志文件最大为10m
  backups: 5
};
/*//合约相关
config.contract = {
  url:config.contract.url
};
//迅雷相关配置
config.thunder = {
  baseURL:config.thunder.baseURL
};*/


module.exports = config;
