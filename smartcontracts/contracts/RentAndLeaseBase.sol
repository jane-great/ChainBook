pragma solidity^0.4.21;

import "./Whitelist.sol";
import "./ERC721Expand.sol";


contract RentAndLeaseBase is Whitelist {

    struct Rent {           // 出租信息
        address _contract;   // 合约地址
        uint256 tokenId;    // tokenId
        address renter;     // 出租人
        address leaser;     // 租赁人地址
        uint256 price;      // 价格
        uint256 rentTime;   // 出租时长
        uint256 beginTime;  // 什么开始出租（不是出租给租赁方的时间）
    }


    uint256 rentCut;                      //  === 平台手续费 ===

    mapping(bytes32 => Rent) IndexToRent;

    event RentCreat(bytes32 _index, Rent _rent);
    // event RentProcess(uint256 _tokenId, uint256 _price, address _leaser);
    // event RentSucessful(uint256 _tokenId);
    event RentCancelled(address _contract, uint256 _tokenId, address _renter);

    // @dev 判断某个地址是否拥有某个token
    // @return true/fasle
    function _owns(
        address _contract,
        address _claimant,
        uint256 _tokenId
        )
        internal
        view
        returns(bool)
    {
        ERC721Expand nonFungibleContract = ERC721Expand(_contract);
        return (nonFungibleContract.ownerOf(_tokenId) == _claimant);
    }

    // // @dev 将token所有权暂存到合约
    // // @notice 必须先获得approve
    // function _escrow(address _contract, address _owner, uint256 _tokenId) internal {
    //     ERC721Expand nonFungibleContract = ERC721Expand(_contract);
    //     nonFungibleContract.transferFrom(_owner, this, _tokenId);
    // }

    // // @dev 转移token所有权
    // function _transfer(address _contract, address _renter, uint256 _tokenId) internal {    // 转移书籍所有者
    //     ERC721Expand nonFungibleContract = ERC721Expand(_contract);
    //     nonFungibleContract.transfer(_renter, _tokenId);
    // }

    // @dev 某个token是否正在等待出租
    function _isOnRent(Rent _rent) internal pure returns(bool) {
        return (_rent.beginTime > 0);
    }

    // @dev 某个token是否正在租赁状态
    function _isOnLease(Rent _rent) internal pure returns(bool) {
        return (_rent.renter != address(0) && _rent.beginTime == 0);
    }

    // @dev 取消租赁
    // @notice 转移token所有权，修改token数据
    // @return 返回取消的index
    function _cancelRent(
        address _contract,
        uint256 _tokenId,
        address _renter
        )
        internal
        returns(bytes32)
    {
        bytes32 index = _computeIndex(_contract, _tokenId);
        // require(_isOnRent(IndexToRent[index]) == false );
        require(IndexToRent[index].renter == _renter);
        delete IndexToRent[index];
        // _transfer(_contract, _renter, _tokenId);
        emit RentCancelled(_contract, _tokenId, _renter);
        return index;
    }

    // @dev 正在租赁， 下架平台租赁， 保留租赁数据和token所有权
    function _removeRent(address _contract, uint256 _tokenId) internal {   // 正在租赁，下架租赁
        bytes32 index = _computeIndex(_contract, _tokenId);
        IndexToRent[index].renter = address(0);
    }


    function _creatRent(
        address _contract,
        uint256 _tokenId,
        Rent _rent
        )
        internal
        returns(bytes32)
    {    // 创建一个租赁合约
        require(_rent.rentTime >= 1 seconds);
        bytes32 index = _computeIndex(_contract, _tokenId);
        IndexToRent[index] = _rent;
        emit RentCreat(
            index,
            _rent
        );
        return index;
    }


    // @dev 租赁token
    // @param ...
    // @return 返回租赁地址
    function _lease(
        address _contract,
        uint256 _tokenId,
        uint256 _price,
        address _leaser
        )
        internal
        returns(
            bool,
            uint256,
            address,
            uint256,
            uint256,
            uint256
            )
    {

        //ERC721Expand  nonFungibleContract = ERC721Expand(_contract);
        //nonFungibleContract.rentTo(_tokenId, _leaser);
        IndexToRent[_computeIndex(_contract, _tokenId)].leaser = _leaser;
        Rent memory _rent = IndexToRent[_computeIndex(_contract, _tokenId)];
        require(_isOnRent(_rent));
        uint256 price = _rent.price;
        require(_price >= price);

        _removeRent(_contract,_tokenId);
        // emit RentProcess(_tokenId, price, msg.sender);
        return (true, _rent.rentTime, _rent.renter, _computeCut(price), price - _computeCut(price), _price - price);
    }

    // @ 租赁成功，删除租赁数据， 归还token
    function  _rentFinish(address _contract, uint256 _tokenId) internal {     // 租赁成功
        // ERC721Expand  nonFungibleContract = ERC721Expand(_contract);
        // nonFungibleContract.rentFinish(_tokenId);
        bytes32 index = _computeIndex(_contract, _tokenId);
        // address renter = IndexToRent[index].renter;
        delete IndexToRent[index];
        // _transfer(_contract, renter, _tokenId);
    }

    // @dev 重新设置价格和时长
    function _reset(
        address _contract,
        uint256 _tokenId,
        uint256 _price,
        uint256 _rentTime,
        address _renter
        )
        internal
    {
        // ERC721Expand nonFungibleContract = ERC721Expand(_contract);
        // require(nonFungibleContract.ownerOf(_tokenId) == _renter);
        bytes32 index = _computeIndex(_contract, _tokenId);
        Rent storage _rent = IndexToRent[index];
        require(_isOnRent(_rent));
        require(_renter == _rent.renter);
        _rent.price = _price;
        _rent.rentTime = _rentTime;
    }


    // @dev 计算平台手续费
    // @param 交易金额
    // @return 平台手续费
    function _computeCut(uint256 _price) internal view returns (uint256) {
        return _price * rentCut / 10000;  /// 注意修改safemath
    }


    // @dev 计算交易index
    // @returns 交易index （通过 合约地址 和 tokenId 进行哈希）
    function _computeIndex(address _contract, uint256 _tokenId) internal pure returns(bytes32) {
        return keccak256(abi.encodePacked(_contract, _tokenId));
    }

}
