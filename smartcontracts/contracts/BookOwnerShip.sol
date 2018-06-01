pragma solidity ^0.4.24;

import "./ERC721.sol";
import "./BookBase.sol";

contract BookOwnerShip is BookBase, ERC721 {

    bytes4 constant InterfaceSignature_ERC165 =  
        bytes4(keccak256('supportsInterface(bytes4)'));

    bytes4 constant InterfaceSignature_ERC721 =  
        bytes4(keccak256('name()')) ^  
        bytes4(keccak256('symbol()')) ^  
        bytes4(keccak256('totalSupply()')) ^  
        bytes4(keccak256('balanceOf(address)')) ^  
        bytes4(keccak256('ownerOf(uint256)')) ^  
        bytes4(keccak256('approve(address,uint256)')) ^  
        bytes4(keccak256('transfer(address,uint256)')) ^  
        bytes4(keccak256('transferFrom(address,address,uint256)')) ^  
        bytes4(keccak256('tokensOfOwner(address)')) ^  
        bytes4(keccak256('tokenMetadata(uint256,string)')); 

    function supportsInterface(bytes4 _interfaceID) external view returns (bool)  
    {   
  
        return ((_interfaceID == InterfaceSignature_ERC165) || (_interfaceID == InterfaceSignature_ERC721));  
    } 

    // function getCopyright() external view returns(string, string, string, address, uint256) {
    //   return copyright.getCopyright();
    // }
    
    function _owns(address _claimant, uint256 _tokenId) internal view returns(bool) {
        return bookIndexToOwner[_tokenId] == _claimant;
    }

    function _approvedFor(address _claimant, uint256 _tokenId) internal view returns(bool) {
        return bookIndexToApproved[_tokenId] == _claimant;
    }

    function _approve(uint256 _tokenId, address _approved) internal {
        bookIndexToApproved[_tokenId] = _approved;
    }

    function balanceOf(address _owner) public view returns(uint256) {
        return ownershipTokenCount[_owner];
    }

    function name() public view returns (string) {
        return bookName;
    }

    function symbol() public view returns (string) {
        return author;
    }

    function transfer(
        address _to,
        uint256 _tokenId
    )
    external
    whenNotPaused 
    {
        require(_to != address(0));  
        require(_to != address(this));  
        require(_to != address(buyAndSell));  
        require(_to != address(rentAndLease)); 
        require(_owns(msg.sender, _tokenId));  
        _transfer(msg.sender, _to, _tokenId); 
    }

    function approve(  // 允许第三方调用transfer
        address _to,  
        uint256 _tokenId  
    )  
        external  
        whenNotPaused  
    {  
        require(_owns(msg.sender, _tokenId));    
        _approve(_tokenId, _to);   
        Approval(msg.sender, _to, _tokenId);  
    } 

    function transferFrom(  // 第三方调用transfer
        address _from,  
        address _to,  
        uint256 _tokenId  
    )  
        external  
        whenNotPaused  
    {  
        require(_to != address(0));  
        require(_to != address(this));  
        require(_approvedFor(msg.sender, _tokenId));  
        require(_owns(_from, _tokenId));  
   
        _transfer(_from, _to, _tokenId);  
    }  

    function totalSupply() public view returns(uint256) {   //总发行量
        return totalAmount;
    }

    function publishedAmount() public view returns(uint256) {   //已经发行数量
        return books.length;
    }

    function ownerOf(uint256 _tokenId) external view returns(address owner){    //图书作者
        owner = bookIndexToOwner[_tokenId];
        require(owner != address(0));
    } 

    function tokenofOwner(address _owner) external view returns(uint256[] ownerTokens){ // 读者拥有的图书
        uint256 tokenCount = balanceOf(_owner);

        if(tokenCount == 0) {
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 totalBooks = publishedAmount();
            uint256 resultIndex = 0;

            uint256 bookId;

            for(bookId = 1; bookId <= totalBooks; bookId++) {
                if(bookIndexToOwner[bookId] == _owner) {
                    result[resultIndex] = bookId;
                    resultIndex++;
                }
            }
        }

        return result;
    }

    function tokenInRent(address _owner) external view returns(uint256[] ownerRentToken) {      // 读者租出的图书

    }

    //function tokenMetadata()

}