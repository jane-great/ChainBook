pragma solidity ^0.4.21;

import "./BuyAndSellBase.sol";

contract BuyAndSell is BuyAndSellBase {

    // @dev 构造函数，初始化ceo地址
    constructor() public {
        ceoAddress = msg.sender;
    }

    function setFees(uint256 _price) external onlyCEO {
        buyCut = _price;
    }

    // @dev 开始售卖
    // @param 合约地址， tokenId, 售卖价格， 售卖人地址
    function sell(
        address _contract,
        uint256 _tokenId,
        uint256 _price,
        address _seller
        )
        external
        onlyWhitelisted
    {
        require(_tokenId == uint32(_tokenId));
        require(_price == uint128(_price));
        Transaction memory transaction = Transaction(_contract, _tokenId, _seller, _price, now);
        _addSell(_contract, _tokenId, transaction);
    }

    // @dev 取消售卖
    // @param 合约地址， tokenId, 调用合约的地址
    function cancelSell(address _contract, uint256 _tokenId, address _sender) external onlyWhitelisted {
        bytes32 index = _computeIndex(_contract, _tokenId);
        Transaction storage transaction = indexToTransaction[index];
        require(_isOnSell(transaction));
        address seller = transaction.seller;
        require(_sender == seller);
        _cancelSell(_contract, _tokenId);
    }

    // @dev 购买token
    // @param 合约地址， tokenId,  购买时候发送的eth数量
    // @return 购买是否成功， 平台所得， 作者所得， 买家所得（多余部分）
    function buy(
        address _contract,
        uint256 _tokenId,
        uint256 _sendAmount
        )
        external
        onlyWhitelisted
        returns(
            bool,
            address,
            uint256,
            uint256,
            uint256
        )
    {       //购买
        require(_tokenId == uint32(_tokenId));
        return _buy(_contract, _tokenId, _sendAmount);
    }

    // @dev 获得交易信息
    // @return  卖家地址， 售卖价格， 售卖时间
    function getSellInfo(
        address _contract,
        uint256 _tokenId
        )
        external
        view
        returns(
            address seller,
            uint256 price,
            uint256 sellTime
        )
    {
        bytes32 index = _computeIndex(_contract, _tokenId);
        Transaction storage transaction = indexToTransaction[index];
        require(_isOnSell(transaction));
        return (transaction.seller, transaction.price, transaction.sellTime);
    }


    // @dev 设置价格
    // @param 合约地址， tokenId, 售卖价格， 合约调用地址
    // @return 新价格
    function setPrice(
        address _contract,
        uint256 _tokenId,
        uint256 _price,
        address _sender
        )
        external
        onlyWhitelisted
        returns(uint256)
    {
        bytes32 index = _computeIndex(_contract, _tokenId);
        Transaction storage transaction = indexToTransaction[index];
        require(_isOnSell(transaction));
        address seller = transaction.seller;
        require(_sender == seller);
        require(uint256(_price) == _price);
        indexToTransaction[index].price = _price;
        return _price;
    }

    function getSeller(address _contract, uint256 _tokenId) external view returns(address) {
        bytes32 index = _computeIndex(_contract, _tokenId);
        return indexToTransaction[index].seller;
    }

}
