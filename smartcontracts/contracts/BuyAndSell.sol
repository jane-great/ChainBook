pragma solidity ^0.4.24;

import "./BuyAndSellBase.sol";


contract BuyAndSell is BuyAndSellBase {

    function withdrawBalance() external {
        // require(
        //   //  msg.sender == owner ||
        //     msg.sender == nftAddress
        // );
        // nftAddress.send(this.balance);
    }

    function setFees(uint256 _price) external { // === onlyCEO ===
        buyCut = _price;
    }

    function sell(address _contract, uint256 _tokenId, uint256 _price, address _seller) external {     // 出售
        Transaction memory transaction = Transaction(_contract, _tokenId, _seller, _price, now);
        _addSell(_contract, _tokenId, transaction);
    }

    function cancelSell(address _contract, uint256 _tokenId, address _seller) external {       // 取消出售
        bytes32 index = _computeIndex(_contract, _tokenId);
        Transaction storage transaction = indexToTransaction[index];
        require(_isOnSell(transaction));
        address seller = transaction.seller;
        require(_seller == seller);
        _cancelSell(_contract, _tokenId, seller);
    }

    function buy(address _contract, uint256 _tokenId, address _buyer) external payable {       //购买
        _buy(_contract, _tokenId, msg.value);
        _transfer(_contract, _buyer, _tokenId);

    }

    function getSellInfo(address _contract, uint256 _tokenId) external view returns    // 获得交易信息
    (
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

    function setPrice(address _contract, uint256 _tokenId, uint256 _price) external {   // 设置价格
        bytes32 index = _computeIndex(_contract, _tokenId);
        Transaction storage transaction = indexToTransaction[index];
        require(_isOnSell(transaction));
        address seller = transaction.seller;
        require(msg.sender == seller);
        require(uint256(_price) == _price);
        indexToTransaction[index].price = _price;
    }
}
