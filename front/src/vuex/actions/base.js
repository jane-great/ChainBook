import { GET_LOGIN_USERNAME } from '../mutation-types';

// initial state
const state = {
  username: ''
};

// getters
const getters = {
};

// actions
const actions = {
  getUsername({ commit, username }) {
    commit(GET_LOGIN_USERNAME, username);
  }
};

// mutations
const mutations = {
  [GET_LOGIN_USERNAME](state, username) { 
    state.username = username;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
