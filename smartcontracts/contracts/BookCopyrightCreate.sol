pragma solidity^0.4.24;

import "./AccessControl.sol";

contract BookCopyrightCreate is AccessControl{      //版权注册合约

    uint256 public fees = 0;
    string public bookName;
    string public authorName;
    address public authorAddress;
    string public copyrightHash;
    uint256 public timestamp;

    event _RegisterCopyright(string _bookName, string authorName, address _authorAddress, string _copyrightAddress, uint256 _timestamp);

    function setFees(uint256 _fees) external onlyCEO{   // 设置版权登记费用
        fees = _fees;
    }

    function registerCopyright(string _bookName, string _authorName, address _authorAddress, string _copyrightHash) external payable  {  // 注册版权
        require(msg.value >= fees);
        bookName = _bookName;
        authorName = _authorName;
        authorAddress = _authorAddress;
        copyrightHash = _copyrightHash;
        timestamp = now;
        emit _RegisterCopyright(bookName, authorName, authorAddress, copyrightHash, timestamp);
    }

    function getCopyright() external view returns(string, string, address, string, uint256) {  // 获得版权信息
        return (bookName, authorName, authorAddress, copyrightHash, timestamp);
    }
}