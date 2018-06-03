pragma solidity ^0.4.24;

import "./AccessControl.sol";

contract BookBase is AccessControl {      // 书籍的基本参数 
    
    event Transfer(address _from, address _to, uint256 _tokenId);

    event CreatBook(uint256 _tokenId, address _owner);

    struct Book {
        uint64 transactions;    // 买卖次数
        uint64 rents;        // 租赁次数
        uint128 creatTime;    // 发布时间
    }

    Book[] books;   //所有书籍

    // 书籍基本参数
    string internal bookName = "WWB";     // 书名
    string internal author = "wwb";   // 作者
    uint32 internal totalAmount = 1000;   // 总发行量
    uint256 internal price;  // 发行价格
    uint256 internal limitAmount =  10;    // 设置每个地址最多拥有几本书
    // copyright
    string internal ipfsHash;    // 书本ipfs-hash
    address internal copyrightAddress;    // 版权地址
    address internal authorAddress;   // 作者地址
    uint256 timestamp;  // 版权登记时间


    mapping (uint256 => address) public bookIndexToOwner;       // 某本图书的拥有者
    mapping (address => uint256) public ownershipTokenCount;    // 某个地址拥有的图书数量
    mapping (uint256 => address) public bookIndexToApproved;    // 第三方中介地址 
    mapping (uint256 => address) public rentAllowedToAddress;   // 租赁图书的地址, 正在出租
    mapping (uint256 => bool) public bookIndexToSell;         // 是否正在出售
    mapping (uint256 => bool) public bookIndexToRent;         // 是否正在租赁

    function _transfer(address _from, address _to, uint256 _tokenId) internal { 
        ownershipTokenCount[_to]++;
        
        bookIndexToOwner[_tokenId] = _to;

         if (_from != address(0)) {  // 不是合约产生的
            ownershipTokenCount[_from]--;  
            // delete rentAllowedToAddress[_tokenId];  
            delete bookIndexToApproved[_tokenId];  
        }  
        emit Transfer(_from, _to, _tokenId); 
    }

    function _creatBook(address _owner) internal returns(uint256) {       // 由买家执行       
        require(_remain() > 0);
        Book memory _book = Book(uint64(0),uint64(0),uint128(now));
        uint256 tokenId = books.push(_book) - 1;
        _transfer(0, _owner, tokenId);
        emit CreatBook(tokenId, _owner);
        return tokenId; 
    }

    function _remain() public view returns(uint256) {
        return totalAmount - books.length;      // safemath???
    }

}