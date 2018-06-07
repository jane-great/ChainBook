export default function (request) {
  return {
    getCommon() {
      return request({ url: 'src/mock/base/test.json' }).then(({ data }) => data);
    },
    getForText() {
      return Promise.resolve({});
    }
  };
}
