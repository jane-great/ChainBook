import Vue from 'vue';
import Router from 'vue-router';

import Index from 'src/views/Index';
import SecondHand from 'src/views/SecondHand';
import Rent from 'src/views/Rent';
import FirstResource from 'src/views/FirstResource';
import User from 'src/views/User';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '/SecondHand',
      name: 'SecondHand',
      component: SecondHand
    },
    {
      path: '/User',
      name: 'User',
      component: User
    },
    {
      path: '/FirstResource',
      name: FirstResource,
      component: FirstResource
    },
    {
      path: '/Rent',
      name: Rent,
      component: Rent
    }
  ]
});
