/* eslint-disable */ 
export default function (request) {
  return {
    // 获取所有首发资源
    getResourceListByPage({ page, pageSize, lastId }) {
      // return request({
      //   url: '/resource/getResourceListByPage',
      //   method: 'post',
      //   data: {
      //     page, pageSize, lastId
      //   }
      // }).then(data => data);
      return Promise.resolve({
        "total": 100,
        "resourceInfoList": [{
          "createDate": "2018-06-06T09:46:25.948Z",
          "updateDate": "2018-06-06T09:46:25.948Z",
          "_id": "5b0f597905373eafe9ceed62",
          "resourceName": "区块链 : 从数字货币到信用社会",
          "desc": "区块链：从数字货币到信用社会》从历史与背景...",
          "total": 10000,
          "coverImage": "https://img3.doubanio.com/view/subject/l/public/s28878146.jpg",
          "price": "10.00",
          "copyrightAddress": "版权合约的地址",
          "resourceAddress": "资源合约的地址",
          "authorAccount": "作者的地址",
          "hasSellOut": 0
        }, {
          "createDate": "2018-06-06T09:46:25.948Z",
          "updateDate": "2018-06-06T09:46:25.948Z",
          "_id": "5b175b0f08585480f53bce38",
          "resourceName": "区块链 : 从数字货币到信用社会",
          "desc": "区块链：从数字货币到信用社会》从历史与背景...",
          "total": 10000,
          "coverImage": "https://img3.doubanio.com/view/subject/l/public/s28878146.jpg",
          "price": "10.00",
          "copyrightAddress": "版权合约的地址",
          "resourceAddress": "资源合约的地址",
          "authorAccount": "作者的地址",
          "hasSellOut": 0
        }, {
          "createDate": "2018-06-06T09:46:25.948Z",
          "updateDate": "2018-06-06T09:46:25.948Z",
          "_id": "5b175b0f08585480f53bce12",
          "resourceName": "区块链 : 从数字货币到信用社会",
          "desc": "区块链：从数字货币到信用社会》从历史与背景...",
          "total": 10000,
          "coverImage": "https://img3.doubanio.com/view/subject/l/public/s28878146.jpg",
          "price": "10.00",
          "copyrightAddress": "版权合约的地址",
          "resourceAddress": "资源合约的地址",
          "authorAccount": "作者的地址",
          "hasSellOut": 0
        }, {
          "createDate": "2018-06-06T09:46:25.948Z",
          "updateDate": "2018-06-06T09:46:25.948Z",
          "_id": "5b175b0f08585480f53bce13",
          "resourceName": "区块链 : 从数字货币到信用社会",
          "desc": "区块链：从数字货币到信用社会》从历史与背景...",
          "total": 10000,
          "coverImage": "https://img3.doubanio.com/view/subject/l/public/s28878146.jpg",
          "price": "10.00",
          "copyrightAddress": "版权合约的地址",
          "resourceAddress": "资源合约的地址",
          "authorAccount": "作者的地址",
          "hasSellOut": 0
        }, {
          "createDate": "2018-06-06T09:46:25.948Z",
          "updateDate": "2018-06-06T09:46:25.948Z",
          "_id": "5b175b0f08585480f53bce14",
          "resourceName": "区块链 : 从数字货币到信用社会",
          "desc": "区块链：从数字货币到信用社会》从历史与背景...",
          "total": 10000,
          "coverImage": "https://img3.doubanio.com/view/subject/l/public/s28878146.jpg",
          "price": "10.00",
          "copyrightAddress": "版权合约的地址",
          "resourceAddress": "资源合约的地址",
          "authorAccount": "作者的地址",
          "hasSellOut": 0
        }, {
          "createDate": "2018-06-06T09:46:25.948Z",
          "updateDate": "2018-06-06T09:46:25.948Z",
          "_id": "5b175b0f08585480f53bce17",
          "resourceName": "区块链 : 从数字货币到信用社会",
          "desc": "区块链：从数字货币到信用社会》从历史与背景...",
          "total": 10000,
          "coverImage": "https://img3.doubanio.com/view/subject/l/public/s28878146.jpg",
          "price": "10.00",
          "copyrightAddress": "版权合约的地址",
          "resourceAddress": "资源合约的地址",
          "authorAccount": "作者的地址",
          "hasSellOut": 0
        }],
        "page": {
          "pageSize": 10,
          "lastId": "5b175b0f08585480f53bce38"
        }
      });
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
        url: '/resource/publish',
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
    // 购买首发资源
    buyFromAuthor(tokenId, resourceId) {
      return request({
        url: '/resource/buyFromAuthor',
        method: 'post',
        data: [
          tokenId,
          resourceId
        ]
      })
    },
    // 购买二手资源
    buy(tokenId, resourceId) {
      return request({
        url: '/resource/buy',
        method: 'post',
        data: {
          tokenId,
          resourceId
        }
      }).then(data => data);
    },
    // 租赁
    rent(tokenId, resourceId) {
      return request({
        url: '/resource/rent',
        method: 'post',
        data: {
          tokenId,
          resourceId
        }
      }).then(data => data);
    }
  };
}
