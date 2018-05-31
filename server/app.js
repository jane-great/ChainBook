var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var log4js = require('log4js');
var mainRouter = require('./route');
var config = require('./config');
var mongoose = require("mongoose");

//日志配置 TODO 优化和文件绑定
log4js.configure({
  appenders: {
    out: { type: 'console' },
    chainbook: { type: 'dateFile', filename: 'chainbook.log', alwaysIncludePattern:true },
  },
  categories: {
    default: { appenders: ['out','chainbook'], level: 'INFO'}
  }
});

var logger = log4js.getLogger();

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 访问静态资源
app.use(express.static(path.join(__dirname, '../dist')));

// 路由的配置需要放置在前面,且使用根目录路由
app.use('/', mainRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  logger.error(err);

  // render the error page
  res.status(err.status || 500);
  res.send(err);
});


//mongoose config
var dbOption = {
  db: {
    native_parser: true
  },
  server: {poolSize: config.db.poolSize},
  user: config.db.userName,
  pass: config.db.password
}

mongoose.connect(config.db.uri, dbOption);

mongoose.connection.on('connected', function () {
  logger.info("DB connected", "success to connect DB", {"url:": config.db.uri});
});

mongoose.connection.on('error', function (err) {
  logger.error("DB connected error", 'DB connected failed', {"url": config.db.uri, "err:": err});
});

mongoose.connection.on('disconnected', function () {
  logger.info('DB disconnected', "success to close DB connection", {"url": config.db.uri});
});
process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    logger.info('DB disconnected', "disconnected while app stopped", {"url": config.db.uri});
    process.exit(0);
  });
});

module.exports = app;

