<template>
  <el-dialog :title="dialogTitle" :visible="visible" :show-close="false" class="copy-right-apply-modal" :width="'700px'">
    <el-form :model="data" status-icon :rules="rules" ref="form" label-width="100px" class="register">
      <el-form-item label="版权名称" prop="workName">
        <el-input v-model.number="data.workName" placeholder="请输入版权名称"></el-input>
      </el-form-item>
      <el-form-item label="版权类别">
        <el-select v-model="data.workCategory" placeholder="请选择版权类型">
          <el-option :label="categrory" :value="categrory" :key="categrory" v-for="categrory in options.workCategory"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="作者信息" prop="authors">
        <el-input v-model="data.authors[0].authorName" placeholder="名称"></el-input>
        <el-input v-model="data.authors[0].identityType" placeholder="身份类型"></el-input>
        <el-input v-model="data.authors[0].identityNum" placeholder="身份证"></el-input>
      </el-form-item>
      <el-form-item label="著作属性" prop="workProperty">
        <el-select v-model="data.workProperty" placeholder="下拉选择">
          <el-option :label="property" :value="property" :key="property" v-for="property in options.workProperty"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="版权资源" prop="rights">
        <el-select v-model="data.rights" multiple placeholder="请选择">
          <el-option
            v-for="right in options.rights"
            :key="right"
            :label="right"
            :value="right">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属类别" prop="belong">
        <el-select v-model="data.belong" placeholder="请选择版权类型">
          <el-option :label="belong" :value="belong" :key="belong" v-for="belong in options.belong"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="上传样本" prop="samplePath">
        <el-upload
          style="width: 100%;"
          class="upload-demo"
          ref="upload"
          name="sample"
          action="/ChainBook/copyright/upload/sample"
          :on-success="handleUpdateSuccess"
          :file-list="data.samplePath">
          <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
          <!-- <el-button style="margin-left: 10px; display: none;" size="small" type="success" @click="submitUpload">上传到服务器</el-button> -->
          <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
        </el-upload>
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
    type: Number, // create, update
    data: Object,
    confirmFn: Function,
    cancelFn: Function
  },
  computed: {
    dialogTitle() {
      if (this.type === Operation.Create) return '新增版权信息';
      if (this.type === Operation.Update) return '编辑版权信息';
      return '';
    },
    options() {
      return {
        rights: ['发表权', '署名权', '修改权', '发行权', '出租权', '信息网络传播权', '改编权', '翻译权', '汇编权'],
        belong: ['合作作品', '个人作品', '法人作品'],
        workCategory: ['文字', '口述', '音乐'],
        workProperty: ['原创', '翻译', '改编', '汇编', '注释', '整理']
      };
    },
    Operation() {
      return Operation;
    }
  },
  data() {
    return {
      rules: {}
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.confirmFn(this.type);
        } 
        return false;
      });
    },
    handleUpdateSuccess(callback, file, fileList) {
      console.log(callback, file, fileList);
    }
  }
};
</script>
<style lang="scss" scoped>
.copy-right-apply-modal {
  .el-select {
    width: 100%;
  }
}
</style>

