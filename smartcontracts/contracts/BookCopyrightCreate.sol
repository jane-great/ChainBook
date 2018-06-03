pragma solidity^0.4.24;

import "./AccessControl.sol";

// 版权注册合约
// 合约说明， 由于版权注册登录信息不多，直接生成一个合约， 通过合约地址， 可以获取相关信息
// 作者首先上传资源到服务器，获取ipfs二次哈希，然后调用合约登记版权
// 第二种方案，  版权注册生成合约， 而是在注册合约上面添加数据， 通过合约地址和版权tokenId 获取相关信息
// @param fees  版权注册手续费
// @param bookName  书名
// @param authorName 作者笔名
// @param authorAddress 收款地址
// @ipfsHash  书本ipfs二次哈希
// @timestamp 版权登记时间， 返回从1970到现在的秒数
contract BookCopyrightCreate is AccessControl{      

    uint256 private fees = 0;
    string private bookName;
    string private authorName;
    address private authorAddress;
    string private ipfsHash;
    uint256 private timestamp;

    event _RegisterCopyright(string _bookName, string authorName, address _authorAddress, string _copyrightAddress, uint256 _timestamp);

    function setFees(uint256 _fees) external onlyCEO{   // 设置版权登记费用
        fees = _fees;
    }


    // 注册版权
    // @param  _bookName, _authorName, _authorAddress, _ipfsHash 
    function registerCopyright(string _bookName, string _authorName, address _authorAddress, string _ipfsHash) external payable  {  // 注册版权
        require(msg.value >= fees);
        bookName = _bookName;
        authorName = _authorName;
        authorAddress = _authorAddress;
        ipfsHash = _ipfsHash;
        timestamp = now;
        emit _RegisterCopyright(bookName, authorName, authorAddress, ipfsHash, timestamp);

        if(fees != 0) {
            ceoAddress.transfer(fees);
        }
        
        uint256 excessPrice = msg.value - fees;
        if(excessPrice != 0) {
            msg.sender.transfer(excessPrice);
        }     
    }

    // 获取版权相关信息
    // 返回...
    function getCopyright() external view returns(string, string, address, string, uint256) {  // 获得版权信息
        return (bookName, authorName, authorAddress, ipfsHash, timestamp);
    }
}
