pragma solidity^0.4.21;

// @dev 权限控制合约
// @function setCEO  重新设置ceo地址
// @function pause   暂停合约流通（买卖/租赁）
// @function unpause 开放合约流通
contract AccessControl{
    address public ceoAddress;     // make sure this is a mainnet account
    bool public paused;
    modifier onlyCEO() {
        require(msg.sender == ceoAddress);
        _;
    }
    function setCEO(address _newCEO) external onlyCEO {
        require(_newCEO != address(0));
        ceoAddress = _newCEO;
    }
    modifier whenNotPaused() {
        require(!paused);
        _;
    }
    modifier whenPaused {
        require(paused);
        _;
    }
    function pause() public onlyCEO whenNotPaused {
        paused = true;
    }
    function unpause() public onlyCEO whenPaused {
        paused = false;
    }
}
