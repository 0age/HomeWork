pragma solidity ^0.5.2;

import "../../interfaces/IHomeWork.sol";


/**
 * @title Mock Reentry Part One - deploys an empty contract on HomeWork
 * @author 0age
 */
contract MockReentryPartOne {
  constructor() public {
    bytes memory emptyContractInitCode = hex"6000";
    IHomeWork(0x0000000000001b84b1cb32787B0D64758d019317).deploy(
      bytes32(bytes20(address(this))),
      emptyContractInitCode
    );
    selfdestruct(tx.origin);
  }
}