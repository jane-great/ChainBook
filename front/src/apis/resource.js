export default function (request) {
  return {
    // 获取所有首发资源
    getResourceListByPage(page, pageSize, lastId) {
      return request({
        url: '/resource/getResourceListByPage',
        method: 'post',
        data: {
          page, pageSize, lastId
        }
      }).then(data => data);
    },
    // 获取所有二手买卖资源列表
    getPurchasedResourceListByPage(page, pageSize, lastId) {
      return request({
        url: '/resource/getPurchasedResourceListByPage',
        method: 'post',
        data: {
          page, pageSize, lastId
        }
      }).then(data => data);
    },
    // 获取所有可租赁资源列表
    getTenantableResourceListByPage(page, pageSize, lastId) {
      return request({
        url: '/resource/getTenantableResourceListByPage',
        method: 'post',
        data: {
          page, pageSize, lastId
        }
      }).then(data => data);
    },
    // 根据id获取当前资源二手买卖的owners信息
    getPurchasedResourceOwnerListById(id) {
      return request({
        url: '/resource/getPurchasedResourceOwnerListById',
        method: 'get',
        data: { id }
      }).then(data => data);
    },
    // 根据id获取当前租赁者买卖的owners信息
    getTenantableResourceOwnerListById(id) {
      return request({
        url: '/resource/getTenantableResourceOwnerListById',
        method: 'get',
        data: { id }
      }).then(data => data);
    },
    // 获取资源信息详情
    getResourceDetailById(id) {
      return request({
        url: '/resource/getResourceDetailById',
        method: 'get',
        data: { id }
      }).then(data => data);
    },
    // 发行审核通过的版权
    publish(data) {
      return request({
        url: 'copyrightId',
        method: 'post',
        data
      }).then(data => data);
    },
    // 上传封面图片
    coverImg(data) {
      return request({
        url: '/resource/upload/coverImg',
        method: 'post',
        data
      }).then(data => data);
    },
    // 购买
    buy(tokenId) {
      return request({
        url: '/resource/buy',
        method: 'post',
        data: {
          tokenId
        }
      }).then(data => data);
    },
    // 租赁
    rent(tokenId) {
      return request({
        url: '/resource/rent',
        method: 'post',
        data: {
          tokenId
        }
      }).then(data => data);
    }
  };
}
