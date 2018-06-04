pragma solidity ^0.4.24;

import "./BookBase.sol";
import "./ERC721Expand.sol";

contract BookTransaction is BookBase, ERC721Expand {

    bytes4 constant InterfaceSignature_ERC165 =
        bytes4(keccak256('supportsInterface(bytes4)'));     // erc165标准

    bytes4 constant InterfaceSignature_ERC721 =
        bytes4(keccak256('balanceOf(address)')) ^
        bytes4(keccak256('ownerOf(uint256)')) ^
        bytes4(keccak256('safeTransferFrom(address,address,uint256,bytes)')) ^
        bytes4(keccak256('safeTransferFrom(address,address,uint256)')) ^
        bytes4(keccak256('setApprovalForAll(address,bool)')) ^
        bytes4(keccak256('isApprovedForAll(address,address)')) ^
        bytes4(keccak256('approve(address,uint256)')) ^
        bytes4(keccak256('transferFrom(address,address,uint256)')) ^
        bytes4(keccak256('getApproved(uint256)')) ^
        bytes4(keccak256('tokenURI(uint256)')
        );     // erc165标准

    function supportsInterface(bytes4 _interfaceID) external view returns (bool)    // 是否实现了规定的标准
    {

        return ((_interfaceID == InterfaceSignature_ERC165) || (_interfaceID == InterfaceSignature_ERC721));
    }

    function _owns(address _claimant, uint256 _tokenId) internal view returns(bool) {   // 某个地址是否拥有某本图书, 内部接口
        return bookIndexToOwner[_tokenId] == _claimant;
    }

    function _approvedFor(address _claimant, uint256 _tokenId) internal view returns(bool) {    // 第三方地址（合约）是否被允许调用transfer
        return bookIndexToApproved[_tokenId] == _claimant;
    }

    function _approve(uint256 _tokenId, address _approved) internal {   // 允许第三方地址调用transfer
        bookIndexToApproved[_tokenId] = _approved;
    }

    function balanceOf(address _owner) public view returns(uint256) {   // 某个地址拥有的token数量
        return ownershipTokenCount[_owner];
    }

    function creatSell(uint256 _tokenId) external {  // 书籍等待出售
        bookIndexToSell[_tokenId] = true;
    }

    function isSell(uint256 _tokenId) public view returns(bool) {  // 书籍是否正在出售
        return bookIndexToSell[_tokenId];
    }

    function sellCancel(uint256 _tokenId) external {     // 交易取消
        delete bookIndexToSell[_tokenId];
    }

    function sellFinish(uint256 _tokenId) external {    // 书籍已经出售
        books[_tokenId].transactions++;     // 交易次数+1  safemath???
        delete bookIndexToSell[_tokenId];
    }

    function creatRent(uint256 _tokenId) external {  // 书籍等待出售
        bookIndexToRent[_tokenId] = true;
    }

    function isRent(uint256 _tokenId) public view returns(bool) {  // 书籍等待出售吗
        return bookIndexToRent[_tokenId];
    }

    function rentTo(uint256 _tokenId, address _leaser) external {   // 书籍已经出租
        require(!isRent(_tokenId)) ;
        rentAllowedToAddress[_tokenId] = _leaser;
    }

    function tokenIdToRenter(uint256 _tokenId) external view returns(address) {
        return rentAllowedToAddress[_tokenId];
    }

    function rentCancel(uint256 _tokenId) external {
        delete bookIndexToRent[_tokenId];
        delete rentAllowedToAddress[_tokenId];
    }

    function rentFinish(uint256 _tokenId) external {    // 书籍出租完成
        books[_tokenId].rents++;     // 租赁次数+1  safemath???
        delete bookIndexToRent[_tokenId];
        delete rentAllowedToAddress[_tokenId];
    }


    function transfer(  // 转移书籍所有权
        address _to,
        uint256 _tokenId
    )
    external
    whenNotPaused
    {
        require(_to != address(0));
        require(_to != address(this));
        require(_owns(msg.sender, _tokenId));
        _transfer(msg.sender, _to, _tokenId);
        books[_tokenId].transactions ++;    // safemath ???
    }

    function approve(  // 允许第三方调用transfer
        address _to,
        uint256 _tokenId
    )
        external
        payable
        whenNotPaused
    {
        require(_owns(msg.sender, _tokenId));
        _approve(_tokenId, _to);
        emit Approval(msg.sender, _to, _tokenId);
    }

    function transferFrom(  // 第三方调用transfer
        address _from,
        address _to,
        uint256 _tokenId
    )
        external
        payable
        whenNotPaused
    {
        require(_to != address(0));
        require(_to != address(this));
        require(_approvedFor(msg.sender, _tokenId));
        require(_owns(_from, _tokenId));

        _transfer(_from, _to, _tokenId);
    }


    function publishedAmount() public view returns(uint256) {   //已经发行数量
        return books.length;
    }

}
