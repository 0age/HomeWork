pragma solidity ^0.5.2;

import "../../interfaces/IHomeWork.sol";


/**
 * @title Mock Reentry Part Two - tries to lock with empty contract deployed
 * @author 0age
 */
contract MockReentryPartTwo {
  constructor() public {
    IHomeWork(0x0000000000001b84b1cb32787B0D64758d019317).lock(
      bytes32(bytes20(address(this))),
      tx.origin
    );
  }
}