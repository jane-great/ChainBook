pragma solidity^0.4.24;

contract AccessControl{
    address public ceoAddress = address(0);
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