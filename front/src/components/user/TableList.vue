<template>
  <el-table
    :data="data"
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
      :prop="header.field"
      :min-width="header.width">
    </el-table-column>

    <el-table-column label="操作">
      <template slot-scope="scope">
        <el-button
          v-for="button in buttons"
          :key="button.name"
          size="mini"
          :type="button.type"
          @click="onButtonClick(scope.$index, scope.row, button.name)">{{ button.label }}</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
export default {
  props: {
    data: Array,
    tableHeader: Array,
    buttons: Array,
    onButtonClick: Function
  },
  computed: {
    tableHeaderNoHidden() {
      return this.tableHeader.filter(header => !header.hidden);
    }
  }
};
</script>

