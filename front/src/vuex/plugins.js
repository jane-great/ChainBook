import axios from 'axios';
import { Loading } from 'element-ui';

import baseAPI from 'src/apis/base';
import userAPI from 'src/apis/user';
import resourceAPI from 'src/apis/resource';
import copyrightAPI from 'src/apis/copyright';

let loadingInstance = null;
function getRequestInstance() {
  const instance = axios.create();

  // 发送请求前，对 request object 做处理
  instance.interceptors.request.use((config) => {
    loadingInstance = Loading.service({
      fullscreen: true
    });
    const headers = {};

    // 给 config.url 添加上baseUrl
    config.url = `/ChainBook${config.url}`;

    Object.assign(headers, { 'Content-Type': 'application/json' });

    // 添加 csrftoken 和 _t
    // TODO 验证 POST 请求时 csrftoken 加在 params 中是否有效
    if (!config.params) {
      config.params = {};
    }
    Object.assign(config.params, { _t: Date.now() });

    // 添加 X-Requested-With
    Object.assign(headers, { 'X-Requested-With': 'XMLHttpRequest' });

    return Object.assign(config, { headers });
  });

  // 收到回复后对 response 做处理
  instance.interceptors.response.use((response) => {
    loadingInstance.close();

    switch (response.data.status) {
      // 特殊的错误处理
      case -1: // 系统关闭
        if (window.location.hash.substring(3).split('/')[0] !== 'admin') {
          window.location.href = '/upgrade.html';
        }
        return Promise.reject();
      case -9999: // 登录超时
        return Promise.reject('登录超时，请刷新页面');

      // 正常情况
      case 1:
        return Promise.resolve({
          status: response.data.code,
          data: response.data.data,
          msg: response.data.message,
          config: response.config,
          response
        });

      // 其他错误
      default:
        // 抛出完整的 response
        if (response.config.expectRawError) {
          return Promise.reject({
            status: response.data.code,
            msg: response.data.msg,
            response
          });
        }
        // 仅抛出 message
        return Promise.reject(response.data.msg);
    }
  }, (error) => {
    loadingInstance.close();
    return Promise.reject(`与服务器通信遇到了问题（${error.msg}）`);
  });

  return instance;
}

export default function plugins(store) {
  const axios = getRequestInstance(store);
  // 参数见 https://github.com/mzabriskie/axios#instance-methods
  store.api = Object.assign(
    {},
    baseAPI(axios.request),
    { base: baseAPI(axios.request) },
    { user: userAPI(axios.request) },
    { resource: resourceAPI(axios.request) },
    { copyright: copyrightAPI(axios.request) }
  );
  store.ajax = axios;
}
