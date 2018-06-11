pragma solidity ^0.4.24;

import "./AccessControl.sol";
import "./BuyAndSell.sol";
import "./PullPayment.sol";
import "./RentAndLease.sol";


// 交易合约
// 合约想法： 类似一个交易平台，只要获得书籍的基本信息（合约地址，tokenID) 和 一些交易参数（价格，时长） 既可以完成交易。
// 合约说明： 通过获取书籍的合约地址以及tokenId,  通过sha3生成交易index， 实现买卖
// @param  transaction  售卖合约地址
// @param  rentAndLease 租赁合约地址
// @param  newContract  新合约地址
contract Transaction is AccessControl, PullPayment {


    BuyAndSell public buyAndSell;           // 买卖合约地址
    RentAndLease public rentAndLease;       // 租赁合约地址
    Transaction public newContract;         // 新合约地址

    constructor() public {
        ceoAddress = msg.sender;
    }

    function fallback() external payable {

    }

    event Buy(address _contract, uint256 _tokenId, address _buyer);
    event Sell(address _contract, uint256 _tokenId, address _seller);
    event Rent(address _contract, uint256 _tokenId, address _renter);
    event Lease(address _contract, uint256 _tokenId, address _leaser);
    event BuyCancel(address _contract, uint256 _tokenId);
    event RentCancel(address _contract, uint256 _tokenId);

    // @dev 提取账户余额，不只是ceo
    // @notice 所有的转账都使用这一个函数实现，交易过程不产生转账
    function withdraw() external whenNotPaused {
        withdrawPayments();
    }

    // @dev 调用者是否拥有图书
    function _owns(address _contract, uint256 _tokenId) internal view returns(bool) {
        require(_tokenId == uint32(_tokenId));
        ERC721  nonFungibleContract = ERC721(_contract);
        return nonFungibleContract.ownerOf(_tokenId) == msg.sender;
    }

    // @dev token所有权转移
    function _transferToOwner(address _contract, address _to, uint256 _tokenId) internal {
        ERC721Expand  nonFungibleContract = ERC721Expand(_contract);
        nonFungibleContract.transfer(_to, _tokenId);
    }

    // @dev token所有权转移给合约
    function _transferToContract(address _contract, uint256 _tokenId) internal {
        require(_owns(_contract, _tokenId));
        ERC721 nonFungibleContract = ERC721(_contract);
        nonFungibleContract.transferFrom(msg.sender, this, _tokenId);    // 失败，平台尚未授权
    }

    // @dev 设置交易合约地址
    function setBuyAndSell(address _addr) external onlyCEO {
       buyAndSell = BuyAndSell(_addr);
    }


    // @dev 设置租赁合约地址
    function setRentAndLease(address _addr) external onlyCEO {
        rentAndLease = RentAndLease(_addr);
    }

    // @dev 设置新合约地址， 暂停交易
    function setNewAddress(address _addr) external onlyCEO {
        newContract = Transaction(_addr);
        super.pause();
    }


    // 设置买卖费用，只有ceo可以调用
    function setBuyFees(uint256 _price) external onlyCEO {
        buyAndSell.setFees(_price);
    }

    // 设置租赁费用，只有ceo可以调用
    function setLeaseFess(uint256 _price) external onlyCEO {
        rentAndLease.setFees(_price);
    }


    //  判断平台是否授权买卖(租赁)token
    function getApproved(address _contract, uint256 _tokenId) public view returns(bool) {
        ERC721  nonFungibleContract = ERC721(_contract);
        return nonFungibleContract.getApproved(_tokenId) == address(this);
    }

    // 出售图书
    // @param: _contract:  合约地址
    // @param: _tokenId:   tokenId
    // @param: _price:     出售价格
    // @notice: 必须先approve交易合约
    // @return 交易index mapping(index => _contract and _tokenId),外部数据库实现
    function sell(
        address _contract,
        uint256 _tokenId,
        uint256 _price
        )
        external
        whenNotPaused
        returns(bytes32)
    {
        require(getApproved(_contract,_tokenId));   // 平台已经授权买卖
        require(buyAndSell != address(0));
        require(_price == uint128(_price));
        require(_tokenId == uint32(_tokenId));
        ERC721Expand  nonFungibleContract = ERC721Expand(_contract);
        require(nonFungibleContract.ownerOf(_tokenId) == msg.sender);
        _transferToContract(_contract, _tokenId);
        buyAndSell.sell(_contract, _tokenId, _price, msg.sender);
        nonFungibleContract.creatSell(_tokenId);
        emit Sell(_contract, _tokenId, msg.sender);
    }

    // @dev 出租token
    // @notice 合约地址先获权
    // @param: _contract:  合约地址
    // @param: _tokenId:   tokenId
    // @param: _price:     租赁价格
    // @param: _rentTime:  租赁时长
    // @return 交易index（展示给用户）  mapping(index => _contract and _tokenId),外部数据库实现
    function rent(
        address _contract,
        uint256 _tokenId,
        uint256 _price,
        uint256 _rentTime
        )
        external
        whenNotPaused
        returns(bytes32)
    {
        require(rentAndLease != address(0));
        require(_tokenId == uint32(_tokenId));
        require(_price == uint128(_price));
        require(_rentTime >= 1 minutes);
        require(_rentTime == uint128(_rentTime));
        ERC721Expand  nonFungibleContract = ERC721Expand(_contract);
        require(nonFungibleContract.ownerOf(_tokenId) == msg.sender);
        // nonFungibleContract.transferFrom(msg.sender, this, _tokenId);
        rentAndLease.rent(_contract, _tokenId, _price, _rentTime, msg.sender);
        nonFungibleContract.creatRent(_tokenId);
        emit Rent(_contract, _tokenId, msg.sender);
    }


    // function rentFinish(address _contract, uint256 _tokenId) external onlyCEO {
    //     rentAndLease.rentFinish(_contract,_tokenId);
    // }


    // @dev 购买图书
    // @param: _contract:  合约地址
    // @param: _tokenId:   tokenId
    function buy(address _contract, uint256 _tokenId) external payable whenNotPaused {  // 购买token
        require(_tokenId == uint32(_tokenId));
        ERC721Expand  nonFungibleContract = ERC721Expand(_contract);
        uint256  _this;   uint256  _author; uint256  _sender;
        bool  success;    address  sellerAddress;
        (success, sellerAddress, _this, _author, _sender)  = buyAndSell.buy(_contract, _tokenId, msg.value);
        if( success ) {
            asyncSend(this, _this);
            asyncSend(sellerAddress, _author);
            asyncSend(msg.sender, _sender);
        }
        nonFungibleContract.sellFinish(_tokenId);
        nonFungibleContract.transfer(msg.sender, _tokenId);
        emit Buy(_contract, _tokenId, msg.sender);
    }

    // 租赁token
    // @param: _contract:  合约地址
    // @param: _tokenId:   tokenId
    function lease(address _contract, uint256 _tokenId) external payable whenNotPaused {
        ERC721Expand  nonFungibleContract = ERC721Expand(_contract);
        require(_tokenId == uint32(_tokenId));
        uint256  _this;     uint256  _author;  uint256  _sender;
        uint256 _rentTime;  bool  success;     address  renterAddress;
        (success, _rentTime, renterAddress, _this, _author, _sender) = rentAndLease.lease(_contract, _tokenId, msg.sender, msg.value);
        if( success ) {
            asyncSend(this, _this);
            asyncSend(renterAddress, _author);
            asyncSend(msg.sender, _sender);
        }
        nonFungibleContract.rentTo(_tokenId, msg.sender, _rentTime);
        emit Lease(_contract, _tokenId, msg.sender);
    }


    // @dev 取消售卖
    function cancelSell(address _contract, uint256 _tokenId) external {
        require(_tokenId == uint32(_tokenId));
        require(buyAndSell.getSeller(_contract, _tokenId) == msg.sender);
        ERC721Expand  nonFungibleContract = ERC721Expand(_contract);
        buyAndSell.cancelSell(_contract, _tokenId, msg.sender);
        nonFungibleContract.sellCancel(_tokenId);
        nonFungibleContract.transfer(msg.sender, _tokenId);
    }

    // @dev 取消租赁
   function cancelRent(address _contract, uint256 _tokenId) external {
       require(_tokenId == uint32(_tokenId));
       require(rentAndLease.getRenter(_contract, _tokenId) == msg.sender);
       ERC721Expand  nonFungibleContract = ERC721Expand(_contract);
       nonFungibleContract.rentCancel(_tokenId);
       rentAndLease.cancelRent(_contract, _tokenId, msg.sender);
   }

    // @dev 修改售卖价格
    function setSellPrice(address _contract, uint256 _tokenId, uint256 _price) external {
        buyAndSell.setPrice(_contract, _tokenId, _price, msg.sender);

    }

    // @dev 修改出租信息
    function setRentInfo(address _contract, uint256 _tokenId, uint256 _price, uint256 _rentTime) external {
        require(_rentTime == uint128(_rentTime));
        rentAndLease.setPriceAndTime(_contract, _tokenId, _price,_rentTime, msg.sender);
    }

    // @dev 获取售卖信息
    // @return  售卖者地址，  售卖价格，  售卖时间
    function getSellInfo(
        address _contract,
        uint256 _tokenId
        )
        external
        view
        returns(
            address,
            uint256,
            uint256
        )
    {
        return buyAndSell.getSellInfo(_contract, _tokenId);
    }

    // @dev 获取出租信息
    // @return  售卖者地址，  售卖价格，  出租时长，  售卖时间
    function getRentInfo(
        address _contract,
        uint256 _tokenId
        )
        external
        view
        returns(
            address,
            uint256,
            uint256,
            uint256
        )
    {
        return rentAndLease.getRentInfo(_contract, _tokenId);
    }

    // @dev 禁止交易
    function pauseContract() external onlyCEO whenNotPaused {
        super.pause();
    }

    // @dev 恢复交易
    function unpauseContract() external onlyCEO whenPaused {
        super.unpause();
    }

}
