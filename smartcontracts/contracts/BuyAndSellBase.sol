pragma solidity ^0.4.24;

import "./ERC721Expand.sol";

contract BuyAndSellBase {
    struct Transaction {
        address contractAddress;      // 合约地址 
        uint256 tokenId;             // tokenId
        address seller;             // 卖家
        uint256 price;             // 价格
        uint256 sellTime;         // 售卖时间
    }

    uint256 public buyCut;   // 手续费

    mapping (bytes32 => Transaction) indexToTransaction;  // index 对应的 交易

    event SellCreated(bytes32 _index, Transaction _transaction);    // 交易产生

    event SellSuccessful(bytes32 _index, address _buyer);   // 交易完成

    event AuctionCancelled(bytes32 _index);     // 交易取消

    function _owns(address _contract, address _claimant, uint256 _tokenId) internal view returns(bool) {    // 卖家是否拥有token
        ERC721Expand  nonFungibleContract = ERC721Expand(_contract);
        return (nonFungibleContract.ownerOf(_tokenId) == _claimant) ;
    }

    function _escrow(address _contract, address _owner, uint256 _tokenId) internal {    // 将token所有权转移到合约
        ERC721Expand  nonFungibleContract = ERC721Expand(_contract);
        nonFungibleContract.transferFrom(_owner, this, _tokenId);  
    }  

    function _transfer(address _contract, address _receiver, uint256 _tokenId) internal {   // 将token所有权转移到卖家/买家
        ERC721Expand  nonFungibleContract = ERC721Expand(_contract);
        // nonFungibleContract.transfer(_receiver, _tokenId);  
    }  

    function _addSell(address _contract, uint256 _tokenId, Transaction _transaction) internal {  // 添加买卖交易
        ERC721Expand  nonFungibleContract = ERC721Expand(_contract);
        require(_owns(_contract, _transaction.seller, _tokenId));      // 拥有合约
        nonFungibleContract.approve(this, _tokenId) ;
        _escrow(_contract, _transaction.seller, _tokenId);
        nonFungibleContract.creatSell(_tokenId);

        bytes32 index = _computeIndex(_contract, _tokenId);   
        indexToTransaction[index] = _transaction; 
        
        emit SellCreated(  
            index,
            _transaction  
        );  
    }  

    function _cancelSell(address _contract, uint256 _tokenId, address _seller) internal {    // 交易取消
        bytes32 index = _computeIndex(_contract, _tokenId);
        _removeSell(_contract, _tokenId);  
        _transfer(_contract, _seller, _tokenId);  
        emit AuctionCancelled(index);  
    } 

    function _removeSell(address _contract, uint256 _tokenId) internal {    // 交易下架（完成/取消）
        bytes32 index = _computeIndex(_contract, _tokenId);
        delete indexToTransaction[index];  
    }  

    function _isOnSell(Transaction storage _transaction) internal view returns(bool) {  // token是否正在等待交易
        return (_transaction.sellTime > 0);
    }

    function _buy(address _contract, uint256 _tokenId, uint256 _price) internal returns(uint256) {      // 购买token
        bytes32 index = _computeIndex(_contract, _tokenId);
        Transaction storage transaction = indexToTransaction[index];

        require(_isOnSell(transaction));

        uint256 price = transaction.price;
        require(_price >= price);

        address seller = transaction.seller;

        _removeSell(_contract, _tokenId);

        if(price > 0) {
            uint256 auctioneerCut = _computeCut(price);  
            uint256 sellerProceeds = price - auctioneerCut;  

            seller.transfer(sellerProceeds);
        }
        uint256 buyExcess = _price - price;
        msg.sender.transfer(buyExcess);

        _transfer(_contract, msg.sender, _tokenId);
        emit SellSuccessful(index, msg.sender);

        return price;
    }

    function _computeIndex(address _contract, uint256 _tokenId) internal view returns(bytes32) {    // 计算相应token的index
        return keccak256(_contract, _tokenId);
    }

    function _computeCut(uint256 _price) internal view returns (uint256) {      // 计算平台分红
        return _price * buyCut / 10000;  
    }  
}