<template>
  <div>
    <p>第一个测试页面</p>
    <button @click="handleGetApi">获取api测试</button>
  </div>
</template>

<script>
export default {
  name: 'hello',
  components: {

  },
  data() {
    return {
      msg: 'Welcome to Your Vue.js App',
    };
  },
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath);  // disable-eslint-line no-console
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath); // disable-eslint-line no-console
    },
    handleGetApi() {
      this.$api.base.getContent().then((data) => {
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
