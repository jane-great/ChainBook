export default function (request) {
  return {
    // 登录
    localLogin({ userName, pwd }) {
      return request({
        url: '/user/localLogin',
        method: 'post',
        params: {
          userName,
          pwd
        }
      }).then(data => data);
    },
    // 注销
    localLogout() {
      return request({
        url: '/user/localLogout',
        method: 'post'
      }).then(data => data);
    },
    // 注册
    register({ 
      userName, pwd, email, mobile 
    }) {
      return request({
        url: '/user/register',
        method: 'post',
        data: { 
          userName, pwd, email, mobile 
        }
      }).then(data => data);
    },
    // 获取当前用户登记的版权列表
    getCopyRightsByUser() {
      // return Promise.resolve({"status":1,"msg":"success","data":[{"_id":"5b0e778305373eafe9ceed5f","copyright":[{"copyrightId":"5b0e792605373eafe9ceed61","workName":"链书设计大全","resourcesIpfsHash":"0x7cF2baAe306B1B0476843De3909097be0E6850f3","resourcesIpfsDHash":"0x7cF2baAe306B1B0476843De3909097be0E6850f3","localUrl":"http://localhost:3000/ChainBook/login?userName=admin&pwd=admin","copyrightAddress":"版权合约的地址","resourcesAddress":"资源合约地址"}]}]}); // eslint-disable
      return request({
        url: '/user/getCopyRightsByUser',
        method: 'get'
      }).then(data => data);
    },
    // 获取当前用户购买资源列表
    getPurchasedResourcesByUser() {
      return request({
        url: '/user/getPurchasedResourcesByUser',
        method: 'get'
      }).then(data => data);
    },
    // 获取当前用户租赁资源列表
    getRentResourcesByUser() {
      return request({
        url: '/user/getRentResourcesByUser',
        method: 'get'
      }).then(data => data);
    },
    purchasedResources: {
      // 出售当前的已购买的图书
      sell(tokenId, sellPrice) {
        return request({
          url: '/user/purchasedResources/sell',
          method: 'post',
          data: {
            tokenId, sellPrice
          }
        }).then(data => data);
      },
      // 租赁当前的已购买的图书
      rentOut(tokenId, rentPrice) {
        return request({
          url: '/user/purchasedResource/rentOut',
          method: 'post',
          data: {
            tokenId, rentPrice
          }
        }).then(data => data);
      }
    }
  };
}
