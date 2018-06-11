// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import BootstrapVue from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import login from  './components/Login'
import reg from './components/Reg.vue'

Vue.config.productionTip = false

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.use(BootstrapVue);

//routes config
const routes=[
  {path:'/ChainBook/', redirect:'/home'},
  {path:'/ChainBook/login', component: login, name:'login'},
  {path:'/ChainBook/reg', component: reg, name:'reg'},
];

//genartor VueRouter object
const router=new VueRouter({
  mode: 'history',
  routes
});

//bind and render
const app = new Vue({
  router,
  render: h=>h(App)
}).$mount('#app');
