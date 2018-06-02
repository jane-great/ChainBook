module.exports = {
  /**
   * 登陆权限验证
   */
  isAuthenticated: function (req, res, next) {
    if(req.isAuthenticated()) {
      return next();
    }else{
      res.redirect('/ChainBook/login');
    }
  }
};
