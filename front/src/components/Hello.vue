<template>
  <div>
    <p>测试亚敏，啊哈哈啊啊哈</p>
    <button @click="handleGetApi">跟api</button>
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
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    handleGetApi() {
      console.log('aaaaa');
      this.$api.base.getContent().then((data) => {
        console.log(data);
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
