pragma solidity ^0.4.24;

import "./BookOwnerShip.sol";

contract BookTransaction is BookOwnerShip {

    function setBuyAndSell(address _addr) external onlyCEO {    //设置买卖合约地址
        buyAndSell = BuyAndSell(_addr);
    }

    function setRentAndLease(address _addr) external onlyCEO {  // 设置租赁合约地址
        rentAndLease = RentAndLease(_addr);
    }

    function creatSell(uint256 _bookId, uint256 _price) external whenNotPaused{  // 售卖图书
        buyAndSell.sell(_bookId, _price, msg.sender);
    }

    function creatRent(uint256 _bookId, uint256 _price, uint256 _duration) external whenNotPaused{  // 出租图书
        rentAndLease.rent(_bookId, _price, _duration, msg.sender);
    }

    function buy(uint256 _bookId) external payable whenNotPaused {  // 购买图书
        // buyAndSell.buy(_tokenId); 
    }

    function lease(uint256 _bookId) external payable whenNotPaused {    // 租赁图书
        // rentAndLease.lease(_bookId);
    }

    function cancelSell(uint256 _tokenId) external {  // 取消售卖
        buyAndSell.cancelSell(_tokenId, msg.sender);
    }

    function cancelRent(uint256 _tokenId) external {    // 取消租赁
        rentAndLease.cancelRent(_tokenId, msg.sender);
    }

    function getSellBook(address _addr) external view returns(uint256[]) {  // 查看正在售卖的图书

    }

    function getRentBook(address _addr) external view returns(uint256[]) {  // 查看正在出租的图书

    }
    
    function getLeaseBook(address _addr) external view returns(uint256[]) {  //查看正在租赁的图书  
        
    }

    function getSellBookInfo(uint256 _tokenId) external view returns(address seller, uint256 price, uint256 sellTime) {   // 查看售卖图书信息
        return buyAndSell.getSellInfo(_tokenId);
    }

    function getRentBookInfo(uint256 _tokenId) external view returns(address _renter, uint256 price, uint256 beginTime, uint256 rentTime) {   // 查看出租图书信息
        return rentAndLease.getRentInfo(_tokenId);
    }
    
    function getLeaseBookInfo(uint256 _tokenId) external view returns(uint256 price, address seller, uint256 rentTime, uint256 beginTime) {
        
    }

    function withdrawContractBalances() external onlyCEO {      // 提取收益

    }

}