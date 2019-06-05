pragma solidity ^0.5.2;

import "../../interfaces/IERC721Receiver.sol";

contract MockERC721Holder is IERC721Receiver {
    function onERC721Received(address, address, uint256, bytes memory) public returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
