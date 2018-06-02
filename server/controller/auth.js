module.exports = {
  /**
   * 登陆权限验证
   */
  isAuthenticated: function (req, res, next) {
    if(req.isAuthenticated()) {
      return next();
    }else{
      //req.flash(config.constant.flash.error, '请先登录!');
      res.redirect('ChainBook/login')
    }
  }
};
