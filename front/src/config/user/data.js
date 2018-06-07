import { PageType } from 'src/config/user/enum';

export const getTableHeader = (pageType) => {
  switch (pageType) {
    case PageType.CopyRight: {
      return [
        { field: 'copyrightId', name: '版权ID' }, 
        { field: 'workName', name: '书名' }, 
        { field: 'copyrightAddress', name: '版权合约地址' }, 
        { field: 'resourcesAddress', name: '资源合约地址' }, 
        { field: 'resourcesIpfsHash', name: '资源ipfsHash', hidden: true }, 
        { field: 'resourcesIpfsDHash', name: '资源ipfsDHash', hidden: true }, 
        { field: 'localUrl', name: '本地URL', hidden: true }
      ];
    }
    case PageType.Purchase: {
      return [
        { field: 'resourceId', name: '资源ID' },
        { field: 'resourceName', name: '名称' },
        { field: 'type', name: '类型' },
        { field: 'tokenId', name: 'tokenId' },
        { field: 'sellStatus', name: '出售状态' },
        { field: 'sellPrice', name: '出售价格' },
        { field: 'rentOutStatus', name: '租赁状态' },
        { field: 'rentPrice', name: '租赁价格' }
      ];
    }
    case PageType.Rent: {
      return [
        { field: 'resourceId', name: '资源ID' },
        { field: 'resourceName', name: '名称' },
        { field: 'type', name: '类型' },
        { field: 'tokenId', name: 'tokenId' },
        { field: 'rentTime', name: '出售时间' }
      ];
    }
    default:
      return [];
  }
};
export const getInitData = (pageType) => {
  switch (pageType) {
    case PageType.CopyRight:
    case PageType.Purchase:
    case PageType.Rent:
    default:
      return [];
  }
};

