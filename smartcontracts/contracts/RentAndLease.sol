pragma solidity ^0.4.24;

import "./RentAndLeaseBase.sol";

contract RentAndLease is RentAndLeaseBase {

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

    function rent(uint256 _tokenId, uint256 _price, uint256 _rentTime, address _renter) external {
        require(_owns(_renter, _tokenId));

        require(msg.sender == address(nonFungibleContract));
        _escrow(_renter, _tokenId);

        Rent memory newrent = Rent(_renter, _price, _rentTime, now);
        // _addRent(_tokenId, newrent);
    }

    function lease(uint256 _tokenId) external payable {

    }

    function getRentInfo(uint256 _tokenId) external view returns(address, uint256, uint256, uint256) {
        require(_isOnRent(tokenIdToRent[_tokenId]));
        Rent storage rent = tokenIdToRent[_tokenId];
        return (rent.renter, rent.price, rent.beginTime, rent.rentTime);
    }

    function cancelRent(uint256 _tokenId, address _renter) external  {
        require(_owns(_renter,_tokenId));
        require(_isOnRent(tokenIdToRent[_tokenId]));
        _cancelRent(_tokenId, _renter);
    }

    function setOwnerCut(uint256 _ownercut) external {
        ownerCut = _ownercut;
    }
}