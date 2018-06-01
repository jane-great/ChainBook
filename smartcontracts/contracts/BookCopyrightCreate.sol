pragma solidity^0.4.24;

import "./AccessControl.sol";

contract BookCopyrightCreate is AccessControl{      //��Ȩע���Լ

    uint256 public fees = 0;
    string public bookName;
    string public authorName;
    address public authorAddress;
    string public copyrightHash;
    uint256 public timestamp;

    event _RegisterCopyright(string _bookName, string authorName, address _authorAddress, string _copyrightAddress, uint256 _timestamp);

    function setFees(uint256 _fees) external onlyCEO{   // ���ð�Ȩ�ǼǷ���
        fees = _fees;
    }

    function registerCopyright(string _bookName, string _authorName, address _authorAddress, string _copyrightHash) external payable  {  // ע���Ȩ
        require(msg.value >= fees);
        bookName = _bookName;
        authorName = _authorName;
        authorAddress = _authorAddress;
        copyrightHash = _copyrightHash;
        timestamp = now;
        emit _RegisterCopyright(bookName, authorName, authorAddress, copyrightHash, timestamp);
    }

    function getCopyright() external view returns(string, string, address, string, uint256) {  // ��ð�Ȩ��Ϣ
        return (bookName, authorName, authorAddress, copyrightHash, timestamp);
    }
}