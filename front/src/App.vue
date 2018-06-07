<template>
  <div id="app" class="app">
    <header class="header">
      <div class="logo-line">
        <router-link to="/">
          <img src="~/assets/images/logo.png" class="logo"/>
        </router-link>
        <span class="logo-font">链书吧</span>
        <!-- <div class="sign-font">2018迅雷全球区块链应用大赛</div> -->
        <div class="login-info">
          <!-- <span><router-link to="/Login">登录</router-link></span>
          <span><router-link to="/Register">注册</router-link></span> -->
          <span class="text-href" @click="handleOpenLoginModal(2)">登录</span>
          <span class="text-href" @click="handleOpenLoginModal(1)">注册</span>
        </div>
      </div>
      <nav class="navigation">
        <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal">
          <template v-for="(nav, navIndex) in navList">
            <el-menu-item :index="nav.index">
              <router-link :to="nav.link">{{ nav.name }}</router-link>
            </el-menu-item>
          </template>
        </el-menu>
      </nav>
    </header>

    <div class="container">
      <router-view />
    </div>

    <footer class="footer">
      <p>
        <a href="#">微博</a> | 
        <a href="#">合作</a> | 
        <a href="#">联系</a> | 
        <a href="#">反馈</a>
      </p>
      <p>Copyright © 链书吧团队,ALL Right Reserved</p>
    </footer>

    <login-modal :visible="loginModal.visible"
      :type="loginModal.type"
      :data="loginModal.data"
      :confirm-fn="handleLoginConfirm"
      :cancel-fn="handleLoginCancel">
    </login-modal>
  </div>
</template>

<script>
import LoginModal from 'components/login/LoginModal';

export default {
  name: 'App',
  components: {
    LoginModal
  },
  data() {
    return {
      activeIndex: '1',
      navList: [{
        name: '首页',
        link: '/',
        index: '1'
      }, {
        name: '图书购买',
        link: '/',
        index: '2'
      }, {
        name: '图书租赁',
        link: '/',
        index: '3'
      }, {
        name: '二手市场',
        link: '/SecondHand',
        index: '4'
      }, {
        name: '个人管理',
        link: '/User',
        index: '5'
      }],
      loginModal: {
        visible: false,
        type: 1,
        data: {
          username: '',
          pass: '',
          checkPass: ''
        }
      }
    };
  },
  mounted() {
    // this.$message({
    //   message: '恭喜你，这是一条成功消息',
    //   type: 'success'
    // });
    console.log('ready');
    // this.$api.resource.getResourceDetailById('5b18002108585480f53bce3b').then((data) => {
    //   console.log(data);
    // });
    this.$api.base.getForText().then(() => {});
  },
  methods: {
    handleOpenLoginModal(type) {
      Object.assign(this.loginModal, {
        visible: true,
        type
      });
    },
    handleLoginConfirm() {
      this.loginModal.visible = false;
    },
    handleLoginCancel() {
      this.loginModal.visible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
@import '~assets/scss/base.scss';
.app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 20px;
}
body {
  background-image: url('~/assets/images/bg.jpg');
}
.header {
  margin: 0 auto; 
  width: 1200px;
  line-height: 2em;
  border-radius: 5px;
  overflow: hidden;
  .logo-line {
    .logo {
      float: left;
    }
    .logo-font {
      font-size: 50px;
      font-weight: bold;
      float: left;
      color: #f8e461;
      margin: 8px 0 0 15px;
    }
    .sign-font {
      float: left;
      margin: 6px 0 0 40px;
    }
  }
  .navigation {
    clear: both;
    .el-menu-item {
      width: 100px;
      text-align: center;
    }
  }
  .login-info {
    float: right;
    .text-href {
      cursor: pointer;
    }
  }
}
.container {
  margin: 0 auto;
  width: 1200px;
  margin-top: 15px;
  min-height: 750px;
}
.footer {
  margin: 0 auto; 
	height: 70px; 
	width: 1200px;
	text-align: center;
	line-height: 2em;
	border-radius: 5px;
}
</style>
