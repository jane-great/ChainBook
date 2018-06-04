pragma solidity ^0.4.24;

import "./AccessControl.sol";
import "./BuyAndSell.sol";


// 交易合约
// 合约想法： 类似一个交易平台，只要获得书籍的基本信息（合约地址，tokenID) 和 一些交易参数（价格，时长） 既可以完成交易。
// 合约说明： 通过获取书籍的合约地址以及tokenId,  通过sha3生成交易index， 实现买卖
// @param  transaction  售卖合约地址
// @param  rentAndLease 租赁合约地址
// @param  newContract  新合约地址
contract Transaction is AccessControl{


    BuyAndSell public buyAndSell;
    // RentAndLease public rentAndLease;
    Transaction public newContract;


    // function withdraw(address _ceo) external onlyCEO{
    //     transaction.withdraw(_ceo);
    //     // rentAndLease.withdraw(_ceo);
    // }

    // 设置交易合约地址
    function setBuyAndSell(address _addr) external onlyCEO {
       buyAndSell = BuyAndSell(_addr);
    }


    // 设置租赁合约地址
    // function setRentAndLease(address _addr) external onlyCEO {
    //     rentAndLease = RentAndLease(_addr);
    // }


    //购买图书
    // @param: _contract:  合约地址
    // @param: _tokenId:   tokenId
    function buy(address _contract, uint256 _tokenId) external payable whenNotPaused {  // 购买token

        buyAndSell.buy.value(msg.value)(_contract, _tokenId, msg.sender);
    }


    // 设置买卖费用，只有ceo可以调用
    function setBuyFees(uint256 _price) external onlyCEO {
        buyAndSell.setFees(_price);
    }

    // 设置租赁费用，只有ceo可以调用
    function setLeaseFess(uint256 _price) external onlyCEO {

    }

    // function destoryToken(address _contract) external onlyCEO {

    // }


    function cancelSell(address _contract, uint256 _tokenId) external {
        require(_tokenId == uint32(_tokenId));
        buyAndSell.cancelSell(_contract, _tokenId, msg.sender);
    }

    function cancelRent() external {

    }


    // 获取售卖信息
    // 返回  售卖者地址，  售卖价格，  售卖时间
    function getSellInfo(address _contract, uint256 _tokenId) external view returns(address, uint256, uint256){
        buyAndSell.getSellInfo(_contract, _tokenId);
    }

    // 获取出租信息
    // 返回  售卖者地址，  售卖价格，  出租时长，  售卖时间
    function getRentInfo(address _contract, uint256 _tokenId) external view returns(address, uint256, uint256, uint256) {

    }

    // 出售图书
    // @param: _contract:  合约地址
    // @param: _tokenId:   tokenId
    // @param: _price:     出售价格
    function sell(address _contract, uint256 _tokenId,  uint256 _price) external whenNotPaused {
        require(_price == uint128(_price));
        require(_tokenId == uint32(_tokenId));
        ERC721  nonFungibleContract = ERC721(_contract);
        require(nonFungibleContract.ownerOf(_tokenId) == msg.sender);
        buyAndSell.sell(_contract, _tokenId, _price, msg.sender);
    }

    // 出租token
    // @param: _contract:  合约地址
    // @param: _tokenId:   tokenId
    // @param: _price:     租赁价格
    // @param: _rentTime:  租赁时长
    function rent(address _contract, uint256 _tokenId, uint256 _price, uint256 _rentTime) external whenNotPaused {

    }

    // 租赁token
    // @param: _contract:  合约地址
    // @param: _tokenId:   tokenId
    function lease(address _contract, uint256 _tokenId) external payable whenNotPaused {

    }

    // 禁止交易
    function pauseContract() external onlyCEO whenNotPaused {
        super.pause();
    }

    // // 恢复交易
    function unpauseContract() external onlyCEO whenPaused {
        super.unpause();
    }

}
