var express = require('express');
var router = express.Router();
var user = require('./controller/user');
var resourceCopyright = require('./controller/resourceCopyright');
var resourceInfo = require('./controller/resourceInfo');
var helloWorld = require('./controller/helloWorld');
var config = require('./config');
var passport = require("passport");
var auth = require("./controller/auth");

var URL = "/" + config.appName;

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

//和合约交互的例子
router.get(URL+'/helloWorld',auth.isAuthenticated,helloWorld.sayHello);


//用户登录、注册、及获取当前用户
router.post(URL+"/user/register", user.register);
router.post(URL+"/user/localLogin",passport.authenticate('local',{
  session:true,
  successRedirect: URL+"/home",
  failureRedirect: URL+"/home"
}));
router.get(URL+"/user/renderUser", user.getCurrentUserInfo);

//用户个人管理
router.get(URL+"/user/getCopyRightsByUser",user.getCopyRightsByUser);
router.get(URL+"/user/getPurchasedResourcesByUser",user.getPurchasedResourcesByUser);
router.get(URL+"/user/getRentResourcesByUser",user.getRentResourcesByUser);
router.get(URL+"/user/sell",user.sell);
router.get(URL+"/user/rentOut",user.rentOut);

//TODO:获取所有可以二次售卖的图书，分页和查询
//TODO:获取所有可以租赁的图书，分页和查询
//TODO:获取所有首发图书，分页和查询


//版权
router.post(URL+"/copyright/apply",resourceCopyright.applyCopyright);
router.put(URL+"/copyright/upload/sample",resourceCopyright.uploadSample);
router.get(URL+"/copyright/getResourceCopyrightDetailById",resourceCopyright.getResourceCopyrightDetailById);

//资源信息
router.post(URL+"/resource/publish",resourceInfo.publishResource);
router.put(URL+"/resource/uploadCoverImg",resourceInfo.uploadCoverImg);
router.get(URL+"/resource/getResourceDetailById",resourceInfo.getResourceDetailById);
router.get(URL+"/resource/buy",resourceInfo.buy);
router.get(URL+"/resource/rent",resourceInfo.rent);

module.exports = router;
