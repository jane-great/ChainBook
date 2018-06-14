import Vue from 'vue';
import Router from 'vue-router';

import Index from 'src/views/Index';
import SecondHand from 'src/views/SecondHand';
import Rent from 'src/views/Rent';
import FirstResource from 'src/views/FirstResource';
import User from 'src/views/User';

Vue.use(Router);

export const routerMap = [
  {
    path: '/',
    name: 'Index',
    component: Index,
    title: '首页'
  },
  {
    path: '/FirstResource',
    name: 'FirstResource',
    component: FirstResource,
    title: '首发资源'
  },
  {
    path: '/SecondHand',
    name: 'SecondHand',
    component: SecondHand,
    title: '二手市场'
  },
  {
    path: '/Rent',
    name: 'Rent',
    component: Rent,
    title: '租赁市场'
  },
  {
    path: '/User',
    name: 'User',
    component: User,
    title: '个人中心',
    visible: false
  }
];

const router =  new Router({
  routes: routerMap
});

router.beforeEach((to, from, next) => {
  const matchPath = routerMap.filter(item => item.path === to.path);
  if (matchPath) {
    document.title = `链书吧-${matchPath[0].title}`;
  } else {
    window.alert('不存在路径');
  }
  
  next();
});

export default router;
