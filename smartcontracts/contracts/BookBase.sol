pragma solidity ^0.4.24;

import "./AccessControl.sol";
import "./BuyAndSell.sol";
import "./RentAndLease.sol";

contract BookBase is AccessControl {
    
    event Transfer(address _from, address _to, uint256 _tokenId);

    event CreatBook(uint256 bookamount);

    struct Book {
        uint64 transactions;    //交易次数
        uint256 publishTime;    //发布时间
    }

    Book[] books;   //所有书籍
    string public bookName = "test";
    string public author = "wwb";
    uint32 public totalAmount = 1000;
    string public copyrightHash;
    address public authorAddress;
    uint256 timestamp;
    uint256 price;

    mapping (uint256 => address) public bookIndexToOwner;  // 某本图书的拥有者
    mapping (address => uint256) public ownershipTokenCount;  // 某个地址拥有的图书数量
    mapping (uint256 => address) public bookIndexToApproved;  // 第三方中介地址 
    mapping (uint256 => address) public rentAllowedToAddress;   // 租赁图书的地址

    BuyAndSell public buyAndSell;   //出租合约
    RentAndLease public rentAndLease;   //租入合约

    function _transfer(address _from, address _to, uint256 _tokenId) internal {  
        ownershipTokenCount[_to]++;
        bookIndexToOwner[_tokenId] = _to;

         if (_from != address(0)) {  // 不是合约产生的
            ownershipTokenCount[_from]--;  
            delete rentAllowedToAddress[_tokenId];  
            delete bookIndexToApproved[_tokenId];  
        }  
        Transfer(_from, _to, _tokenId); 
    }


    function _creatBook(address _owner) internal returns(uint256) {       // 由买家执行       
        Book memory _book = Book(0,now);
        uint256 bookId = books.push(_book) - 1;
        _transfer(0, _owner, bookId);
        return books.length - 1; 
    }

    function _remain() public view returns(uint256) {
        return totalAmount - books.length;      // safemath???
    }

}