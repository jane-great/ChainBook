<template>
  <el-dialog :title="'租赁资源'" :visible="visible" :show-close="false" class="copy-right-publish-modal" :width="'700px'">
    <el-form :model="data" status-icon :rules="rules" ref="form" label-width="100px" class="register">
      <el-form-item label="价格（元）" prop="price">
        <el-input v-model.number="data.rentPrice" placeholder="租赁价格"></el-input>
      </el-form-item>
      <el-form-item label="时间（天）">
        <el-input v-model.number="data.rentTime" placeholder="租赁时间"></el-input>
      </el-form-item>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelFn(Operation.Cancel)">取 消</el-button>
      <el-button type="primary" @click="submitForm('form')">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { Operation } from 'src/config/user/enum';

export default {
  props: {
    visible: Boolean,
    type: Number,
    data: Object,
    confirmFn: Function,
    cancelFn: Function
  },
  data() {
    return {
      rules: {}
    };
  },
  computed: {
    Operation() {
      return Operation;
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.confirmFn(this.type);
        } 
        return false;
      });
    }
  }
};
</script>

