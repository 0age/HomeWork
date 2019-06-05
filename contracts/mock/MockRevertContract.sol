pragma solidity ^0.5.2;


/**
 * @title Mock Revert Contract
 * @author 0age
 */
contract MockRevertContract {
  constructor() public {
    revert("Here is the revert data.");
  }
}
