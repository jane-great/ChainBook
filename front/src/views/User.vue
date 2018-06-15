<template>
  <div class="user-container">
    <el-tabs :tab-position="'left'" @tab-click="handleChangeTab" v-model="listType">
      <el-tab-pane :label="list.label" :name="list.name" v-for="list in listTab" :key="list.name">
        <div style="text-align: right;">
          <el-button
            size="mini"
            @click="handleCreateCopyRight">新增版权登记</el-button>
        </div>
        <table-list
          :data="dataList"
          :table-header="tableHeader"
          :buttons="buttons"
          :on-button-click="handleButtonClick">
        </table-list>
      </el-tab-pane>
    </el-tabs>

    <copy-right-apply-modal
      :visible="resModal.visible"
      :type="resModal.type"
      :data="resModal.data"
      :confirm-fn="handleModalButtonClick"
      :cancel-fn="handleModalButtonClick">
    </copy-right-apply-modal>
    <copy-right-publish-modal
      :visible="publishModal.visible"
      :data="publishModal.data"
      :type="publishModal.type"
      :confirm-fn="handleModalButtonClick"
      :cancel-fn="handleModalButtonClick">
    </copy-right-publish-modal>
    <copy-right-rent-modal
      :visible="rentModal.visible"
      :data="rentModal.data"
      :type="rentModal.type"
      :confirm-fn="handleModalButtonClick"
      :cancel-fn="handleModalButtonClick">
    </copy-right-rent-modal>
  </div>
</template>

<script>
import CopyRightApplyModal from 'src/components/user/CopyRightApplyModal';
import CopyRightPublishModal from 'src/components/user/CopyRightPublishModal';
import CopyRightRentModal from 'src/components/user/CopyRightRentModal';
import TableList from 'src/components/user/TableList';

import { ListType, Operation } from 'src/config/user/enum';
import { 
  getTableHeader, 
  getCopyRightApplyInitData,
  getCopyRightPublishInitData
} from 'src/config/user/data';
import { getApiToRow, getResToApi } from 'src/config/user/converter';

export default {
  name: 'User',
  data() {
    return {
      listType: ListType.CopyRight,
      dataList: [],
      resModal: {
        data: getCopyRightApplyInitData(),
        visible: false,
        type: null
      },
      publishModal: {
        data: getCopyRightPublishInitData(),
        visible: false,
        type: null
      },
      rentModal: {
        data: {},
        visible: false,
        type: null
      }
    };
  },
  components: {
    CopyRightApplyModal,
    CopyRightPublishModal,
    CopyRightRentModal,
    TableList
  },
  computed: {
    buttons() {
      switch (this.listType) {
        case ListType.CopyRight: {
          return [{
            label: '审核',
            name: 'audit',
            type: 'text'
          }, {
            label: '发行',
            name: 'publish',
            type: 'text'
          }];
        }
        case ListType.Purchase: {
          return [{
            label: '出售',
            name: 'purchase',
            type: 'text'
          }, {
            label: '租赁',
            name: 'rent',
            type: 'text'
          }];
        }
        default: 
          return [];
      }
    },
    listTab() {
      return [{
        label: '已登记版权',
        name: ListType.CopyRight
      }, {
        label: '已购买资源',
        name: ListType.Purchase
      }, {
        label: '已租赁资源',
        name: ListType.Rent
      }];
    },
    tableHeader() {
      return getTableHeader(this.listType);
    }
  },
  mounted() {
    this.getList();
  },
  methods: {
    getList() {
      const api = {
        [ListType.CopyRight]: this.$api.user.getCopyRightsByUser,
        [ListType.Purchase]: this.$api.user.getPurchasedResourcesByUser,
        [ListType.Rent]: this.$api.user.getRentResourcesByUser
      }[this.listType];
      api().then((data) => {
        this.dataList = getApiToRow(this.listType, data);
      });
    },

    handleChangeTab(tab) {
      this.listType = tab.name;
      this.getList();
    },
    
    handleCreateCopyRight() {
      Object.assign(this.resModal, {
        data: getCopyRightApplyInitData(),
        visible: true,
        type: Operation.Create
      });
    },

    handleButtonClick(index, row, name) {
      switch (name) {
        // case 'priview': {
        //   this.$api.resource.getResourceDetailById(row.copyrightId).then((data) => {
        //     Object.assign(this.publishModal, {
        //       readonly: true,
        //       data,
        //       type: Operation.Publish,
        //       visible: true
        //     });
        //   });
        //   break;
        // }
        case 'audit': {
          this.$api.copyright.audit(row.copyrightId).then(() => {
            this.$message({ message: '已审核', type: 'success' });
            this.getList();
          }).catch(this.$message);
          break;
        }
        case 'publish': {
          Object.assign(this.publishModal, {
            data: Object.assign(getCopyRightPublishInitData(), {
              copyrightId: row.copyrightId,
            }),
            readonly: false,
            type: Operation.Publish,
            visible: true
          });
          break;
        }
        case 'purchase': {
          this.$prompt('请输入出售价格', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /\d+/,
            inputErrorMessage: '请输入数字'
          }).then(({ value }) => {
            this.$api.user.purchasedResources.sell(row.tokenId, row.resourceId, value).then(() => {
              this.$message({ message: '发布出售成功', type: 'success' });
              this.getList();
            }).catch(this.$message);
          }).catch(() => {});
          break;
        }
        case 'rent': {
          Object.assign(this.rentModal, {
            data: Object.assign(this.rentModal.data, {
              resourceId: row.resourceId,
              tokenId: row.tokenId,
              rentPrice: '',
              rentTime: ''
            }),
            type: Operation.Rent,
            visible: true
          });
          break;
        }
        default: 
          break;
      }
    },

    handleModalButtonClick(operationType) {
      switch (operationType) {
        case Operation.Create:
        case Operation.Update: {
          const sendData = getResToApi(this.resModal.data);
          this.$api.copyright.apply(sendData).then(() => {
            this.$message({ message: '申请成功', type: 'success' });
            this.resModal.visible = false;
            this.getList();
          }).catch(this.$message);
          break;
        }
        case Operation.Cancel: {
          this.resModal.visible = false;
          this.publishModal.visible = false;
          this.rentModal.visible = false;
          break;
        }
        case Operation.Publish: {
          this.$api.resource.publish(this.publishModal.data).then(() => {
            this.$message({ message: '发行成功', type: 'success' });
            this.getList();
          }).catch(this.$message);
          break;
        }
        case Operation.Rent: {
          const res = this.rentModal.data;
          this.$api.user.purchasedResources
            .rentOut(res.tokenId, res.resourceId, res.rentPrice, res.rentTime)
            .then(() => {
              this.$message({ message: '发布出租成功', type: 'success' });
              this.getList();
            }).catch(this.$message);
          break;
        }
        default: 
          break;
      }
    }
  }
};
</script>

<style>
  .demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 110px;
    padding-right: 0;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>
