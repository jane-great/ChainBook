var createError = require('http-errors');
var express = require('express');
var fs = require('fs');
var path = require('path');
var cookieParser = require('cookie-parser');
var log4js = require('log4js');
var mainRouter = require('./route');
var config = require('./config');
var mongoose = require("mongoose");
var passport = require('passport');
var LocalStrategy = require("passport-local").Strategy;
var userDao = require("./dao/user");
const resolve = file=>path.resolve(__dirname, file);

passport.use(new LocalStrategy({
  usernameField: 'userName',
  passwordField: 'pwd'
},function(userName,password,done) {
  //校验用户名密码是否正确
  userDao.verifyUser(userName,password,function(err,data) {
    if(err){
      logger.error("passport verify fail.",{
        userName: userName,
        password: password
      },err);
      done(err);
    } else {
      logger.info("passport verify success:",{
        userName: userName,
        password: password
      });
      //TODO 需要将session序列化存储在服务器录，记录用户的登录状态
      done(null,data);
    }
  });
}));

passport.serializeUser(function (user,done){
  done(null,user._id);
});

passport.deserializeUser(function (id, done) {
  userDao.findById(id,function(err,user){
    done(null, user);
  });
});

//日志配置
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

app.get('*', function (req, res, next) {
  if(req.originalUrl.indexOf('/user')!=0 || req.originalUrl.indexOf('/copyright')!=0 || req.originalUrl.indexOf('/resource')!=0) {
    const html = fs.readFileSync(resolve('../dist/index.html'), 'utf-8');
    res.send(html);
  }else{
    next();
  }
});

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

