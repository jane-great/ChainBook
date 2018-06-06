import Vue from 'vue';
import Router from 'vue-router';
import Index from 'src/views/index/Index';
import Login from 'src/views/login/Login';
import Register from 'src/views/login/Register';
import SecondHand from 'src/views/secondHand/SecondHand';

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
      path: '/Login',
      name: 'Login',
      component: Login
    },
    {
      path: '/Register',
      name: 'Register',
      component: Register
    }
  ]
});
