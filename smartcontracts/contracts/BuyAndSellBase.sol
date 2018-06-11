pragma solidity ^0.4.21;

import "./ERC721Expand.sol";
import "./Whitelist.sol";
import "./SafeMath.sol";

contract BuyAndSellBase is Whitelist {
    using SafeMath for uint256;

    struct Transaction {
        address contractAddress;      // 合约地址
        uint256 tokenId;              // tokenId
        address seller;               // 卖家
        uint256 price;                // 价格
        uint256 sellTime;             // 售卖时间
    }

    uint256 public buyCut;   // 手续费

    mapping (bytes32 => Transaction) indexToTransaction;             // index 对应的 交易

    event SellCreated(address _contract, uint256 _tokenId, Transaction _transaction);     // 交易产生

    event SellSuccessful(address _contract, uint256 _tokenId, address _buyer);            // 交易完成

    event SellCancelled(address _contract, uint256 _tokenId);                             // 交易取消

    function _owns(address _contract, address _claimant, uint256 _tokenId) internal view returns(bool) {    // 卖家是否拥有token
        ERC721 nonFungibleContract = ERC721(_contract);
        return (nonFungibleContract.ownerOf(_tokenId) == _claimant) ;
    }

    // function _escrow(address _contract, address _owner, uint256 _tokenId) public {    // 将token所有权转移到合约
    //     ERC721Expand  nonFungibleContract = ERC721Expand(_contract);
    //     nonFungibleContract.transferFrom(_owner, this, _tokenId);
    // }

    // function _transfer(address _contract, address _receiver, uint256 _tokenId) internal {   // 将token所有权转移到卖家/买家
    //     ERC721Expand  nonFungibleContract = ERC721Expand(_contract);
    //     nonFungibleContract.transfer(_receiver, _tokenId);
    // }


    // 添加买卖交易
    function _addSell(address _contract, uint256 _tokenId, Transaction _transaction) internal returns(bytes32) {
        ERC721Expand  nonFungibleContract = ERC721Expand(_contract);
        require(_owns(_contract, msg.sender , _tokenId));       // 拥有合约
        require(!nonFungibleContract.isRent(_tokenId));

        bytes32 index = _computeIndex(_contract, _tokenId);             //
        indexToTransaction[index] = _transaction;                       // 登记交易信息

        return index;
        emit SellCreated(                                               // 发送交易事件
            _contract,
            _tokenId,
            _transaction
        );
    }

    function _cancelSell(address _contract, uint256 _tokenId) internal {    // 交易取消
        //ERC721Expand  nonFungibleContract = ERC721Expand(_contract);
        require(_owns(_contract, msg.sender, _tokenId));       // msg.sender 拥有 token
        //require(nonFungibleContract.isSell(_tokenId));      // token 正在售卖
        _removeSell(_contract, _tokenId);                   // 下架售卖
        emit SellCancelled(_contract,_tokenId);                          // 发送交易取消事件
    }

    function _removeSell(address _contract, uint256 _tokenId) internal {    // 交易下架（完成/取消）
        bytes32 index = _computeIndex(_contract, _tokenId);     // 计算交易index
        delete indexToTransaction[index];                       // 删除交易信息
    }

    function _isOnSell(Transaction storage _transaction) internal view returns(bool) {  // token是否正在等待交易
        return (_transaction.sellTime > uint256(10));
    }

    // @dev 购买token
    // @param 合约地址， tokenId,  购买时发送的数量
    // @return 购买是否成功， 平台所得， 作者所得， 买家所得（多余部分）
    function _buy(
        address _contract,
        uint256 _tokenId,
        uint256 _price
        )
        internal
        returns(
            bool,
            address,
            uint256,
            uint256,
            uint256
        )
    {      // 购买token
        bytes32 index = keccak256(abi.encodePacked(_contract, _tokenId));
        Transaction storage transaction = indexToTransaction[index];

        require(_isOnSell(transaction));

        uint256 price = transaction.price;
        require(_price >= price);

        _removeSell(_contract, _tokenId);

        // if(price > 0) {
            // uint256 auctioneerCut = _computeCut(price);
            // uint256 sellerProceeds = price - _computeCut(price);

            // seller.transfer(sellerProceeds);
        // }
        // uint256 buyExcess = _price - price;
        // msg.sender.transfer(buyExcess);

        // _transfer(_contract, msg.sender, _tokenId);

        // ERC721Expand  nonFungibleContract = ERC721Expand(_contract);
        // nonFungibleContract.sellFinish(_tokenId);
        emit SellSuccessful(_contract, _tokenId, msg.sender);

        return (true, transaction.seller, _computeCut(price), price - _computeCut(price), _price - price);
    }

    // @dev 计算index
    function _computeIndex(address _contract, uint256 _tokenId) internal pure returns(bytes32) {
        return keccak256(abi.encodePacked(_contract, _tokenId));
    }

    // @dev 计算平台分成
    function _computeCut(uint256 _price) internal view returns (uint256) {
        return _price.mul(buyCut).div(10000);
    }

}
