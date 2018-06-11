pragma solidity ^0.4.21;

import "./BookTransaction.sol";
import "./BookCopyrightCreate.sol";

// @dev 书籍合约
// @function constructor 构造函数，初始化合约参数，初始化的同时赋予作者tokenId为0的图书
// @function destoryContract 合约自毁，防止侵权,只有ceo可以调用
// @function getCopyrightInfo  获得书籍相关信息
// @function getBookInfo 获得某本书的信息
// @function allowToRead 判断某个地址是否可以阅读（ 拥有图书 / 租赁图书）
// @function tokenOfOwner 某本书(tokenId)对应的拥有者
// @function buyFromAuthor  从作者那里购买图书，购买的同时初始化图书，将图书所有权赋给购买者
contract BookOwnerShip is BookTransaction {    //
    // 发布图书
    // @param _copyright 版权合约地址
    // @param _price 价格
    // @param _totalAmount 总发行量
    // @param _limitAmount 限制个人拥有最大数量 （ 防止黄牛 ）
    constructor(
        address _copyright,
        uint256 _copyrightId,
        uint256 _price,
        uint256 _totalAmount,
        uint256 _limitAmount
        )
        public
    {
        copyrightAddress = _copyright;
        BookCopyrightCreate bookCopyright = BookCopyrightCreate(_copyright);
        (bookName, author, authorAddress, ipfsHash, timestamp) = bookCopyright.getCopyright(_copyrightId);
        price = _price;
        require(_totalAmount == uint32(_totalAmount));     // 发行量不超过 2^32
        require(_limitAmount == uint32(_limitAmount));     // 个人拥有不超过发行量 2^32
        require(_price == uint128(_price));                // 不是天价
        totalAmount = uint32(_totalAmount);
        limitAmount = uint32(_limitAmount);
        // ceoAddress = address();                          // ==== 部署主网时填写 ====
        _creatBook(msg.sender);                         // 第一本书送给作者
    }

    // 销毁合约
    function destoryContract(address _owner) external onlyCEO {
        selfdestruct(_owner);
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
            bookIndexToRent[_tokenId]
        );
    }

    function allowToRead(address _owner, uint256 _tokenId) external view returns(bool) {  // 是否允许阅读
        return(
            (_owns(_owner, _tokenId) && !isLease(_tokenId))                               // 拥有图书，并且图书尚未租赁
            || ( rentAllowedToAddress[_tokenId] == _owner || isLease(_tokenId))           // 租赁图书，并且尚未过期
        );
    }

    function ownerOf(uint256 _tokenId) external view returns(address) {    //图书
        address owner = bookIndexToOwner[_tokenId];
        require(owner != address(0));
        return owner;
    }


    // 查询某个token的授权者
    function getApproved(uint256 _tokenId) external view returns (address) {
        return bookIndexToApproved[_tokenId];
    }

    // 读者拥有的图书
    function tokenofOwner(address _owner) external view returns(uint256[] ownerTokens){
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

    // @dev 作者调整书本价格
    function setPrice(uint256 _price) external {
        require(authorAddress == msg.sender);
        require(_price == uint128(_price));
        price = _price;
    }

    // @dev 获取发行价格
    function getPrice() external view returns(uint256){
      return price;
    }

    function getAuthorAddress() external view returns(address) {
      return authorAddress;
    }

    // @dev 作者换新地址
    function setNewAuthorAddress(address _newAddress) external {
        require(msg.sender == authorAddress);
        require(_newAddress != address(0));
        authorAddress = _newAddress;
    }

    // @dev 从作者购买书籍
    function buyFromAuthor() external payable whenNotPaused returns(uint256) {
        require(balanceOf(msg.sender) < limitAmount);
        require(books.length < totalAmount);
        require(msg.value >= price);
        uint256 _tokenId = _creatBook(msg.sender);
        authorAddress.transfer(price);
        if(msg.value > price) {
            uint256 excessPrice = msg.value - price;   // safemath ???
            msg.sender.transfer(excessPrice);
        }
        return _tokenId;
    }
}
