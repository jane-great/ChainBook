<template>
  <div class="user-container">
    <el-tabs :tab-position="'left'" @tab-click="handleChangeTab" v-model="listType">
      <el-tab-pane :label="list.label" :name="list.name" v-for="list in listTab" :key="list.name">
        <div style="text-align: right;">
          <el-button
            size="mini"
            @click="handleCreateCopyRight">新增版权登记书籍</el-button>
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
  </div>
</template>

<script>
import CopyRightApplyModal from 'src/components/user/CopyRightApplyModal';
import TableList from 'src/components/user/TableList';

import { ListType, Operation } from 'src/config/user/enum';
import { getTableHeader, getInitData } from 'src/config/user/data';
import { getApiToRow, getResToApi } from 'src/config/user/converter';

export default {
  name: 'User',
  data() {
    return {
      listType: ListType.CopyRight,
      dataList: getApiToRow(ListType.CopyRight),
      resModal: {
        data: getInitData(ListType.CopyRight),
        visible: false,
        type: null
      }
    };
  },
  components: {
    CopyRightApplyModal,
    TableList
  },
  computed: {
    buttons() {
      switch (this.listType) {
        case ListType.CopyRight: {
          return [{
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
  methods: {
    getList() {
    },

    handleChangeTab(tab) {
      this.listType = tab.name;
      this.dataList = getApiToRow(this.listType);
    },
    
    handleCreateCopyRight() {
      Object.assign(this.resModal, {
        data: getInitData(ListType.CopyRight),
        visible: true,
        type: Operation.Create
      });
    },

    handleButtonClick(index, row, name) {
      switch (name) {
        case 'publish': {
          this.$api.copyright.publish(row).then(() => {
            this.$message({ message: '发行成功', type: 'success' });
            this.getList();
          }).catch(this.$message);
          break;
        }
        case 'purchase': {
          this.$api.user.purchasedResources.sell(row.tokenId, row.sellPrice).then(() => {
            this.$message({ message: '发布出售成功', type: 'success' });
            this.getList();
          }).catch(this.$message);
          break;
        }
        case 'rent': {
          this.$api.user.purchasedResources.rentOut(row.tokenId, row.rentPrice).then(() => {
            this.$message({ message: '发布出租成功', type: 'success' });
            this.getList();
          }).catch(this.$message);
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
          }).catch(this.$message);
          break;
        }
        case Operation.Cancel: {
          this.resModal.visible = false;
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
