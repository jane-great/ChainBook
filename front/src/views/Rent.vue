<template>
  <div>
    <table-list 
    :list-type="listType">
    </table-list>
  </div>
</template>
<script>
import TableList from 'src/components/resource/TableList';
import { ListType } from 'src/config/resource/enum';

export default {
  name: 'rent',
  computed: {
    enum() {
      return ListType;
    }
  },
  data() {
    return {
      listType: ListType.Rent
    };
  },
  components: {
    TableList
  }
};
</script>