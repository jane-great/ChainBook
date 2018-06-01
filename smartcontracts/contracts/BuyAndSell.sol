pragma solidity ^0.4.24;

import "./BuyAndSellBase.sol";

contract BuyAndSell is BuyAndSellBase {
    bool public isready = false;
    bytes4 constant InterfaceSignature_ERC721 = bytes4(0x9a20483d);

    function isReady() public view returns(bool) {
        return isready;
    }

    function setERC721Address(address _nftAddress, uint256 _cut) public {
        require(_cut <= 10000);
        ownerCut = _cut;    

        ERC721 candidateContract = ERC721(_nftAddress);  
        require(candidateContract.supportsInterface(InterfaceSignature_ERC721));  
        nonFungibleContract = candidateContract;  
        isready = true;
    }

    function withdrawBalance() external {
        address nftAddress = address(nonFungibleContract);
        require(  
        //    msg.sender == owner ||  
            msg.sender == nftAddress  
        );  
        bool res = nftAddress.send(this.balance); 
    }

    function sell(uint256 _tokenId, uint256 _price, address _seller) external {
        Transaction memory transaction = Transaction(_seller,_price,now);
        _addSellRequest(_tokenId, transaction);
    }

    function cancelSell(uint256 _tokenId, address _seller) external {
        Transaction storage transaction = tokenIdToTransaction[_tokenId];
        require(_isOnSell(transaction));
        address seller = transaction.seller;
        require(_seller == seller);
        _cancelSell(_tokenId, seller);
    }

    function buy(uint256 _tokenId) external payable {
        _buy(_tokenId, msg.value);
        _transfer(msg.sender, _tokenId);
    }

    function getSellInfo(uint256 _tokenId) external view returns
    (
        address seller,
        uint256 price,
        uint256 sellTime
    )
    {
        Transaction storage transaction = tokenIdToTransaction[_tokenId];
        require(_isOnSell(transaction));
        return (transaction.seller, transaction.price, transaction.sellTime);
    }

    function setPrice(uint256 _tokenId, uint256 _price) external {
        Transaction storage transaction = tokenIdToTransaction[_tokenId];
        require(_isOnSell(transaction));
        address seller = transaction.seller;
        require(msg.sender == seller);
        require(uint256(_price) == _price);
        tokenIdToTransaction[_tokenId].price = _price;
    }

}