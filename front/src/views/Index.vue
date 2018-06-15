<template>
  <div>
    <el-carousel :interval="4000" type="card" height="400px">
      <el-carousel-item v-for="item in firstResourceList" :key="item._id">
        <img :src="item.coverImage" class="image" />
        <p class="book-name">{{ item.resourceName }}</p>
      </el-carousel-item>
    </el-carousel>
    <el-row :gutter="20" class="">
      <el-col :span="12">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span class="sub-header">二手市场</span>
          </div>
          <div v-for="item in secondHandList" :key="item._id" class="text item">
            {{ item.resourceName }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span class="sub-header">租赁市场</span>
          </div>
          <div v-for="item in rentList" :key="item._id" class="text item">
            {{ item.resourceName }}
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  data() {
    return {
      firstResourceList: [],
      secondHandList: [],
      rentList: []
    };
  },
  mounted() {
    const query = {
      page: 1,
      pageSize: 5,
      lastId: ''
    };
    Promise.all([
      this.$api.resource.getResourceListByPage(query),
      this.$api.resource.getPurchasedResourceListByPage(query),
      this.$api.resource.getTenantableResourceListByPage(query)
    ]).then(([firstResource, secondHand, rent]) => {
      this.firstResourceList = firstResource.resourceInfoList;
      this.secondHandList = secondHand.resourceInfoList;
      this.rentList = rent.resourceInfoList;
    });
  },
  methods: {

  }
};
</script>

<style lang="scss">
.el-carousel__item {
  h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 400px;
    margin: 0;
  }
  .image {
    height: 90%;
    display: block;
    margin: 0 auto;
  }
  .book-name {
    text-align: center;
  }
}
.box-card {
  .sub-header {
    font-weight: bold;
  }
}
</style>