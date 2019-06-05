pragma solidity ^0.5.2;


/**
 * @title Mock Contract
 * @author 0age
 */
contract MockContract {
  uint256 private _mockVariable;
  
  constructor() public {
    _mockVariable = 1;
  }

  function get() external view returns (uint256) {
    return _mockVariable;
  }

  function destroy() external {
  	selfdestruct(msg.sender);
  }
}
