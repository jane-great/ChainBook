<template>
  <el-dialog :title="readonly ? '预览发行版权' : '发行版权'" :visible="visible" :show-close="false" class="copy-right-publish-modal" :width="'700px'">
    <el-form v-if="!readonly" :model="data" status-icon :rules="rules" ref="form" label-width="100px" class="register">
      <el-form-item label="名称" prop="resourceName">
        <el-input v-model="data.resourceName" placeholder="名称"></el-input>
      </el-form-item>
      <el-form-item label="发行总数">
        <el-input v-model.number="data.total" placeholder="发行总数"></el-input>
      </el-form-item>
      <el-form-item label="价格">
        <el-input v-model.number="data.price" placeholder="价格"></el-input>
      </el-form-item>
      <el-form-item label="描述">
        <el-input type="textarea" :autosize="{ minRows: 2}" v-model.number="data.desc" placeholder="描述"></el-input>
      </el-form-item>
      <el-form-item label="上传封面图片" prop="coverImg" v-if="!readonly">
        <el-upload
          class="avatar-uploader"
          action="/ChainBook/resource/upload/coverImg"
          :show-file-list="false"
          name="coverImage"
          :on-success="handleUpdateSuccess"
          :before-upload="beforeAvatarUpload">
          <img v-if="data.coverImage" :src="data.coverImage" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
    </el-form>

    <el-row :gutter="20" v-else class="readonly">
      <p>
        <el-col :span="6"><b>名称</b></el-col>
        <el-col :span="18">{{ data.resourceName }}</el-col>
      </p>
      <p>
        <el-col :span="6"><b>描述</b></el-col>
        <el-col :span="18">{{ data.desc }}</el-col>
      </p>
      <p>
        <el-col :span="6"><b>发行总数</b></el-col>
        <el-col :span="18">{{ data.total }}</el-col>
      </p>
      <p>
        <el-col :span="6"><b>价格</b></el-col>
        <el-col :span="18">{{ data.price }}元</el-col>
      </p>
      <p>
        <el-col :span="6"><b>资源合约地址</b></el-col>
        <el-col :span="18">{{ data.resourceAddress }}</el-col>
      </p>
      <p>
        <el-col :span="6"><b>图片</b></el-col>
        <el-col :span="18"><img v-if="data.coverImage" :src="data.coverImage" class="avatar"></el-col>
      </p>
    </el-row>

    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelFn(Operation.Cancel)">取 消</el-button>
      <el-button v-show="!readonly" type="primary" @click="submitForm('form')">确 定</el-button>
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
    readonly: Boolean,
    confirmFn: Function,
    cancelFn: Function
  },
  computed: {
    options() {
      return {};
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
    handleUpdateSuccess(callback) {
      if (callback.status === 1) {
        this.data.coverImage = callback.data.path;
      } else {
        this.$message(callback.msg);
      }
    },
    beforeAvatarUpload(file) {
      console.log(file.type);
      const isIMG = ['image/jpeg', 'image/png', 'image/jpg'].indexOf(file.type) >= 0;
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isIMG) {
        this.$message.error('上传文件只能是图片格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传图片不能超过2MB!');
      }
      return isIMG && isLt2M;
    }
  }
};
</script>
<style lang="scss">
.copy-right-publish-modal {
  .el-select {
    width: 100%;
  }
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    min-height: 178px;
    display: block;
  }
  .readonly {
    p {
      overflow: hidden;
    }
  }
}
</style>

