export default function (request) {
  return {
    getCommon() {
      return request({ url: 'src/mock/base/test.json' }).then(({ data }) => data);
    },
    getContent() {
      return request({
        url: '/api/openapi/BaikeLemmaCardApi',
        method: 'get',
        params: {
          scope: 103,
          format: 'json',
          appid: 379020,
          bk_key: '银魂',
          bk_length: 600
        }
      }).then(data => data);
    }
  };
}
