<template>
  <el-dialog :title="dialogTitle" :visible="visible" :show-close="false">
    <el-form :model="data" status-icon :rules="rules" ref="form" label-width="100px" class="register">
      <el-form-item label="账号" prop="username">
        <el-input v-model.number="data.userName"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="pass">
        <el-input type="password" v-model="data.pass" auto-complete="off"></el-input>
      </el-form-item>
      <template v-if="type === 1">
        <el-form-item label="确认密码" prop="checkPass">
          <el-input type="password" v-model="data.checkPass" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="data.email" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="data.mobile" auto-complete="off"></el-input>
        </el-form-item>
      </template>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelFn">取 消</el-button>
      <el-button type="primary" @click="submitForm('form')">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  props: {
    visible: Boolean,
    type: Number, // 1: 注册 2： 登录
    data: Object,
    confirmFn: Function,
    cancelFn: Function
  },
  computed: {
    dialogTitle() {
      if (this.type === 1) return '注册';
      if (this.type === 2) return '登录';
      return '';
    }
  },
  data() {
    const checkUsername = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('账号不能为空'));
      }
      return callback();
    };
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else {
        if (this.data.checkPass !== '' && this.type === 1) {
          this.$refs.form.validateField('checkPass');
        }
        callback();
      }
    };
    const validateConfirmPass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.data.pass) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      rules: {
        pass: [
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPass: [
          { validator: validateConfirmPass, trigger: 'blur' }
        ],
        userName: [
          { validator: checkUsername, trigger: 'blur' }
        ]
      }
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.confirmFn();
        } 
        return false;
      });
    }
  }
};
</script>
