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

//版权
router.post(URL+"/copyright/apply",auth.isAuthenticated,resourceCopyright.applyCopyright);
router.post(URL+"/copyright/upload/sample",auth.isAuthenticated,resourceCopyright.uploadSample);
router.get(URL+"/copyright/getResourceCopyrightDetailById",resourceCopyright.getResourceCopyrightDetailById);

//资源信息
router.post(URL+"/resource/publish",auth.isAuthenticated,auth.isAuthenticated,resourceInfo.publishResource);
router.post(URL+"/resource/upload/coverImg",auth.isAuthenticated,resourceInfo.uploadCoverImg);
//测试上传用
/*router.get(URL+'/form',function(req, res, next) {
  fs.readFile('dist/testUploadImage.html', {encoding: 'utf8'},function(err,data) {
    res.send(data);
  });
});*/
router.get(URL+"/resource/getResourceDetailById",resourceInfo.getResourceDetailById);
router.post(URL+"/resource/getResourceListByPage",resourceInfo.getResourceListByPage);
router.post(URL+"/resource/getPurchasedResourceListByPage",resourceInfo.getPurchasedResourceListByPage);
router.post(URL+"/resource/getTenantableResourceListByPage",resourceInfo.getTenantableResourceListByPage);
router.get(URL+"/resource/getPurchasedResourceOwnerListById",resourceInfo.getPurchasedResourceOwnerListById);
router.get(URL+"/resource/getTenantableResourceOwnerListById",resourceInfo.getTenantableResourceOwnerListById);
router.post(URL+"/resource/buy",auth.isAuthenticated,resourceInfo.buy);
router.post(URL+"/resource/rent",auth.isAuthenticated,resourceInfo.rent);
module.exports = router;
