pragma solidity ^0.5.2;


/**
 * @title ERC1412 Batch Transfers For Non-Fungible Tokens
 * @dev the ERC-165 identifier for this interface is 0x2b89bcaa
 */
interface IERC1412 {
  /// @notice Transfers the ownership of multiple NFTs from one address to another address
  /// @param _from The current owner of the NFT
  /// @param _to The new owner
  /// @param _tokenIds The NFTs to transfer
  /// @param _data Additional data with no specified format, sent in call to `_to`  
  function safeBatchTransferFrom(address _from, address _to, uint256[] calldata _tokenIds, bytes calldata _data) external;
  
  /// @notice Transfers the ownership of multiple NFTs from one address to another address
  /// @param _from The current owner of the NFT
  /// @param _to The new owner
  /// @param _tokenIds The NFTs to transfer  
  function safeBatchTransferFrom(address _from, address _to, uint256[] calldata _tokenIds) external; 
}