pragma solidity^0.4.21;

import "./RentAndLeaseBase.sol";


// @dev 租赁合约
contract RentAndLease is RentAndLeaseBase {

    constructor() public {
        ceoAddress = msg.sender;
    }


    // @dev 发起出租
    // @notice 必须先获得_renter的approve, 或者将token移交到平台
    // @param _price    价格
    // @param _rentTime 出租时长
    // @param _renter   出租人的地址
    // @return 返回index，是否使用再考虑
    function rent(
        address _contract,
        uint256 _tokenId,
        uint256 _price,
        uint256 _rentTime,
        address _renter
        )
        external
        payable
        onlyWhitelisted
        whenNotPaused
        returns(bytes32)
    {
        require(_owns(_contract, _renter, _tokenId));   // 拥有token
        require(_rentTime > 1 seconds);                 // 出租时间大于1s
        require(_price >= 0);
        require(_price == uint128(_price));             // 拒绝超大额交易
        // _escrow(_contract, _renter, _tokenId);       //  ==== 上层实现 ====

        Rent memory newrent = Rent(_contract, _tokenId, _renter, address(0),  _price, _rentTime, now);
        return _creatRent(_contract, _tokenId, newrent);
    }

    // @dev 租赁token
    // @param  _leaser  想要租赁的地址
    function lease(
        address _contract,
        uint256 _tokenId,
        address _leaser,
        uint256 _sendAmount
        )
        external
        payable
        onlyWhitelisted
        whenNotPaused
        returns(
            bool,
            uint256,
            address,
            uint256,
            uint256,
            uint256
            )
    {
        bytes32 index = _computeIndex(_contract, _tokenId);
        Rent storage _rent = IndexToRent[index];
        require(_sendAmount >= _rent.price);
        require(_isOnRent(IndexToRent[index]));
        return _lease(_contract,_tokenId, _sendAmount, _leaser);
    }


    // @dev 获取租赁信息
    // @param  _contract  合约地址
    // @param  _tokenId   tokenId
    // @return 出租人的地址， 出租的价格， 出租的时间， 出租的时长
    function getRentInfo(
        address _contract,
        uint256 _tokenId
        )
        external
        view
        returns
        (
            address,
            uint256,
            uint256,
            uint256
        )
    {
        bytes32 index = _computeIndex(_contract, _tokenId);
        require(_isOnRent(IndexToRent[index]));                 // 正在出租
        Rent storage _rent = IndexToRent[index];
        return (_rent.renter, _rent.price, _rent.beginTime, _rent.rentTime);
    }


    // @dev 取消租赁
    // @param  _renter 发起取消指令的地址
    function cancelRent(
        address _contract,
        uint256 _tokenId,
        address _renter
        )
        external
        onlyWhitelisted
    {
        bytes32 index = _computeIndex(_contract, _tokenId);
        // require(_owns(_contract, _renter,_tokenId));    // _renter 拥有 token
        require(_isOnRent(IndexToRent[index]));         // token 正在平台等待租赁
        _cancelRent(_contract, _tokenId, _renter);      // 取消租赁
    }

    // @dev 卖家重新设置价格和时长
    // @param _price  新价格
    // @param rentTime 新时长
    function setPriceAndTime(
        address _contract,
        uint256 _tokenId,
        uint256 _price,
        uint256 _rentTime,
        address _renter
        )
        external
        onlyWhitelisted
    {
        require(_price == uint128(_price));
        require(_price > 0);
        require(_rentTime > 1 seconds);
        _reset(_contract, _tokenId, _price, _rentTime, _renter);
    }


    function rentFinish(address _contract, uint256 _tokenId) external onlyWhitelisted {
        _rentFinish(_contract,_tokenId);
    }

    // @dev 设置平台手续费
    // @ param  _ownercut 万分之几的手续费
    function setFees(uint256 _ownercut) external onlyCEO {
        rentCut = _ownercut;
    }

    function getRenter(address _contract, uint256 _tokenId) external view returns(address) {
        bytes32 index = _computeIndex(_contract, _tokenId);
        return IndexToRent[index].renter;
    }

}
