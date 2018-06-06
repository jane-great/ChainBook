import {
  PUSH_LOADING,
  POP_LOADING
} from '../mutation-types';

const state = {
  loading: {
    count: 0,
    message: ''
  }
};

const mutations = {
  [PUSH_LOADING](state) {
    state.loading.count += state.loading.count;
  },
  [POP_LOADING](state) {
    state.loading.count -= state.loading.count;
  }
};

export default {
  state,
  mutations
};
