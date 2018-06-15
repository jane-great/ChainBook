<template>
  <div class="resource-table-list">
    <el-row :gutter="20">
      <el-col :span="8" v-for="book in data" v-show="data.length" :key="book._id">
        <section class="book-content">
          <div class="image">
            <img :src="book.coverImage" />
          </div>
          <div class="intro">
            <p>
              <span class="name">{{ book.resourceName }}</span>
              <span class="price">{{ book.price }} 元</span>
            </p>
            <p class="desc">{{ book.desc }}</p>
            <div class="detail">
              <span>
                <el-button
                size="mini"
                :type="'text'"
                @click="handleGetBookInfo(book)">书籍详情
                </el-button>
              </span>
              <span>
                <el-button
                size="mini"
                :type="'text'"
                @click="handleGetOwnerInfo(book, true)">交易详情
                </el-button>
              </span>
              <span>
                <el-button
                size="mini"
                :type="'text'"
                @click="handleDeal(book)">{{ dealText }}
                </el-button>
              </span>
            </div>
          </div>
        </section>
      </el-col>
      <el-col :span="20" style="text-align: center;" v-show="!data.length">暂无数据</el-col>
    </el-row>

    <div class="pagination">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="query.currentPage"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="query.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>

    <copy-right-publish-modal
      :visible="publishModal.visible"
      :data="publishModal.data"
      :readonly="publishModal.readonly"
      :type="publishModal.type"
      :confirm-fn="handleModalButtonClick"
      :cancel-fn="handleModalButtonClick">
    </copy-right-publish-modal>
  </div>
</template>
<script>
import { ListType } from 'src/config/resource/enum';
import { Operation } from 'src/config/user/enum';
import CopyRightPublishModal from 'src/components/user/CopyRightPublishModal';

export default {
  props: {
    listType: String
  },
  components: {
    CopyRightPublishModal
  },
  data() {
    return {
      query: {
        currentPage: 1,
        page: 1,
        pageSize: 20,
        lastId: ''
      },
      publishModal: {
        data: {},
        visible: false,
        type: null
      },
      data: '',
      total: 0
    };
  },
  computed: {
    dealText() {
      switch (this.listType) {
        case ListType.FirstResource: 
        case ListType.SecondHand:
          return '购买';
        case ListType.Rent: 
          return '租赁';
        default: 
          return '';
      }
    }
  },
  mounted() {
    this.getList();
  },
  methods: {
    getList() {
      const api = {
        [ListType.FirstResource]: this.$api.resource.getResourceListByPage,
        [ListType.SecondHand]: this.$api.resource.getPurchasedResourceListByPage,
        [ListType.Rent]: this.$api.resource.getTenantableResourceListByPage
      }[this.listType];
      api(this.query).then((data) => {
        this.data = data.resourceInfoList;
        this.query.lastId = data.page.lastId;
        this.total = data.total;
      }).catch(this.$message);
    },
    handleSizeChange(pageSize) {
      this.query.pageSize = pageSize;
      this.getList();
    },
    handleCurrentChange(page) {
      this.query.page = page;
      this.getList();
    },

    handleGetBookInfo(book) {
      this.$api.resource.getResourceDetailById(book._id).then((data) => {
        Object.assign(this.publishModal, {
          readonly: true,
          data,
          visible: true
        });
      });
    },
    handleGetOwnerInfo(book, isShowOwnerModal) {
      return new Promise((resolve, reject) => {
        switch (this.listType) {
          case ListType.SecondHand:
          case ListType.FirstResource: {
            this.$api.resource.getPurchasedResourceOwnerListById(book._id).then((owner) => {
              if (isShowOwnerModal) {
                this.$alert(
                  `<p><span class="owner-info-item">token_id</span>${owner.tokenId}</p>
                    <p><span class="owner-info-item">售卖价格</span>${owner.sellPrice}元</p>`, 
                  '交易详情', {
                    dangerouslyUseHTMLString: true
                  }
                ).catch(() => {});
              }
              resolve(owner);
            }).catch(reject);
            break;
          }
          case ListType.Rent: {
            this.$api.resource.getTenantableResourceOwnerListById(book._id).then((owner) => {
              if (isShowOwnerModal) {
                this.$alert(
                  `<p><span class="owner-info-item">token_id</span>${owner.tokenId}</p>
                    <p><span class="owner-info-item">租赁价格</span>${owner.rentPrice}元</p>
                    <p><span class="owner-info-item">可租赁天数</span>${owner.rentTime}天</p>`, 
                  '交易详情', {
                    dangerouslyUseHTMLString: true
                  }
                ).catch(() => {});
              }
              resolve(owner);
            }).catch(reject);
            break;
          }
          default:
            break;
        }
      });
    },

    handleDeal(book) {
      const sendData = {
        resourceId: book._id,
        tokenId: ''
      };
      this.handleGetOwnerInfo(book, false).then((owner) => {
        // tokenId是需要去对应的owner人
        sendData.tokenId = owner.tokenId;
        switch (this.listType) {
          case ListType.FirstResource: 
            this.$api.resource.buyFromAuthor(book._id).then(() => {
              this.$message({ message: '购买成功', type: 'success' });
            }).catch(this.$message);
            break;
          case ListType.SecondHand:
            this.$api.resource.buy(sendData).then(() => {
              this.$message({ message: '购买成功', type: 'success' });
            }).catch(this.$message);
            break;
          case ListType.Rent: 
            this.$api.resource.rent(sendData).then(() => {
              this.$message({ message: '租赁成功', type: 'success' });
            }).catch(this.$message);
            break;
          default: 
            break;
        }
      });
    },

    handleModalButtonClick(operationType) {
      switch (operationType) {
        case Operation.Cancel: {
          this.publishModal.visible = false;
          break;
        }
        default: 
          break;
      }
    }
  }
};
</script>

<style lang="scss">
.resource-table-list{
  .el-row {
    margin-bottom: 20px;
    .book-content {
      border-radius: 4px;
      min-height: 300px;
      display: inline-block;
      width: 100%;
      .image {
        border-width: 0px;
        width: 100%;
        height: 200px;
        box-sizing: border-box;
        img {
          height: 100%;
          display: block;
          margin: 0 auto;
        }
      }
      .intro {
        width: 100%;
        height: 120px;
        overflow: hidden;
        padding: 0 10px;
        box-sizing: border-box;
        .name {
          font-size: 16px;
          font-weight: bold;
        }
        .price {
          font-size: 14px;
          color: #F04844;
          float: right;
        }
        .desc {
          color: #676767;
          font-size: 14px;
          height: 19px;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }
        .detail {
          overflow: hidden;
          .el-button {
            font-size: 14px;
          }
          span {
            display: inline-block;
            width: 32%;
            box-sizing: border-box;
          }
        }
      }
    }
  }
  .pagination {
    text-align: center;
  }
}
.el-message-box {
  width: 500px;
  .el-message-box__message p {
    .owner-info-item {
      display: inline-block;
      width: 100px;
      padding: 10px 0;
    }
  } 
}

</style>

