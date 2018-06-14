import { ListType } from 'src/config/user/enum';

export const getApiToRow = (listType, raw) => {
  switch (listType) {
    case ListType.CopyRight:
      return raw.reduce((arr, cur) => arr.concat(cur.copyrights), []);
    case ListType.Purchase: 
      return raw.reduce((arr, cur) => arr.concat(cur.purchasedResources), []).map(book => 
        Object.assign(book, {
          __sellStatus: book.sellStatus ? '已出售' : '未出售',
          __rentOutStatus: book.rentOutStatus ? '已出租' : '未出租'
        }));
      // return [{
      //   resourceId: '5b0f597905373eafe9ceed62',
      //   resourceName: '以太坊白皮书',
      //   type: 'book',
      //   tokenId: 'book_contracts_token_id',
      //   sellStatus: 1,
      //   sellPrice: '20.00',
      //   rentOutStatus: 0,
      //   rentPrice: '2.00'
      // }];
    case ListType.Rent:
      // return [{
      //   resourceId: '5b0f597905373eafe9ceed62',
      //   resourceName: '以太坊白皮书',
      //   type: 'book',
      //   tokenId: 'book_contracts_token_id',
      //   rentTime: 30
      // }];
      return raw.reduce((arr, cur) => arr.concat(cur.rentResources), []);
    default:
      return [];
  }
};
export const getApiToRes = () => [];
export const getResToApi = (original) => {
  const data = JSON.parse(JSON.stringify(original));
  return Object.assign(data, {
    authors: data.authors,
    rights: data.rights,
    localUrl: data.localUrl.map(sample => sample.url).join(',')
  });
};
