import {
  PUSH_LOADING,
  POP_LOADING
} from 'src/vuex/mutation-types';

export const pushLoading = ({ dispatch }) => {
  dispatch(PUSH_LOADING);
};

export const popLoading = ({ dispatch }) => {
  // 避免连续的两次 loading 间动画重置
  setTimeout(() => {
    dispatch(POP_LOADING);
  }, 50);
};
