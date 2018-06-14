export default function (request) {
  return {
    // 获取资源版权信息详情
    getResourceCopyrightDetailById(id) {
      return request({
        url: '/copyright/getResourceCopyrightDetailById',
        method: 'get',
        params: { id }
      }).then(data => data);
    },
    /**
     * 申请资源版权信息
     * @param {*} data { workName, workCategory, samplePath, authors, workProperty, rights, belong }
     */
    apply(data) {
      return request({
        url: '/copyright/apply',
        method: 'post',
        data
      }).then(data => data);
    },
    // 上传样本
    sample(file) {
      return request({
        url: '/copyright/upload/sample',
        method: 'post',
        data: file
      }).then(data => data);
    },
    // 手动审核
    audit(copyrightId) {
      return request({
        url: '/copyright/audit',
        method: 'post',
        data: { copyrightId }
      }).then(data => data);
    }
    // // 发行审核通过的版权信息
    // publish(data) {
    //   return request({
    //     url: '/resource/publish',
    //     method: 'post',
    //     data
    //   }).then(data => data);
    // }
  };
}
