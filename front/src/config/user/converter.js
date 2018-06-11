import { ListType } from 'src/config/user/enum';

export const getApiToRow = (listType) => {
  switch (listType) {
    case ListType.CopyRight:
      return [{
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
      }];
    case ListType.Purchase:
      return [{
        resourceId: '5b0f597905373eafe9ceed62',
        resourceName: '以太坊白皮书',
        type: 'book',
        tokenId: 'book_contracts_token_id',
        sellStatus: 1,
        sellPrice: '20.00',
        rentOutStatus: 0,
        rentPrice: '2.00'
      }];
    case ListType.Rent:
      return [{
        resourceId: '5b0f597905373eafe9ceed62',
        resourceName: '以太坊白皮书',
        type: 'book',
        tokenId: 'book_contracts_token_id',
        rentTime: 30
      }];
    default:
      return [];
  }
};
export const getApiToRes = () => [];
export const getResToApi = (original) => {
  const data = JSON.parse(JSON.stringify(original));
  return Object.assign(data, {
    authors: JSON.stringify(data.authors),
    rights: JSON.stringify(data.rights),
    samplePath: data.samplePath.map(sample => sample.url).join(',')
  });
};
