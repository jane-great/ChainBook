pragma solidity ^0.4.21;

import "./AccessControl.sol";


// @dev 版权注册合约
// @dev 合约说明， 由于版权注册登录信息不多，直接生成一个合约， 通过合约地址， 可以获取相关信息
// @dev 作者首先上传资源到服务器，获取ipfs二次哈希，然后调用合约登记版权
// @dev 第二种方案，  版权注册不生成合约， 而是在注册合约上面添加数据， 通过合约地址和版权tokenId 获取相关信息，一个版权就是一个ERC721
// @param fees  版权注册手续费
// @param bookName  书名
// @param authorName 作者笔名
// @param authorAddress 收款地址
// @param ipfsHash  书本ipfs二次哈希
// @param timestamp 版权登记时间， 返回从1970到现在的秒数
// @function setFees  设置版权注册费用
// @function registerCopyright 注册版权
// @function getCopyrightInfo 获取版权信息
contract BookCopyrightCreate is AccessControl{           //目前的合约编写均没有考虑到其安全性和健壮性

    constructor() public {
        ceoAddress = msg.sender;
    }

    uint256 public fees = 0;
    uint256 private bookNum = 0;     //每次添加书籍时,都需要使用set函数,使其加1

    string private bookName;
    string private authorName;
    address private authorAddress;
    string private ipfsHash;
    uint256 private timestamp;

    struct bookCopyRight{
        string bookName;
        string authorName;
        address authorAddress;
        string ipfsHash;
        uint256 timestamp;
    }

    bookCopyRight[] private bookCopyrights;

    event _RegisterCopyright(string _bookName, string authorName, address _authorAddress, uint256 _newBookCopyrightId, uint256 _timestamp);

    function setFees(uint256 _fees) external onlyCEO{   // 设置版权登记费用
        fees = _fees;
    }

    function getFees() external view returns(uint256) {
      return fees;
    }

    function getBookNum() external view returns(uint256) {   //获得已获得当前书籍版权个数
        return bookNum;
    }

    function setBookNum(uint256 _bookNum) external onlyCEO {
        bookNum = _bookNum;
    }

    // 注册版权
    // @param  _bookName, _authorName, _authorAddress, _ipfsHash
    function registerCopyright(
        string _bookName,
        string _authorName,
        address _authorAddress,
        string _ipfsHash
        )
        external
        payable
        returns (uint256)
    {  // 注册版权
        require(msg.value >= fees);
        uint256 timestamp_now = now;
        bookCopyRight memory _bookCopyRight = bookCopyRight({
            bookName: _bookName,
            authorName: _authorName,
            authorAddress: _authorAddress,
            ipfsHash: _ipfsHash,
            timestamp: timestamp_now
        });


        //uint256 newBookCopyrightId = bookCopyrights.length - 1;
        uint256 newBookCopyrightId  = bookCopyrights.push(_bookCopyRight)-1;
        emit _RegisterCopyright(_bookName, _authorName, _authorAddress, newBookCopyrightId, timestamp_now);

        if(fees != 0) {                              //记录版权所需要消耗的费用
            ceoAddress.transfer(fees);
        }

        uint256 excessPrice = msg.value - fees;
        if(excessPrice != 0) {
            msg.sender.transfer(excessPrice);
        }
        bookNum++;
        return newBookCopyrightId;     //这个版权的ID需要存储在图书中,需要在js的后端来进行实现
    }

    // @dev 获取版权相关信息
    // @return 书名， 作者笔名， 作者地址（用于收款）， ipfsHash， 登记时间
    function getCopyright(uint256 BookCopyrightId)
        external
        view
        returns(
            string,
            string,
            address,
            string,
            uint256
        )
    {  // 获得版权信息
        return (bookCopyrights[BookCopyrightId].bookName, bookCopyrights[BookCopyrightId].authorName, bookCopyrights[BookCopyrightId].authorAddress, bookCopyrights[BookCopyrightId].ipfsHash, bookCopyrights[BookCopyrightId].timestamp);
    }

}
