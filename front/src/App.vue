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
          <span v-show="!username">
            <span class="text-href" @click="handleOpenLoginModal(2)">登录</span>
            <span class="text-href" @click="handleOpenLoginModal(1)">注册</span>
          </span>
          <span v-show="username">
            <span>欢迎你，zebin</span>
            <span class="text-href" @click="handleLogout">注销</span>
          </span>
        </div>
      </div>
      <nav class="navigation">
        <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal">
          <template v-for="(nav, navIndex) in navList">
            <el-menu-item :index="navIndex + ''">
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
import { mapState, mapActions } from 'vuex';

export default {
  name: 'App',
  components: {
    LoginModal
  },
  data() {
    return {
      navList: [{
        name: '首页',
        link: '/',
      }, {
        name: '首发资源',
        link: '/FirstResource',
      }, {
        name: '二手市场',
        link: '/SecondHand',
      }, {
        name: '租赁市场',
        link: '/Rent',
      }, {
        name: '个人管理',
        link: '/User',
      }],
      loginModal: {
        visible: false,
        type: 1,
        data: {
          userName: 'zebin',
          pass: '888888',
          checkPass: '888888',
          mobile: '18825182349',
          email: '1069467662@qq.com'
        }
      }
    };
  },
  computed: {
    ...mapState({
      username: ({ base }) => base.username,
      path: ({ route }) => route.path
    }),
    activeIndex() {
      const matchPath = this.navList.map(nav => nav.link).indexOf(this.path);
      if (matchPath > -1) return matchPath.toString();
      return '0';
    }
  },
  methods: {
    ...mapActions('base', [
      'getUsername'
    ]),
    handleOpenLoginModal(type) {
      Object.assign(this.loginModal, {
        visible: true,
        type
      });
    },
    handleLoginConfirm() {
      const { userName, pass, email, mobile } = this.loginModal.data;
      // 注册
      if (this.loginModal.type === 1) {
        this.$api.user.register({
          userName,
          pwd: pass,
          email,
          mobile
        }).then(() => {
          this.$message({ message: '注册成功', type: 'success' });
          this.loginModal.visible = false;
          this.getUsername(userName);
        }).catch(() => {});
      } else {
        this.$api.user.localLogin({
          userName,
          pwd: pass
        }).then(() => {
          this.$message({ message: '登录成功', type: 'success' });
          this.loginModal.visible = false;
          this.getUsername(userName);
        }).catch(() => {});
      }
    },
    handleLoginCancel() {
      this.loginModal.visible = false;
    },
    handleLogout() {
      this.$api.user.localLogout().then(() => {
        this.$message({ message: '注销成功', type: 'success' });
        this.getUsername('');
      }).catch(() => {});
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
      a {
        display: block;
      }
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
