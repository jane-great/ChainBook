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
              <router-link :to="nav.path">{{ nav.title }}</router-link>
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
import { routerMap } from 'src/router';
import md5 from 'js-md5';

export default {
  name: 'App',
  components: {
    LoginModal
  },
  data() {
    return {
      loginModal: {
        visible: false,
        type: 1,
        data: {
          userName: '',
          pass: '',
          checkPass: '',
          mobile: '',
          email: ''
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
      const matchPath = this.navList.map(nav => nav.path).indexOf(this.path);
      if (matchPath > -1) return matchPath.toString();
      return '0';
    },
    navList() {
      if (this.username) {
        return routerMap;
      } 
      return routerMap.filter(nav => nav.visible !== false);
    }
  },
  methods: {
    ...mapActions('base', [
      'getUsername'
    ]),
    handleOpenLoginModal(type) {
      Object.assign(this.loginModal, {
        visible: true,
        type,
        data: {
          userName: '',
          pass: '',
          checkPass: '',
          mobile: '',
          email: ''
        }
      });
    },
    handleLoginConfirm() {
      const { userName, pass, email, mobile } = this.loginModal.data;
      const passwordForMd5 = md5(pass);
      // 注册
      if (this.loginModal.type === 1) {
        this.$api.user.register({
          userName,
          pwd: passwordForMd5,
          email,
          mobile
        }).then(() => {
          this.$api.user.localLogin({
            userName,
            pwd: passwordForMd5
          }).then(() => {
            this.$message({ message: '注册成功', type: 'success' });
            this.loginModal.visible = false;
            this.getUsername(userName);
          }).catch(this.$message);
        }).catch(this.$message);
      } else {
        this.$api.user.localLogin({
          userName,
          pwd: passwordForMd5
        }).then(() => {
          this.$message({ message: '登录成功', type: 'success' });
          this.loginModal.visible = false;
          this.getUsername(userName);
        }).catch(this.$message);
      }
    },
    handleLoginCancel() {
      this.loginModal.visible = false;
    },
    handleLogout() {
      this.$api.user.localLogout().then(() => {
        this.$message({ message: '注销成功', type: 'success' });
        this.getUsername('');
      }).catch(this.$message);
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
        font-size: 16px;
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
  min-height: 730px;
}
.footer {
  margin: 0 auto; 
  padding-top: 15px;
	height: 70px; 
	width: 1200px;
	text-align: center;
	line-height: 2em;
	border-radius: 5px;
}
</style>
