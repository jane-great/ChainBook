<template>
  <div class="resource-table-list">
    <el-row :gutter="20">
      <el-col :span="8" v-for="book in data" :key="book._id">
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
                @click="handleGetBookInfo">书籍详情
                </el-button>
              </span>
              <span>
                <el-button
                size="mini"
                :type="'text'"
                @click="handleGetOwnerInfo">发布人
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
  </div>
</template>
<script>
import { ListType } from 'src/config/resource/enum';

export default {
  props: {
    listType: String
  },
  data() {
    return {
      query: {
        currentPage: 1,
        page: 1,
        pageSize: 20,
        lastId: ''
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
      this.$api.resource.getResourceListByPage(this.query).then((data) => {
        this.data = data.resourceInfoList;
        this.query.lastId = data.page.lastId;
        this.total = data.total;
      });
    },
    handleSizeChange(pageSize) {
      this.query.pageSize = pageSize;
      this.getList();
    },
    handleCurrentChange(page) {
      this.query.page = page;
      this.getList();
    },

    handleGetBookInfo() {

    },
    handleGetOwnerInfo() {
      this.getGetBookInfoFromApi().then((owner) => {
        this.$alert(
          `<p><span style="display: inline-block; width: 100px;">token_id</span>${owner.tokenId}</p>
          <p><span style="display: inline-block; width: 100px;">发布人</span>${owner.ownerAccount}</p>
          <p><span style="display: inline-block; width: 100px;">价格</span>${owner.purchasePrice}元</p>`, 
          '交易人', {
            dangerouslyUseHTMLString: true
          }
        );
      });
    },
    getGetBookInfoFromApi() {
      return new Promise((resolve) => {
        const owner = {
          tokenId: '5b175b0f08585480f53bce38',
          ownerAccount: 'test',
          purchasePrice: '10'
        };
        resolve(owner);
      });
    },

    handleDeal(book) {
      const sendData = {
        resourceId: book._id,
        tokenId: ''
      };
      this.getGetBookInfoFromApi().then((data) => {
        sendData.tokenId = data.tokenId;
        // tokenId是需要去对应的own
        switch (this.listType) {
          case ListType.FirstResource: 
            this.$api.resource.buyFromAuthor(sendData).then(() => {
              this.$message({ message: '购买成功', type: 'success' });
              this.getList();
            }).catch(this.$message);
            break;
          case ListType.SecondHand:
            this.$api.resource.buy(sendData).then(() => {
              this.$message({ message: '购买成功', type: 'success' });
              this.getList();
            }).catch(this.$message);
            break;
          case ListType.Rent: 
            this.$api.resource.rent(sendData).then(() => {
              this.$message({ message: '租赁成功', type: 'success' });
              this.getList();
            }).catch(this.$message);
            break;
          default: 
            break;
        }
      });
    }
  }
};
</script>

<style scoped lang="scss">
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
</style>

