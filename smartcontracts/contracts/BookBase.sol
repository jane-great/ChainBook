pragma solidity ^0.4.21;

import "./AccessControl.sol";

contract BookBase is AccessControl {      // 书籍的基本参数

    event Transfer(address _from, address _to, uint256 _tokenId);
    event Approval(address _from, address _to, uint256 _tokenId);
    event CreatBook(uint256 _tokenId, address _owner);

    struct Book {
        uint64 transactions;    // 买卖次数
        uint64 rents;        // 租赁次数
        uint128 creatTime;    // 发布时间
    }

    Book[] books;   //所有书籍

    // 书籍基本参数
    string public bookName = "WWB";     // 书名
    string public author = "wwb";   // 作者
    uint32 public totalAmount = 1000;   // 总发行量
    uint256 public price;  // 发行价格
    uint256 public limitAmount =  10;    // 设置每个地址最多拥有几本书
    // copyright
    string internal ipfsHash;    // 书本ipfs-hash
    address internal copyrightAddress;    // 版权地址
    address public authorAddress;   // 作者地址
    uint256 timestamp;  // 版权登记时间

    mapping (uint256 => address) public bookIndexToOwner;       // 某本图书的拥有者
    mapping (address => uint256) public ownershipTokenCount;    // 某个地址拥有的图书数量
    mapping (uint256 => address) public bookIndexToApproved;    // 第三方中介地址
    mapping (uint256 => address) public rentAllowedToAddress;   // 租赁图书的地址, 正在出租
    mapping (uint256 => uint256) public bookIndexTorentTime;    // 租赁到期时间
    mapping (uint256 => bool) public bookIndexToSell;           // 是否正在出售
    mapping (uint256 => bool) public bookIndexToRent;           // 是否正在租赁

    function _transfer(address _from, address _to, uint256 _tokenId) internal {
        require(now > bookIndexTorentTime[_tokenId]);
        // require(_to != address(0));
        require(_to != address(this));
        require(!bookIndexToRent[_tokenId]);
        // require(bookIndexToOwner[_tokenId] == msg.sender);
        require(!bookIndexToSell[_tokenId]);
        ownershipTokenCount[_to]++;

        bookIndexToOwner[_tokenId] = _to;

         if (_from != address(0)) {                         // 不是合约产生的
            ownershipTokenCount[_from]--;
            delete rentAllowedToAddress[_tokenId];
            delete bookIndexToApproved[_tokenId];
            delete bookIndexTorentTime[_tokenId];
        }
        emit Transfer(_from, _to, _tokenId);
    }

    function _creatBook(address _owner) internal returns(uint256) {         // 由买家执行
        require(_remain() > 0);                                             // 剩余图书大于0
        Book memory _book = Book(uint64(0),uint64(0),uint128(now));         // 创建图书
        uint256 tokenId = books.push(_book) - 1;
        _transfer(0, _owner, tokenId);                                      // 将图书转移给买家
        emit CreatBook(tokenId, _owner);                                    // 发送图书创建事件
        return tokenId;                                                     // 返回tokenId
    }

      function _remain() public view returns(uint256) {                       // 查询剩余图书
        return totalAmount - books.length;      // safemath???
    }

}
