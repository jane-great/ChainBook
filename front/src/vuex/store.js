import Vue from 'vue';
import Vuex from 'vuex';
import plugins from './plugins';

import ui from './modules/ui';
// import base from './modules/base';

import {
  pushLoading,
  popLoading
} from './actions/ui';

Vue.use(Vuex);
Vue.config.debug = true;

const debug = process.env.NODE_ENV !== 'production';

const store = new Vuex.Store({
  modules: {
    ui
    // base
  },
  strict: debug,
  plugins: [plugins]
});

Vue.use((Vue) => {
  Vue.prototype.$pushLoading = () => pushLoading(store);
  Vue.prototype.$popLoading = () => popLoading(store);
});

function wrapApi(vm, obj) {
  /* eslint-disable */
  const api = {};
  Object.keys(obj).forEach((key) => {
    switch (typeof obj[key]) {
      case 'object':
        api[key] = wrapApi(vm, obj[key]);
        return;
      case 'function': {
        api[key] = (...apiArgs) => new Promise((resolve, reject) => {
          obj[key].apply(obj, apiArgs).then((...resolvedArgs) => {
            if (!vm._isDestroyed) {
              resolve.apply(null, resolvedArgs);
            }
          }).catch(reject);
        });
        return;
      }
      default:
    }
  });
  return api;
  /* eslint-enable */
}

Vue.mixin({
  created() {
    let wrapped;
    const vm = this;
    /**
     * 异步回调可能会在 vm 销毁后才被调用（如切换页面后），此时 vm 的 computed 变量
     * 被置为 null，使用到 computed 的变量的回调在 vm 被销毁后调用时可能会抛错。
     *
     * 为了避免这种抛错，应该在 vm 销毁前判断取消回调 或 调用回调前判断 vm 是否被销毁。
     *
     * 可能用到了异步回调的地方：
     *   - setTimeout / setInterval
     *       应在 beforeDestroy 的 hook 中 cancel 掉
     *   - EventListener.listen 等注册
     *       应有对应的 remove 方法并在 beforeDestroy 中调用
     *   - 一个异步调用的调用栈很深且其中的参数有函数
     *       自求多福
     *   - $api 请求
     *       resolve 前判断 vm 是否已销毁
     *
     * 为了避免修改大量已有代码，这里对 $api 用 Promise 包装
     * 若 $api 请求 resolve 后 vm 已销毁，则该 Promise 不 resolve
     */
    Object.defineProperty(this, '$api', {
      /**
       * 仅在 vm 第一次获取 $api 时才包装，否则初始化一个页面会多耗时 30ms
       */
      get() {
        if (wrapped) return wrapped;
        wrapped = wrapApi(vm, store.api);
        return wrapped;
      }
    });
  }
});

export { store, Vue };
