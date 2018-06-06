<template>
<div class="file-selector" @click="handleClick">
  <form class="invisible-form">
    <input type="file"
    v-bind="{'multiple': multiple}"
    ref="input"
    :accept="accept"
    @change="handleInputChange">
  </form>
  <slot></slot>
</div>
</template>

<script>
export default {
  props: {
    // 选择文件后的回调函数
    // onChange(file)
    //   - {File} file
    onChange: {
      type: Function,
      required: true
    },
    // e.g.: '.xls,.xlsx'
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes
    accept: String,
    // 是否选择多个文件
    multiple: Boolean
  },

  methods: {
    handleClick() {
      this.$refs.input.click();
    },

    handleInputChange() {
      if (this.multiple) {
        this.onChange(this.$refs.input.files);
      } else {
        this.onChange(this.$refs.input.files[0]);
      }
      // 选择同一文件时触发 change 事件
      this.$refs.input.value = null;
      return false;
    }
  }
};
</script>

<style>
</style>
