pragma solidity ^0.5.2;


/**
 * @title Mock ERC20 Stub (just for testing token recovery)
 * @author 0age
 */
contract MockERC20Stub {
  event Transfer(address indexed from, address indexed to, uint256 value);

  address private _balanceHolder;

  function balanceOf(address who) external view returns (uint256) {
    return (_balanceHolder == address(0) || _balanceHolder == who) ? 1 : 0;
  }

  function transfer(address to, uint256 value) external returns (bool) {
    assert(value <= 1);
  	if (
      value == 1 &&
      (_balanceHolder == address(0) || _balanceHolder == msg.sender)
    ) {
      _balanceHolder = to;
    }
    emit Transfer(msg.sender, to, value);
  }
}