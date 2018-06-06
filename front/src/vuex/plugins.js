import axios from 'axios';
import qs from 'qs';

import {
  pushLoading,
  popLoading
} from 'src/vuex/actions/ui';

import baseAPI from 'src/apis/base';

function getRequestInstance(store) {
  const instance = axios.create();

  // 发送请求前，对 request object 做处理
  instance.interceptors.request.use((config) => {
    if (!config.hideLoading) pushLoading(store);
    const headers = {};

    // 后端不支持 json 格式的 data，需要将 json 格式转为 x-www-form-urlencoded
    if (typeof config.data === 'object' && !(config.data instanceof FormData)) {
      config.data = qs.stringify(config.data);
      Object.assign(headers, { 'Content-Type': 'application/x-www-form-urlencoded' });
    }

    // 添加 csrftoken 和 _t
    // TODO 验证 POST 请求时 csrftoken 加在 params 中是否有效
    if (!config.params) {
      config.params = {};
    }
    Object.assign(config.params, window.phpData, { _t: Date.now() });

    // 添加 X-Requested-With
    Object.assign(headers, { 'X-Requested-With': 'XMLHttpRequest' });

    return Object.assign(config, { headers });
  });

  // 收到回复后对 response 做处理
  instance.interceptors.response.use((response) => {
    console.log(response);
    if (!response.config.hideLoading) popLoading(store);

    switch (response.data.code) {
      // 特殊的错误处理
      case -1: // 系统关闭
        if (window.location.hash.substring(3).split('/')[0] !== 'admin') {
          window.location.href = '/upgrade.html';
        }
        return Promise.reject();
      case 2001: // CSRF token 过期
      case -9999: // 登录超时
        return Promise.reject('登录超时，请刷新页面');

      // 正常情况
      case 0:
        return Promise.resolve({
          code: response.data.code,
          data: response.data.data,
          message: response.data.message,
          config: response.config,
          response
        });

      // 其他错误
      default:
        // 抛出完整的 response
        if (response.config.expectRawError) {
          return Promise.reject({
            code: response.data.code,
            message: response.data.message,
            response
          });
        }
        // 仅抛出 message
        return Promise.reject(response.data.message);
    }
  }, (error) => {
    if (!error.response.config.hideLoading) popLoading(store);
    return Promise.reject(`与服务器通信遇到了问题（${error.message}）`);
  });

  return instance;
}

export default function plugins(store) {
  const axios = getRequestInstance(store);
  // 参数见 https://github.com/mzabriskie/axios#instance-methods
  store.api = Object.assign(
    {},
    baseAPI(axios.request),
    { base: baseAPI(axios.request) }
  );
  store.ajax = axios;
}