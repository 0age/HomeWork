pragma solidity ^0.5.9;

import "../wrappers/HomeWorkWrapper.sol";


contract MockHomeWorkWrapper is HomeWorkWrapper {
  uint256 private _nonce;

  function _wrap(uint256) internal returns (uint256) {
    _nonce++;
    return _nonce;
  }
}