import { ListType } from 'src/config/user/enum';

export const getTableHeader = (listType) => {
  switch (listType) {
    case ListType.CopyRight: {
      return [
        { field: 'copyrightId', name: '版权ID' }, 
        { field: 'workName', name: '版权名称' }, 
        { field: 'copyrightAddress', name: '版权合约地址' }, 
        { field: 'resourcesAddress', name: '资源合约地址' }, 
        { field: 'resourcesIpfsHash', name: '资源ipfsHash', hidden: true }, 
        { field: 'resourcesIpfsDHash', name: '资源ipfsDHash', hidden: true }, 
        { field: 'localUrl', name: '本地URL', hidden: true }
      ];
    }
    case ListType.Purchase: {
      return [
        { field: 'resourceId', name: '资源ID', width: 120 },
        { field: 'resourceName', name: '名称', width: 120 },
        { field: 'type', name: '类型', width: 40 },
        { field: 'tokenId', name: 'tokenId', width: 120 },
        { field: '__sellStatus', name: '出售状态', width: 60 },
        { field: 'sellPrice', name: '出售价格', width: 60 },
        { field: '__rentOutStatus', name: '租赁状态', width: 60 },
        { field: 'rentPrice', name: '租赁价格', width: 60 }
      ];
    }
    case ListType.Rent: {
      return [
        { field: 'resourceId', name: '资源ID', width: 120 },
        { field: 'resourceName', name: '名称', width: 120 },
        { field: 'type', name: '类型', width: 40 },
        { field: 'tokenId', name: 'tokenId', width: 120 },
        { field: 'rentTime', name: '出售时间', width: 80 }
      ];
    }
    default:
      return [];
  }
};
export const getCopyRightApplyInitData = () => ({
  workName: '测试新增版权',
  workCategory: '',
  samplePath: [],
  authors: [{
    authorName: 'zebin',
    identityType: '身份证',
    identityNum: '12345678'
  }],
  workProperty: '',
  rights: [],
  belong: ''
});
export const getCopyRightPublishInitData = () => ({
  copyrightId: '',
  resourceName: '',
  total: '',
  coverImage: '',
  // coverImage: 'http://159.203.96.61:3000/images/coverImage-ws3nlm1528896785295.jpg',
  price: ''
});
