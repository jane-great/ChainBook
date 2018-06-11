pragma solidity ^0.4.21;

import "./BookBase.sol";
import "./ERC721Expand.sol";

contract BookTransaction is BookBase, ERC721Expand {

    // erc165标准
    bytes4 constant InterfaceSignature_ERC165 =
        bytes4(keccak256('supportsInterface(bytes4)'));

    // erc721标准
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
        );

    // @dev 是否实现了规定的标准
    function supportsInterface(bytes4 _interfaceID) external view returns (bool)
    {

        return ((_interfaceID == InterfaceSignature_ERC165) || (_interfaceID == InterfaceSignature_ERC721));
    }



    // @dev 某个地址是否拥有某本图书, 内部接口
    function _owns(address _claimant, uint256 _tokenId) internal view returns(bool) {
        return bookIndexToOwner[_tokenId] == _claimant;
    }


    // @dev 第三方地址（合约）是否被允许调用transfer
    function _approvedFor(address _claimant, uint256 _tokenId) internal view returns(bool) {
        return bookIndexToApproved[_tokenId] == _claimant;
    }


    // @dev 允许第三方地址(交易平台)调用transfer
    function _approve(uint256 _tokenId, address _approved) internal {
        bookIndexToApproved[_tokenId] = _approved;
    }


    // @dev 某个地址拥有的token数量
    function balanceOf(address _owner) public view returns(uint256) {
        return ownershipTokenCount[_owner];
    }


    // @dev 售卖书籍，所有权将移交第三方平台
    function creatSell(uint256 _tokenId) external {
        // require(getApproved(_tokenId) == msg.sender);
        require(_owns(msg.sender, _tokenId));
        bookIndexToSell[_tokenId] = true;
    }


    // @dev 书籍是否等待出售
    function isSell(uint256 _tokenId) public view returns(bool) {
        return bookIndexToSell[_tokenId];
    }


    // @dev 交易取消
    function sellCancel(uint256 _tokenId) external {
        require(_owns(msg.sender, _tokenId));            // 拥有图书
        delete bookIndexToSell[_tokenId];
    }


    // @dev 书籍已经出售
    function sellFinish(uint256 _tokenId) external {
        require(_owns(msg.sender, _tokenId));
        books[_tokenId].transactions++;     // 交易次数+1  safemath???
        delete bookIndexToSell[_tokenId];
    }

    // @dev 书籍等待出售
    function creatRent(uint256 _tokenId) external {
        // require(_owns(msg.sender, _tokenId));
        require(bookIndexToApproved[_tokenId] == msg.sender);
        bookIndexToRent[_tokenId] = true;
    }

    // @dev 书籍是否正在等待出售
    function isRent(uint256 _tokenId) public view returns(bool) {
        return (bookIndexToRent[_tokenId] && now > bookIndexTorentTime[_tokenId]);
    }

    // @dev 书籍是否正在出售
    function isLease(uint256 _tokenId) public view returns(bool) {
        return now < bookIndexTorentTime[_tokenId];
    }

    function nowTime() external view returns(uint256){
      return now;
    }
    
    function rentTimes(uint256 _tokenId) external view returns(uint256){
      return bookIndexTorentTime[_tokenId];
    }

    function rentTo(uint256 _tokenId, address _leaser, uint256 _time) external {   // 书籍已经出租
        require(!isLease(_tokenId)) ;
        // require(_owns(msg.sender,_tokenId));
        require(bookIndexToApproved[_tokenId] == msg.sender);
        require(_time == uint128(_time));
        delete bookIndexToRent[_tokenId];
        rentAllowedToAddress[_tokenId] = _leaser;
        bookIndexTorentTime[_tokenId] = now + _time;
        books[_tokenId].rents++;
    }

    function tokenIdToLeaser(uint256 _tokenId) external view returns(address) {
        return rentAllowedToAddress[_tokenId];
    }

    // @dev 取消租赁
    function rentCancel(uint256 _tokenId) external {
        require(msg.sender == bookIndexToApproved[_tokenId]);
        require(now > bookIndexTorentTime[_tokenId]);
        delete bookIndexToRent[_tokenId];
        delete rentAllowedToAddress[_tokenId];
    }

    // // @dev 书籍出租完成
    // function rentFinish(uint256 _tokenId) external {
    //     require(_owns(msg.sender,_tokenId));
    //     books[_tokenId].rents++;     // 租赁次数+1  safemath???
    //     delete bookIndexToRent[_tokenId];
    //     delete rentAllowedToAddress[_tokenId];
    // }

    // @dev 转移书籍所有权
    function transfer( address _to, uint256 _tokenId) external
    {
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
        require(_tokenId < publishedAmount());
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
