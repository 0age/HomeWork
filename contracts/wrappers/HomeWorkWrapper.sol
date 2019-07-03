pragma solidity 0.5.9;

import "../openzeppelin-solidity/token/ERC721/ERC721Enumerable.sol";
import "../../interfaces/IERC721Receiver.sol";


contract HomeWorkWrapper is ERC721Enumerable, IERC721Receiver {
  address private constant HOMEWORK = address(
    0x0000000000001b84b1cb32787B0D64758d019317
  );

  // Track HomeWork NFTs that are currently wrapped.
  mapping(uint256 => bool) private _wrapped;

  // Map tokenIds to the tokenId of the HomeWork NFT they wrap.
  mapping(uint256 => uint256) private _wrappers;

  // Wrap NFTs by sending them to this contract via `safeTransferFrom`.
  function onERC721Received(
    address, // operator
    address from,
    uint256 homeworkTokenId,
    bytes calldata data
  )
    external
    returns (bytes4)
  {
    _ensureWrappable(homeworkTokenId);

    // Ensure that the NFT was actually transferred.
    require(
      ERC721Enumerable(HOMEWORK).ownerOf(homeworkTokenId) == address(this),
      "Supplied HomeWork NFT is not owned by this contract."
    );

    // Set owner of the new wrapped token using `from` (empty data) or `data`.
    address owner;
    if (data.length == 0) {
      owner = from;
    } else {
      // Ensure that supplied `data` is the correct length.
      require(
        data.length == 32,
        "Supplied owner must be an ABI-encoded address (last 20 bytes of 32)."
      );

      // Convert beginning of `data` from bytes to address.
      bytes memory dataInMemory = data;
      assembly { owner := mload(add(dataInMemory, 0x20)) }
    }

    _performWrapAndMint(homeworkTokenId, owner);

    // Return the "magic value" required by ERC721.
    return this.onERC721Received.selector;
  }

  // Wrap NFTs via a regular, approval-based method.
  function wrap(uint256 homeworkTokenId, address owner) external {
    _ensureWrappable(homeworkTokenId);

    // Set up the HomeWork ERC721 interface.
    ERC721Enumerable homework = ERC721Enumerable(HOMEWORK);

    // Find the current owner of the supplied NFT.
    address currentOwner = homework.ownerOf(homeworkTokenId);

    // Attempt to transfer the NFT to this contract - requires setting approval.
    homework.transferFrom(currentOwner, address(this), homeworkTokenId);

    _performWrapAndMint(homeworkTokenId, owner);
  }

  // Unwrap NFTs and give back the original HomeWork NFT to the specified owner.
  function unwrap(uint256 tokenId, address owner) external {
    require(
      _isApprovedOrOwner(msg.sender, tokenId),
      "Caller that is not an owner nor approved cannot unwrap HomeWork NFTs."
    );
    
    // Get the tokenId of the wrapped token.
    uint256 homeworkTokenId = _wrappers[tokenId];

    // Perform custom unwrapping logic.
    _unwrap(tokenId);

    // Burn the wrapped token.
    _burn(tokenId);

    // Clear the reference to the wrapped token and the wrapped status.
    delete _wrappers[tokenId];
    delete _wrapped[homeworkTokenId];

    // Attempt to transfer the HomeWork NFT to the designated owner.
    ERC721Enumerable(HOMEWORK).safeTransferFrom(
      address(this),
      owner,
      homeworkTokenId
    );
  }

  // Override this function to perform custom wrapping logic and return tokenId.
  function _wrap(uint256 homeworkTokenId) internal returns (uint256 tokenId) {}

  // Override this function to perform custom unwrapping logic.
  function _unwrap(uint256 tokenId) internal {}

  // Perform checks to ensure that a HomeWork NFT is wrappable.
  function _ensureWrappable(uint256 homeworkTokenId) private view {
    require(
      homeworkTokenId != uint256(0),
      "Cannot wrap a HomeWork NFT with a tokenId equal to 0."
    );

    require(
      !_wrapped[homeworkTokenId],
      "Supplied HomeWork NFT is already wrapped."
    );
  }

  // Process token wrapping; this includes logic specified in `_wrap()`.
  function _performWrapAndMint(uint256 homeworkTokenId, address owner) private {
    // Perform custom wrapping logic and return the new wrapped tokenId.
    uint256 tokenId = _wrap(homeworkTokenId);

    require(
      _wrappers[tokenId] == uint256(0),
      "A wrapped NFT with the computed tokenID already exists."
    );

    // Mint the new wrapped token to the supplied owner.
    _mint(owner, tokenId);

    // Mark the token as wrapped.
    _wrapped[homeworkTokenId] = true;

    // Set a reference to the wrapped token so that it can be unwrapped.
    _wrappers[tokenId] = homeworkTokenId;

    // Call `onERC721Received` on new owner to ensure they can receive NFTs.
    require(
      _checkOnERC721Received(address(0), owner, tokenId, ""),
      "Supplied owner is not a valid ERC721 receiver."
    );
  }
}