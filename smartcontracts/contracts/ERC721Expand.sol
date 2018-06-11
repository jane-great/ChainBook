pragma solidity ^0.4.21;

import "./ERC721.sol";


contract ERC721Expand is ERC721 {
    // @dev 出租图书
    function creatRent(uint256 _tokenId) external;
    // @dev 出租图书 给 _to
    function rentTo(uint256 _tokenId, address _leaser, uint256 _time) external;
    // 是否正在出租图书
    function isRent(uint256 _tokenId) public view returns(bool);
    // 是否正在租赁
    function isLease(uint256 _tokenId) public view returns(bool);
    // 出售图书
    function creatSell(uint256 _tokenId) external;
    // 是否正在出售图书
    function isSell(uint256 _tokenId) public view returns(bool);
    // 出售完成
    function sellFinish(uint256 _tokenId) external;
    // 取消出售
    function sellCancel(uint256 _tokenId) external;
    // 取消出租
    function rentCancel(uint256 _tokenId) external;
    // 转移token所有权
    function transfer( address _to, uint256 _tokenId) external;
    // 获取token租赁者地址
    function tokenIdToLeaser(uint256 _tokenId) external view returns(address);

}
