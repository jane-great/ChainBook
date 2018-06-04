pragma solidity ^0.4.24;

import "./BookTransaction.sol";
import "./BookCopyrightCreate.sol";

contract BookOwnerShip is BookTransaction {    //
    // 发布图书
    // @param _copyright 版权合约地址
    // @param _price 价格
    // @param _totalAmount 总发行量
    // @param _limitAmount 限制个人拥有最大数量 （ 防止黄牛 ）
    constructor( uint256 _price, uint256 _totalAmount, uint256 _limitAmount) public {
        authorAddress = msg.sender;
        /*copyrightAddress = _copyright;
        BookCopyrightCreate bookCopyright = BookCopyrightCreate(_copyright);
        (bookName, author, authorAddress, ipfsHash, timestamp) = bookCopyright.getCopyright();*/
        price = _price;
        require(_totalAmount == uint32(_totalAmount));     // 发行量不超过 2^32
        require(_limitAmount == uint32(_limitAmount));     // 个人拥有不超过发行量 2^32
        require(_price == uint128(_price));                // 不是天价
        totalAmount = uint32(_totalAmount);
        limitAmount = uint32(_limitAmount);
        _creatBook(authorAddress);                         // 第一本书送给作者
    }

    // 获取书籍版权信息  （ 书名， 作者， 总发行量， ipfsHash, 版权合约地址， 发行时间 )
    function getCopyrightInfo()
        external
        view
        returns (
            string ,
            string ,
            uint256 ,
            string ,
            address ,
            uint256
        )
    {
        return (bookName, author, totalAmount, ipfsHash, copyrightAddress, timestamp);
    }

    // 获取某本书的信息， （交易次数， 租赁次数， 购买时间， 书籍作者， 是否正在出售， 是否等待租赁 )
    function getBookInfo(uint256 _tokenId)
        external
        view
        returns(
            uint256,
            uint256,
            uint256,
            address,
            bool,
            bool
        )
    {
        return(
            books[_tokenId].transactions,
            books[_tokenId].rents,
            books[_tokenId].creatTime,
            bookIndexToOwner[_tokenId],
            bookIndexToSell[_tokenId],
            bookIndexToSell[_tokenId]
        );
    }

    function allowToRead(address _owner, uint256 _tokenId) external view returns(bool) {  // 是否允许阅读
        return( (_owns(_owner, _tokenId) && rentAllowedToAddress[_tokenId] == address(0)) || rentAllowedToAddress[_tokenId] == _owner );
    }

    function ownerOf(uint256 _tokenId) external view returns(address) {    //图书
        address owner = bookIndexToOwner[_tokenId];
        require(owner != address(0));
        return owner;
    }

    function getApproved(uint256 _tokenId) external view returns (address) {
        return bookIndexToApproved[_tokenId];
    }

    function tokenofOwner(address _owner) external view returns(uint256[] ownerTokens){ // 读者拥有的图书
        uint256 tokenCount = balanceOf(_owner);

        if(tokenCount == 0) {
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 totalBooks = publishedAmount();
            uint256 resultIndex = 0;

            uint256 bookId;

            for(bookId = 1; bookId <= totalBooks; bookId++) {
                if(bookIndexToOwner[bookId] == _owner) {
                    result[resultIndex] = bookId;
                    resultIndex++;
                }
            }
        }

        return result;
    }

    function buyFromAuthor(address _buyer) external payable whenNotPaused{    // 从作者购买书籍
        require(balanceOf(msg.sender) < limitAmount);
        require(books.length < totalAmount);
        require(msg.value >= price);
        _creatBook(_buyer);
        authorAddress.transfer(price);
        if(msg.value > price) {
            uint256 excessPrice = msg.value - price;   // safemath ???
            _buyer.transfer(excessPrice);
        }
    }


}
