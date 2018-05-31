var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'debug';



//debug
EVENT.ENTER_FUNCTION = "enter function";

log4js.configure({
  appenders: [
    {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: "[%d{ISO8601}][%p][%x{pid}][%c] >>>%m",
        tokens: {
          "pid": function () {
            return process.pid;
          }
        }
      }
    },
    {
      type: 'file',
      filename: config.log.file,//文件的配置路径
      //日志文件大小10m
      maxLogSize: config.log.maxLogSize,
      backups: config.log.backups,
      layout: {
        type: 'pattern',
        pattern: "[%d{ISO8601}][%p][%x{pid}][%c] >>>%m",
        tokens: {
          "pid": function () {
            return process.pid;
          }
        }
      }
    }
  ],
  
  replaceConsole: true
});

function Logger(filepath) {
  var category;
  if (filepath == undefined || filepath.replace == undefined) {
    category = 'common';
  } else {
    category = filepath.replace(/.*([\/\\]server)+/, "");
  }
  this._logger = log4js.getLogger(category);
  this._logger.setLevel(config.log.level);
}

Logger.prototype.debug = function (eventName, msg, json) {
  var _self = this;
  _self._logger.debug(splice(eventName, msg, json));
}

Logger.prototype.warn = function (eventName, msg, json) {
  var _self = this;
  _self._logger.warn(splice(eventName, msg, json));
}

Logger.prototype.info = function (eventName, msg, json) {
  var _self = this;
  _self._logger.info(splice(eventName, msg, json));
}

Logger.prototype.error = function (eventName, msg, json) {
  var _self = this;
  _self._logger.error(splice(eventName, msg, json));
}

Logger.prototype.isDebugEnabled = function () {
  var _self = this;
  return _self._logger.isDebugEnabled();
}

Logger.prototype.isInfoEnabled = function () {
  var _self = this;
  return _self._logger.isInfoEnabled();
}

Logger.prototype.isWarnEnabled = function () {
  var _self = this;
  return _self._logger.isWarnEnabled();
}


function splice(eventName, msg, json) {
  
  var c = "[" + eventName + "]";
  if (json) {
    //TODO:判断json的类型
    c += " json=" + JSON.stringify(json);
  }
  if (msg) {
    c += " msg=" + msg;
  }
  return c;
}

module.exports = exports = function (filepath) {
  return new Logger(filepath);
};

exports.EVENT = EVENT;

