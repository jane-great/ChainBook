pragma solidity ^0.4.24;

import "./ERC721.sol";


contract ERC721Expand is ERC721 {
    function creatRent(uint256 _tokenId) external;                             // 出租图书
    function rentTo(uint256 _tokenId, address _leaser) external;               // 出租图书 给 _to
    function isRent(uint256 _tokenId) public view returns(bool);               // 是否正在出租图书
    function rentFinish(uint256 _tokenId) external;                            // 出租完成
    function creatSell(uint256 _tokenId) external;                             // 出售图书
    function isSell(uint256 _tokenId) public view returns(bool);               // 是否正在出售图书
    function sellFinish(uint256 _tokenId) external;                            // 出售完成
     function sellCancel(uint256 _tokenId) external;
    function transfer( address _to, uint256 _tokenId) external;
    function tokenIdToRenter(uint256 _tokenId) external view returns(address);

}
