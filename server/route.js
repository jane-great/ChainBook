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

//和合约交互的例子
router.get(URL+'/helloWorld',auth.isAuthenticated,helloWorld.sayHello);


//用户登录、注册、及获取当前用户
router.post(URL+"/user/register", user.register);
router.post(URL+"/user/localLogin",passport.authenticate('local',{
  session:true,
  failureFlash: true
}),user.login);

router.post(URL+"/user/localLogout",auth.isAuthenticated,user.logout);
router.get(URL+"/user/renderUser",auth.isAuthenticated, user.getCurrentUserInfo);

//用户个人管理
router.get(URL+"/user/getCopyRightsByUser",auth.isAuthenticated,user.getCopyRightsByUser);
router.get(URL+"/user/getPurchasedResourcesByUser",auth.isAuthenticated,user.getPurchasedResourcesByUser);
router.get(URL+"/user/getRentResourcesByUser",auth.isAuthenticated,user.getRentResourcesByUser);
router.get(URL+"/user/purchasedResources/sell",auth.isAuthenticated,user.sell);
router.get(URL+"/user/purchasedResource/rentOut",auth.isAuthenticated,user.rentOut);

//TODO:获取所有可以二次售卖的图书，分页和查询
//TODO:获取所有可以租赁的图书，分页和查询
//TODO:获取所有首发图书，分页和查询

//版权
router.post(URL+"/copyright/apply",auth.isAuthenticated,resourceCopyright.applyCopyright);
router.put(URL+"/copyright/upload/sample",auth.isAuthenticated,resourceCopyright.uploadSample);
router.get(URL+"/copyright/getResourceCopyrightDetailById",auth.isAuthenticated,resourceCopyright.getResourceCopyrightDetailById);

//资源信息
router.post(URL+"/resource/publish",auth.isAuthenticated,auth.isAuthenticated,resourceInfo.publishResource);
router.put(URL+"/resource/uploadCoverImg",auth.isAuthenticated,resourceInfo.uploadCoverImg);
router.get(URL+"/resource/getResourceDetailById",auth.isAuthenticated,resourceInfo.getResourceDetailById);
router.get(URL+"/resource/buy",auth.isAuthenticated,resourceInfo.buy);
router.get(URL+"/resource/rent",auth.isAuthenticated,resourceInfo.rent);

module.exports = router;
