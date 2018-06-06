// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import { sync } from 'vuex-router-sync';

import { store, Vue } from './vuex/store';

import App from './App.vue';
import Element from 'element-ui'; // eslint-disable-line
import 'element-ui/lib/theme-chalk/index.css'; // eslint-disable-line

import router from './router';

Vue.config.productionTip = false;

sync(store, router);
Vue.use(Element);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});
