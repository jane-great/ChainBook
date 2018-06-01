pragma solidity ^0.4.24;

import "./ERC721.sol";

contract RentAndLeaseBase {
    struct Rent {
        address renter;
        uint256 price;
        uint256 rentTime;
        uint256 beginTime;
    }

    ERC721 public nonFungibleContract;

    uint256 ownerCut;

    mapping(uint256 => Rent) tokenIdToRent;
    mapping(uint256 => address) tokenIdToRenter;
    mapping(uint256 => address) tokenIdToLeaser;

    event RentCreat(uint256 _tokenId, address _renter, uint256 _price, uint256 _rentTime);
    event RentProcess(uint256 _tokenId, uint256 _price, address _leaser);
    event RentSucessful(uint256 _tokenId);
    event RentCancelled(uint256 _tokenId, address _renter);

    function _owns(address _claimant, uint256 _tokenId ) internal returns(bool) {
        return (nonFungibleContract.ownerOf(_tokenId) == _claimant);
    }

    function _escrow(address _owner, uint256 _tokenId) internal {
        nonFungibleContract.transferFrom(_owner, this, _tokenId);
    }
    
    function _transfer(address _renter, uint256 _tokenId) internal {
        nonFungibleContract.transfer(_renter, _tokenId);
    }

    function _isOnRent(Rent _rent) internal view returns(bool) {
        return _rent.beginTime > 0;
    }

    function _cancelRent(uint256 _tokenId, address _renter) internal {
        _removeRent(_tokenId);
        _transfer(_renter, _tokenId);
        RentCancelled(_tokenId, _renter);
    }

    function _removeRent(uint256 _tokenId) internal {
        delete tokenIdToRent[_tokenId];
    }

    function _creatRent(uint256 _tokenId, Rent _rent) internal {
        require(_rent.rentTime >= 1 minutes);
        tokenIdToRent[_tokenId] = _rent;
        tokenIdToRenter[_tokenId] = _rent.renter;
        RentCreat(
            uint256(_tokenId),
            address(_rent.renter),
            uint256(_rent.price),
            uint256(_rent.rentTime)
        );

    }

    function _addRent(uint256 _tokenId, uint256 _price) internal {
        Rent storage rent = tokenIdToRent[_tokenId];
        require(_isOnRent(rent));

        uint256 price = rent.price;
        require(_price >= price);

        address renter = rent.renter;
        _removeRent(_tokenId);

        if(_price > 0) {
            uint256 contractFees = _computeCut(price);
            uint256 sellerProceeds = price - contractFees;

            renter.transfer(sellerProceeds);
        }

        uint256 excessPrice = _price - price;
        msg.sender.transfer(excessPrice);
        RentProcess(_tokenId, price, msg.sender);
    }

    function  _rentSuccess(uint256 _tokenId) internal{
        address  renter = tokenIdToRenter[_tokenId];
        delete tokenIdToRenter[_tokenId];
        _transfer( renter, _tokenId);

    }
    function _computeCut(uint256 _price) internal view returns (uint256) {  
        return _price * ownerCut / 10000;  /// 注意修改safemath
    } 
}