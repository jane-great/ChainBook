pragma solidity ^0.4.24;

import "./BookTransaction.sol";
import "./BookCopyrightCreate.sol";

contract PublishBook is BookTransaction {
    address public newContractAddress;
    /*
    function PublishBook(address copyright, uint256 _totalAmount,  uint256 _price) public { // 初始化合约
        BookCopyrightCreate bookCopyright = BookCopyrightCreate(copyright);
        
        (bookName, author, authorAddress, copyrightHash, timestamp) = bookCopyright.getCopyright(); 

        price = _price;
        ceoAddress = address(0);

    }
    */
    function buyFromAuthor() external payable whenNotPaused{
        require(books.length < totalAmount);
        require(msg.value > price);
        _creatBook(msg.sender);
    }

    function setNewAddress(address _addr) external onlyCEO{     // 修改合约地址

    }

    function() external payable {   // 回调函数

    }

    function getBookInfo()  // 获取书籍信息
        external 
        view 
        returns (
            string bookName,
            string author,
            uint256 totalAmount,
            string copyright
        )
    {

    }

    function unpause() public onlyCEO whenPaused {  // 暂停合约
        require(buyAndSell != address(0));
        require(rentAndLease != address(0));
        require(newContractAddress == address(0));

        super.unpause();
    }

    function withdrawBalance() external onlyCEO {   // 提取合约收益

    }
}