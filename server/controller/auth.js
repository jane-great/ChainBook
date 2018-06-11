module.exports = {
  /**
   * 登陆权限验证
   */
  isAuthenticated: function (req, res, next) {
    if(req.isAuthenticated()) {
      return next();
    }else{
      res.send({status:10000,msg:"请先登录"});
    }
  }
};
