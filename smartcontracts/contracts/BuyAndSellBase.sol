pragma solidity ^0.4.24;

import "./ERC721.sol";

contract BuyAndSellBase {
    struct Transaction {
        address seller;
        uint256 price;
        uint256 sellTime;
    }

    ERC721 public nonFungibleContract;

    uint256 ownerCut;   // 手续费

    mapping (uint256 => Transaction) tokenIdToTransaction;

    event SellCreated(uint256 tokenId, uint256 price, address seller, uint256 sellTime);

    event SellSuccessful(uint256 tokenId, uint256 price, address buyer);

    event AuctionCancelled(uint256 tokenId);

    function _owns(address _claimant, uint256 _tokenId) internal view returns(bool) {
        return (nonFungibleContract.ownerOf(_tokenId) == _claimant) ;
    }

    function _escrow(address _owner, uint256 _tokenId) internal {  
        nonFungibleContract.transferFrom(_owner, this, _tokenId);  
    }  

    function _transfer(address _receiver, uint256 _tokenId) internal {  
        nonFungibleContract.transfer(_receiver, _tokenId);  
    }  

    function _addSellRequest(uint256 _tokenId, Transaction _transaction) internal {     
        tokenIdToTransaction[_tokenId] = _transaction;  
  
        SellCreated(  
            uint256(_tokenId),  
            uint256(_transaction.price),
             _transaction.seller , 
            now       
        );  
    }  

    function _cancelSell(uint256 _tokenId, address _seller) internal {  
        _removeSell(_tokenId);  
        _transfer(_seller, _tokenId);  
        AuctionCancelled(_tokenId);  
    } 

    function _removeSell(uint256 _tokenId) internal {  
        delete tokenIdToTransaction[_tokenId];  
    }  

    function _isOnSell(Transaction storage _transaction) internal view returns(bool) {
        return (_transaction.sellTime > 0);
    }

    function _buy(uint256 _tokenId, uint256 _price) internal returns(uint256) {
        Transaction storage transaction = tokenIdToTransaction[_tokenId];

        require(_isOnSell(transaction));

        uint256 price = transaction.price;
        require(_price >= price);

        address seller = transaction.seller;

        _removeSell(_tokenId);

        if(price > 0) {
            uint256 auctioneerCut = _computeCut(price);  
            uint256 sellerProceeds = price - auctioneerCut;  

            seller.transfer(sellerProceeds);
        }

        uint256 buyExcess = _price - price;
        msg.sender.transfer(buyExcess);

        SellSuccessful(_tokenId, price, msg.sender);

        return price;
    }

    function _computeCut(uint256 _price) internal view returns (uint256) {  
        return _price * ownerCut / 10000;  
    }  
}