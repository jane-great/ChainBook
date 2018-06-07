<template>
  <div class="user-container">
    <el-tabs :tab-position="'left'">
      <el-tab-pane label="登记版权列表">
        <div style="text-align: right;">
          <el-button
            size="mini"
            @click="handleEdit(scope.$index, scope.row)">发行版权书籍</el-button>
        </div>
        <el-table
          :data="copyRightList"
          style="width: 100%">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="demo-table-expand">
                <el-form-item v-for="header in tableHeader" :key="header.field" :label="header.name">
                  <span>{{ props.row[header.field] }}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          
          <el-table-column
            v-for="header in tableHeaderNoHidden"
            :key="header.field"
            :label="header.name"
            :prop="header.field">
          </el-table-column>

          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                size="mini"
                @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.$index, scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="购买资源列表">
        购买资源列表
      </el-tab-pane>
      <el-tab-pane label="租赁资源列表">
        租赁资源列表
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { PageType } from 'src/config/user/enum';
import { getTableHeader } from 'src/config/user/data';

export default {
  data() {
    return {
      copyRightList: [{
        copyrightId: '5b0e792605373eafe9ceed61',
        workName: '链书设计大全',
        resourcesIpfsHash: '0x7cF2baAe306B1B0476843De3909097be0E6850f3',
        resourcesIpfsDHash: '0x7cF2baAe306B1B0476843De3909097be0E6850f3',
        localUrl: 'http://localhost:3000/ChainBook/login?userName=admin&pwd=admin',
        copyrightAddress: '版权合约的地址',
        resourcesAddress: '资源合约地址'
      }, {
        copyrightId: '5b0e792605373eafe9ceed61',
        workName: '链书设计大全2',
        resourcesIpfsHash: '0x7cF2baAe306B1B0476843De3909097be0E6850f3',
        resourcesIpfsDHash: '0x7cF2baAe306B1B0476843De3909097be0E6850f3',
        localUrl: 'http://localhost:3000/ChainBook/login?userName=admin&pwd=admin',
        copyrightAddress: '版权合约的地址',
        resourcesAddress: '资源合约地址'
      }, {
        copyrightId: '5b0e792605373eafe9ceed61',
        workName: '链书设计大全3',
        resourcesIpfsHash: '0x7cF2baAe306B1B0476843De3909097be0E6850f3',
        resourcesIpfsDHash: '0x7cF2baAe306B1B0476843De3909097be0E6850f3',
        localUrl: 'http://localhost:3000/ChainBook/login?userName=admin&pwd=admin',
        copyrightAddress: '版权合约的地址',
        resourcesAddress: '资源合约地址'
      }, {
        copyrightId: '5b0e792605373eafe9ceed61',
        workName: '链书设计大全4',
        resourcesIpfsHash: '0x7cF2baAe306B1B0476843De3909097be0E6850f3',
        resourcesIpfsDHash: '0x7cF2baAe306B1B0476843De3909097be0E6850f3',
        localUrl: 'http://localhost:3000/ChainBook/login?userName=admin&pwd=admin',
        copyrightAddress: '版权合约的地址',
        resourcesAddress: '资源合约地址'
      }],
      tableHeader: getTableHeader(PageType.CopyRight)
    };
  },
  computed: {
    tableHeaderNoHidden() {
      return this.tableHeader.filter(header => !header.hidden);
    }
  },
  methods: {
    handleEdit() {

    },
    handleDelete() {

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
