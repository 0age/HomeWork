pragma solidity 0.5.9; // optimization enabled, runs: 10000, evm: constantinople

import "./IERC20.sol";


/**
 * @title HomeWork Interface (version 1) - EIP165 ID 0xe5399799
 * @author 0age
 * @notice Homework is a utility to find, share, and reuse "home" addresses for
 * contracts. Anyone can work to find a new home address by searching for keys,
 * a 32-byte value with the first 20 bytes equal to the finder's calling address
 * (or derived by hashing an arbitrary 32-byte salt and the caller's address),
 * and can then deploy any contract they like (even one with a constructor) to
 * the address, or mint an ERC721 token that the owner can redeem that will then
 * allow them to do the same. Also, if the contract is `SELFDESTRUCT`ed, a new
 * contract can be redeployed by the current controller to the same address!
 * @dev This contract allows contract addresses to be located ahead of time, and
 * for arbitrary bytecode to be deployed (and redeployed if so desired, i.e.
 * metamorphic contracts) to the located address by a designated controller. To
 * enable this, the contract first deploys an "initialization-code-in-runtime"
 * contract, with the creation code of the contract you want to deploy stored in
 * RUNTIME code. Then, to deploy the actual contract, it retrieves the address
 * of the storage contract and `DELEGATECALL`s into it to execute the init code
 * and, if successful, retrieves and returns the contract runtime code. Rather
 * than using a located address directly, you can also lock it in the contract
 * and mint and ERC721 token for it, which can then be redeemed in order to gain
 * control over deployment to the address (note that tokens may not be minted if
 * the contract they control currently has a deployed contract at that address).
 * Once a contract undergoes metamorphosis, all existing storage will be deleted
 * and any existing contract code will be replaced with the deployed contract
 * code of the new implementation contract. The mechanisms behind this contract 
 * are highly experimental - proceed with caution and please share any exploits
 * or optimizations you discover.
 */
interface IHomeWork {
  // Fires when a contract is deployed or redeployed to a given home address.
  event NewResident(
    address indexed homeAddress,
    bytes32 key,
    bytes32 runtimeCodeHash
  );

  // Fires when a new runtime storage contract is deployed.
  event NewRuntimeStorageContract(
    address runtimeStorageContract,
    bytes32 runtimeCodeHash
  );

  // Fires when a controller is changed from the default controller.
  event NewController(bytes32 indexed key, address newController);

  // Fires when a new high score is submitted.
  event NewHighScore(bytes32 key, address submitter, uint256 score);

  // Track total contract deploys and current controller for each home address.
  struct HomeAddress {
    bool exists;
    address controller;
    uint88 deploys;
  }

  // Track derivation of key for a given home address based on salt & submitter.
  struct KeyInformation {
    bytes32 key;
    bytes32 salt;
    address submitter;
  }

  /**
   * @notice Deploy a new contract with the desired initialization code to the
   * home address corresponding to a given key. Two conditions must be met: the
   * submitter must be designated as the controller of the home address (with
   * the initial controller set to the address corresponding to the first twenty
   * bytes of the key), and there must not be a contract currently deployed at
   * the home address. These conditions can be checked by calling
   * `getHomeAddressInformation` and `isDeployable` with the same key.
   * @param key bytes32 The unique value used to derive the home address.
   * @param initializationCode bytes The contract creation code that will be
   * used to deploy the contract to the home address.
   * @return The home address of the deployed contract.
   * @dev In order to deploy the contract to the home address, a new contract
   * will be deployed with runtime code set to the initialization code of the
   * contract that will be deployed to the home address. Then, metamorphic
   * initialization code will retrieve that initialization code and use it to
   * set up and deploy the desired contract to the home address. Bear in mind
   * that the deployed contract will interpret msg.sender as the address of THIS
   * contract, and not the address of the submitter - if the constructor of the
   * deployed contract uses msg.sender to set up ownership or other variables,
   * you must modify it to accept a constructor argument with the appropriate
   * address, or alternately to hard-code the intended address. Also, if your
   * contract DOES have constructor arguments, remember to include them as
   * ABI-encoded arguments at the end of the initialization code, just as you
   * would when performing a standard deploy. You may also want to provide the
   * key to `setReverseLookup` in order to find it again using only the home
   * address to prevent accidentally losing the key.
   */
  function deploy(bytes32 key, bytes calldata initializationCode)
    external
    payable
    returns (address homeAddress, bytes32 runtimeCodeHash);

  /**
   * @notice Mint an ERC721 token to the supplied owner that can be redeemed in
   * order to gain control of a home address corresponding to a given key. Two
   * conditions must be met: the submitter must be designated as the controller
   * of the home address (with the initial controller set to the address
   * corresponding to the first 20 bytes of the key), and there must not be a
   * contract currently deployed at the home address. These conditions can be
   * checked by calling `getHomeAddressInformation` and `isDeployable` with the
   * same key.
   * @param key bytes32 The unique value used to derive the home address.
   * @param owner address The account that will be granted ownership of the
   * ERC721 token.
   * @dev In order to mint an ERC721 token, the assocated home address cannot be
   * in use, or else the token will not be able to deploy to the home address.
   * The controller is set to this contract until the token is redeemed, at
   * which point the redeemer designates a new controller for the home address.
   * The key of the home address and the tokenID of the ERC721 token are the
   * same value, but different types (bytes32 vs. uint256).
   */
  function lock(bytes32 key, address owner) external;

  /**
   * @notice Burn an ERC721 token to allow the supplied controller to gain the
   * ability to deploy to the home address corresponding to the key matching the
   * burned token. The submitter must be designated as either the owner of the
   * token or as an approved spender.
   * @param tokenId uint256 The ID of the ERC721 token to redeem.
   * @param controller address The account that will be granted control of the
   * home address corresponding to the given token.
   * @dev The controller cannot be designated as the address of this contract,
   * the null address, or the home address (the restriction on setting the home
   * address as the controller is due to the fact that the home address will not
   * be able to deploy to itself, as it needs to be empty before a contract can
   * be deployed to it).
   */
  function redeem(uint256 tokenId, address controller) external;

  /**
   * @notice Transfer control over deployment to the home address corresponding
   * to a given key. The caller must be designated as the current controller of
   * the home address (with the initial controller set to the address
   * corresponding to the first 20 bytes of the key) - This condition can be
   * checked by calling `getHomeAddressInformation` with the same key.
   * @param key bytes32 The unique value used to derive the home address.
   * @param controller address The account that will be granted control of the
   * home address corresponding to the given key.
   * @dev The controller cannot be designated as the address of this contract,
   * the null address, or the home address (the restriction on setting the home
   * address as the controller is due to the fact that the home address will not
   * be able to deploy to itself, as it needs to be empty before a contract can
   * be deployed to it).
   */
  function assignController(bytes32 key, address controller) external;

  /**
   * @notice Transfer control over deployment to the home address corresponding
   * to a given key to the null address, which will prevent it from being
   * deployed to again in the future. The caller must be designated as the
   * current controller of the corresponding home address (with the initial
   * controller set to the address corresponding to the first 20 bytes of the
   * key) - This condition can be checked by calling `getHomeAddressInformation`
   * with the same key.
   * @param key bytes32 The unique value used to derive the home address.
   */
  function relinquishControl(bytes32 key) external;

  /**
   * @notice Burn an ERC721 token, set a supplied controller, and deploy a new
   * contract with the supplied initialization code to the corresponding home
   * address for the given token. The submitter must be designated as either the
   * owner of the token or as an approved spender.
   * @param tokenId uint256 The ID of the ERC721 token to redeem.
   * @param controller address The account that will be granted control of the
   * home address corresponding to the given token.
   * @param initializationCode bytes The contract creation code that will be
   * used to deploy the contract to the home address.
   * @return The home address and runtime code hash of the deployed contract.
   * @dev In order to deploy the contract to the home address, a new contract
   * will be deployed with runtime code set to the initialization code of the
   * contract that will be deployed to the home address. Then, metamorphic
   * initialization code will retrieve that initialization code and use it to
   * set up and deploy the desired contract to the home address. Bear in mind
   * that the deployed contract will interpret msg.sender as the address of THIS
   * contract, and not the address of the submitter - if the constructor of the
   * deployed contract uses msg.sender to set up ownership or other variables,
   * you must modify it to accept a constructor argument with the appropriate
   * address, or alternately to hard-code the intended address. Also, if your
   * contract DOES have constructor arguments, remember to include them as
   * ABI-encoded arguments at the end of the initialization code, just as you
   * would when performing a standard deploy. You may also want to provide the
   * key to `setReverseLookup` in order to find it again using only the home
   * address to prevent accidentally losing the key. The controller cannot be
   * designated as the address of this contract, the null address, or the home
   * address (the restriction on setting the home address as the controller is
   * due to the fact that the home address will not be able to deploy to itself,
   * as it needs to be empty before a contract can be deployed to it). Also,
   * checks on the contract at the home address being empty or not having the
   * correct controller are unnecessary, as they are performed when minting the
   * token and cannot be altered until the token is redeemed.
   */
  function redeemAndDeploy(
    uint256 tokenId,
    address controller,
    bytes calldata initializationCode
  )
    external
    payable
    returns (address homeAddress, bytes32 runtimeCodeHash);

  /**
   * @notice Derive a new key by concatenating an arbitrary 32-byte salt value
   * and the address of the caller and performing a keccak256 hash. This allows
   * for the creation of keys with additional entropy where desired while also
   * preventing collisions with standard keys. The caller will be set as the
   * controller of the derived key.
   * @param salt bytes32 The desired salt value to use (along with the address
   * of the caller) when deriving the resultant key and corresponding home
   * address.
   * @return The derived key.
   * @dev Home addresses from derived keys will take longer to "mine" or locate,
   * as an additional hash must be performed when computing the corresponding
   * home address for each given salt input. Each caller will derive a different
   * key even if they are supplying the same salt value.
   */
  function deriveKey(bytes32 salt) external returns (bytes32 key);

  /**
   * @notice Mint an ERC721 token to the supplied owner that can be redeemed in
   * order to gain control of a home address corresponding to a given derived
   * key. Two conditions must be met: the submitter must be designated as the
   * current controller of the home address, and there must not be a contract
   * currently deployed at the home address. These conditions can be checked by
   * calling `getHomeAddressInformation` and `isDeployable` with the key
   * determined by calling `getDerivedKey`.
   * @param salt bytes32 The salt value that is used to derive the key.
   * @param owner address The account that will be granted ownership of the
   * ERC721 token.
   * @return The derived key.
   * @dev In order to mint an ERC721 token, the assocated home address cannot be
   * in use, or else the token will not be able to deploy to the home address.
   * The controller is set to this contract until the token is redeemed, at
   * which point the redeemer designates a new controller for the home address.
   * The key of the home address and the tokenID of the ERC721 token are the
   * same value, but different types (bytes32 vs. uint256).
   */
  function deriveKeyAndLock(bytes32 salt, address owner)
    external
    returns (bytes32 key);

  /**
   * @notice Transfer control over deployment to the home address corresponding
   * to a given derived key. The caller must be designated as the current
   * controller of the home address - This condition can be checked by calling
   * `getHomeAddressInformation` with the key obtained via `getDerivedKey`.
   * @param salt bytes32 The salt value that is used to derive the key.
   * @param controller address The account that will be granted control of the
   * home address corresponding to the given derived key.
   * @return The derived key.
   * @dev The controller cannot be designated as the address of this contract,
   * the null address, or the home address (the restriction on setting the home
   * address as the controller is due to the fact that the home address will not
   * be able to deploy to itself, as it needs to be empty before a contract can
   * be deployed to it).
   */
  function deriveKeyAndAssignController(bytes32 salt, address controller)
    external
    returns (bytes32 key);

  /**
   * @notice Transfer control over deployment to the home address corresponding
   * to a given derived key to the null address, which will prevent it from
   * being deployed to again in the future. The caller must be designated as the
   * current controller of the home address - This condition can be checked by
   * calling `getHomeAddressInformation` with the key determined by calling
   * `getDerivedKey`.
   * @param salt bytes32 The salt value that is used to derive the key.
   * @return The derived key.
   */
  function deriveKeyAndRelinquishControl(bytes32 salt)
    external
    returns (bytes32 key);

  /**
   * @notice Record a key that corresponds to a given home address by supplying
   * said key and using it to derive the address. This enables reverse lookup
   * of a key using only the home address in question. This method may be called
   * by anyone - control of the key is not required.
   * @param key bytes32 The unique value used to derive the home address.
   * @dev This does not set the salt or submitter fields, as those apply only to
   * derived keys (although a derived key may also be set with this method, just
   * without the derived fields).
   */
  function setReverseLookup(bytes32 key) external;

  /**
   * @notice Record the derived key that corresponds to a given home address by
   * supplying the salt and submitter that were used to derive the key. This
   * facititates reverse lookup of the derivation method of a key using only the
   * home address in question. This method may be called by anyone - control of
   * the derived key is not required.
   * @param salt bytes32 The salt value that is used to derive the key.
   * @param submitter address The account that submits the salt that is used to
   * derive the key.
   */
  function setDerivedReverseLookup(bytes32 salt, address submitter) external;

  /**
   * @notice Deploy a new storage contract with the supplied code as runtime
   * code without deploying a contract to a home address. This can be used to
   * store the contract creation code for use in future deployments of contracts
   * to home addresses.
   * @param codePayload bytes The code to set as the runtime code of the
   * deployed contract.
   * @return The address of the deployed storage contract.
   * @dev Consider placing adequate protections on the storage contract to
   * prevent unwanted callers from modifying or destroying it. Also, if you are
   * placing contract contract creation code into the runtime storage contract,
   * remember to include any constructor parameters as ABI-encoded arguments at
   * the end of the contract creation code, similar to how you would perform a
   * standard deployment.
   */
  function deployRuntimeStorageContract(bytes calldata codePayload)
    external
    returns (address runtimeStorageContract);

  /**
   * @notice Deploy a new contract with the initialization code stored in the
   * runtime code at the specified initialization runtime storage contract to
   * the home address corresponding to a given key. Two conditions must be met:
   * the submitter must be designated as the controller of the home address
   * (with the initial controller set to the address corresponding to the first
   * 20 bytes of the key), and there must not be a contract currently deployed
   * at the home address. These conditions can be checked by calling
   * `getHomeAddressInformation` and `isDeployable` with the same key.
   * @param key bytes32 The unique value used to derive the home address.
   * @param initializationRuntimeStorageContract address The storage contract
   * with runtime code equal to the contract creation code that will be used to
   * deploy the contract to the home address.
   * @return The home address and runtime code hash of the deployed contract.
   * @dev When deploying a contract to a home address via this method, the
   * metamorphic initialization code will retrieve whatever initialization code
   * currently resides at the specified address and use it to set up and deploy
   * the desired contract to the home address. Bear in mind that the deployed
   * contract will interpret msg.sender as the address of THIS contract, and not
   * the address of the submitter - if the constructor of the deployed contract
   * uses msg.sender to set up ownership or other variables, you must modify it
   * to accept a constructor argument with the appropriate address, or
   * alternately to hard-code the intended address. Also, if your contract DOES
   * have constructor arguments, remember to include them as ABI-encoded
   * arguments at the end of the initialization code, just as you would when
   * performing a standard deploy. You may also want to provide the key to
   * `setReverseLookup` in order to find it again using only the home address to
   * prevent accidentally losing the key.
   */
  function deployViaExistingRuntimeStorageContract(
    bytes32 key,
    address initializationRuntimeStorageContract
  )
    external
    payable
    returns (address homeAddress, bytes32 runtimeCodeHash);

  /**
   * @notice Burn an ERC721 token, set a supplied controller, and deploy a new
   * contract with the initialization code stored in the runtime code at the
   * specified initialization runtime storage contract to the home address
   * corresponding to a given key. The submitter must be designated as either
   * the owner of the token or as an approved spender.
   * @param tokenId uint256 The ID of the ERC721 token to redeem.
   * @param controller address The account that will be granted control of the
   * home address corresponding to the given token.
   * @param initializationRuntimeStorageContract address The storage contract
   * with runtime code equal to the contract creation code that will be used to
   * deploy the contract to the home address.
   * @return The home address and runtime code hash of the deployed contract.
   * @dev When deploying a contract to a home address via this method, the
   * metamorphic initialization code will retrieve whatever initialization code
   * currently resides at the specified address and use it to set up and deploy
   * the desired contract to the home address. Bear in mind that the deployed
   * contract will interpret msg.sender as the address of THIS contract, and not
   * the address of the submitter - if the constructor of the deployed contract
   * uses msg.sender to set up ownership or other variables, you must modify it
   * to accept a constructor argument with the appropriate address, or
   * alternately to hard-code the intended address. Also, if your contract DOES
   * have constructor arguments, remember to include them as ABI-encoded
   * arguments at the end of the initialization code, just as you would when
   * performing a standard deploy. You may also want to provide the key to
   * `setReverseLookup` in order to find it again using only the home address to
   * prevent accidentally losing the key. The controller cannot be designated as
   * the address of this contract, the null address, or the home address (the
   * restriction on setting the home address as the controller is due to the
   * fact that the home address will not be able to deploy to itself, as it
   * needs to be empty before a contract can be deployed to it). Also, checks on
   * the contract at the home address being empty or not having the correct
   * controller are unnecessary, as they are performed when minting the token
   * and cannot be altered until the token is redeemed.
   */
  function redeemAndDeployViaExistingRuntimeStorageContract(
    uint256 tokenId,
    address controller,
    address initializationRuntimeStorageContract
  )
    external
    payable
    returns (address homeAddress, bytes32 runtimeCodeHash);

  /**
   * @notice Deploy a new contract with the desired initialization code to the
   * home address corresponding to a given derived key. Two conditions must be
   * met: the submitter must be designated as the controller of the home
   * address, and there must not be a contract currently deployed at the home
   * address. These conditions can be checked by calling
   * `getHomeAddressInformation` and `isDeployable` with the key obtained by
   * calling `getDerivedKey`.
   * @param salt bytes32 The salt value that is used to derive the key.
   * @param initializationCode bytes The contract creation code that will be
   * used to deploy the contract to the home address.
   * @return The home address, derived key, and runtime code hash of the
   * deployed contract.
   * @dev In order to deploy the contract to the home address, a new contract
   * will be deployed with runtime code set to the initialization code of the
   * contract that will be deployed to the home address. Then, metamorphic
   * initialization code will retrieve that initialization code and use it to
   * set up and deploy the desired contract to the home address. Bear in mind
   * that the deployed contract will interpret msg.sender as the address of THIS
   * contract, and not the address of the submitter - if the constructor of the
   * deployed contract uses msg.sender to set up ownership or other variables,
   * you must modify it to accept a constructor argument with the appropriate
   * address, or alternately to hard-code the intended address. Also, if your
   * contract DOES have constructor arguments, remember to include them as
   * ABI-encoded arguments at the end of the initialization code, just as you
   * would when performing a standard deploy. You may want to provide the salt
   * and submitter to `setDerivedReverseLookup` in order to find the salt,
   * submitter, and derived key using only the home address to prevent
   * accidentally losing them.
   */
  function deriveKeyAndDeploy(bytes32 salt, bytes calldata initializationCode)
    external
    payable
    returns (address homeAddress, bytes32 key, bytes32 runtimeCodeHash);

  /**
   * @notice Deploy a new contract with the initialization code stored in the
   * runtime code at the specified initialization runtime storage contract to
   * the home address corresponding to a given derived key. Two conditions must
   * be met: the submitter must be designated as the controller of the home
   * address, and there must not be a contract currently deployed at the home
   * address. These conditions can be checked by calling
   * `getHomeAddressInformation` and `isDeployable` with the key obtained by
   * calling `getDerivedKey`.
   * @param salt bytes32 The salt value that is used to derive the key.
   * @param initializationRuntimeStorageContract address The storage contract
   * with runtime code equal to the contract creation code that will be used to
   * deploy the contract to the home address.
   * @return The home address, derived key, and runtime code hash of the
   * deployed contract.
   * @dev When deploying a contract to a home address via this method, the
   * metamorphic initialization code will retrieve whatever initialization code
   * currently resides at the specified address and use it to set up and deploy
   * the desired contract to the home address. Bear in mind that the deployed
   * contract will interpret msg.sender as the address of THIS contract, and not
   * the address of the submitter - if the constructor of the deployed contract
   * uses msg.sender to set up ownership or other variables, you must modify it
   * to accept a constructor argument with the appropriate address, or
   * alternately to hard-code the intended address. Also, if your contract DOES
   * have constructor arguments, remember to include them as ABI-encoded
   * arguments at the end of the initialization code, just as you would when
   * performing a standard deploy. You may want to provide the salt and
   * submitter to `setDerivedReverseLookup` in order to find the salt,
   * submitter, and derived key using only the home address to prevent
   * accidentally losing them.
   */
  function deriveKeyAndDeployViaExistingRuntimeStorageContract(
    bytes32 salt,
    address initializationRuntimeStorageContract
  )
    external
    payable
    returns (address homeAddress, bytes32 key, bytes32 runtimeCodeHash);

  /**
   * @notice Mint multiple ERC721 tokens, designated by their keys, to the
   * specified owner. Keys that aren't controlled, or that point to home
   * addresses that are currently deployed, will be skipped.
   * @param owner address The account that will be granted ownership of the
   * ERC721 tokens.
   * @param keys bytes32[] An array of values used to derive each home address.
   * @dev If you plan to use this method regularly or want to keep gas costs to
   * an absolute minimum, and are willing to go without standard ABI encoding,
   * see `batchLock_63efZf` for a more efficient (and unforgiving)
   * implementation. For batch token minting with *derived* keys, see
   * `deriveKeysAndBatchLock`.
   */
  function batchLock(address owner, bytes32[] calldata keys) external;

  /**
   * @notice Mint multiple ERC721 tokens, designated by salts that are hashed
   * with the caller's address to derive each key, to the specified owner.
   * Derived keys that aren't controlled, or that point to home addresses that
   * are currently deployed, will be skipped.
   * @param owner address The account that will be granted ownership of the
   * ERC721 tokens.
   * @param salts bytes32[] An array of values used to derive each key and
   * corresponding home address.
   * @dev See `batchLock` for batch token minting with standard, non-derived
   * keys.
   */
  function deriveKeysAndBatchLock(address owner, bytes32[] calldata salts)
    external;

  /**
   * @notice Efficient version of `batchLock` that uses less gas. The first 20
   * bytes of each key are automatically populated using msg.sender, and the
   * remaining key segments are passed in as a packed byte array, using twelve
   * bytes per segment, with a function selector of 0x00000000 followed by a
   * twenty-byte segment for the desired owner of the minted ERC721 tokens. Note
   * that an attempt to lock a key that is not controlled or with its contract
   * already deployed will cause the entire batch to revert. Checks on whether
   * the owner is a valid ERC721 receiver are also skipped, similar to using
   * `transferFrom` instead of `safeTransferFrom`.
   */
  function batchLock_63efZf(/* packed owner and key segments */) external;

  /**
   * @notice Submit a key to claim the "high score" - the lower the uint160
   * value of the key's home address, the higher the score. The high score
   * holder has the exclusive right to recover lost ether and tokens on this
   * contract.
   * @param key bytes32 The unique value used to derive the home address that
   * will determine the resultant score.
   * @dev The high score must be claimed by a direct key (one that is submitted
   * by setting the first 20 bytes of the key to the address of the submitter)
   * and not by a derived key, and is non-transferrable. If you want to help
   * people recover their lost tokens, you might consider deploying a contract
   * to the high score address (probably a metamorphic one so that you can use
   * the home address later) with your contact information.
   */
  function claimHighScore(bytes32 key) external;

  /**
   * @notice Transfer any ether or ERC20 tokens that have somehow ended up at
   * this contract by specifying a token address (set to the null address for
   * ether) as well as a recipient address. Only the high score holder can
   * recover lost ether and tokens on this contract.
   * @param token address The contract address of the ERC20 token to recover, or
   * the null address for recovering Ether.
   * @param recipient address payable The account where recovered funds should
   * be transferred.
   * @dev If you are trying to recover funds that were accidentally sent into
   * this contract, see if you can contact the holder of the current high score,
   * found by calling `getHighScore`. Better yet, try to find a new high score
   * yourself!
   */
  function recover(IERC20 token, address payable recipient) external;

  /**
   * @notice "View" function to determine if a contract can currently be
   * deployed to a home address given the corresponding key. A contract is only
   * deployable if no account currently exists at the address - any existing
   * contract must be destroyed via `SELFDESTRUCT` before a new contract can be
   * deployed to a home address. This method does not modify state but is
   * inaccessible via staticcall.
   * @param key bytes32 The unique value used to derive the home address.
   * @return A boolean signifying if a contract can be deployed to the home
   * address that corresponds to the provided key.
   * @dev This will not detect if a contract is not deployable due control
   * having been relinquished on the key.
   */
  function isDeployable(bytes32 key)
    external
    /* view */
    returns (bool deployable);

  /**
   * @notice View function to get the current "high score", or the lowest
   * uint160 value of a home address of all keys submitted. The high score
   * holder has the exclusive right to recover lost ether and tokens on this
   * contract.
   * @return The current high score holder, their score, and the submitted key.
   */
  function getHighScore()
    external
    view
    returns (address holder, uint256 score, bytes32 key);

  /**
   * @notice View function to get information on a home address given the
   * corresponding key.
   * @param key bytes32 The unique value used to derive the home address.
   * @return The home address, the current controller of the address, the number
   * of times the home address has been deployed to, and the code hash of the
   * runtime currently found at the home address, if any.
   * @dev There is also an `isDeployable` method for determining if a contract
   * can be deployed to the address, but in extreme cases it must actually
   * perform a dry-run to determine if the contract is deployable, which means
   * that it does not support staticcalls. There is also a convenience method,
   * `hasNeverBeenDeployed`, but the information it conveys can be determined
   * from this method alone as well.
   */
  function getHomeAddressInformation(bytes32 key)
    external
    view
    returns (
      address homeAddress,
      address controller,
      uint256 deploys,
      bytes32 currentRuntimeCodeHash
    );

  /**
   * @notice View function to determine if no contract has ever been deployed to
   * a home address given the corresponding key. This can be used to ensure that
   * a given key or corresponding token is "new" or not.
   * @param key bytes32 The unique value used to derive the home address.
   * @return A boolean signifying if a contract has never been deployed using
   * the supplied key before.
   */
  function hasNeverBeenDeployed(bytes32 key)
    external
    view
    returns (bool neverBeenDeployed);

  /**
   * @notice View function to search for a known key, salt, and/or submitter
   * given a supplied home address. Keys can be controlled directly by an
   * address that matches the first 20 bytes of the key, or they can be derived
   * from a salt and a submitter - if the key is not a derived key, the salt and
   * submitter fields will both have a value of zero.
   * @param homeAddress address The home address to check for key information.
   * @return The key, salt, and/or submitter used to deploy to the home address,
   * assuming they have been submitted to the reverse lookup.
   * @dev To populate these values, call `setReverseLookup` for cases where keys
   * are used directly or are the only value known, or `setDerivedReverseLookup`
   * for cases where keys are derived from a known salt and submitter.
   */
  function reverseLookup(address homeAddress)
    external
    view
    returns (bytes32 key, bytes32 salt, address submitter);

  /**
   * @notice Pure function to determine the key that is derived from a given
   * salt and submitting address.
   * @param salt bytes32 The salt value that is used to derive the key.
   * @param submitter address The submitter of the salt value used to derive the
   * key.
   * @return The derived key.
   */
  function getDerivedKey(bytes32 salt, address submitter)
    external
    pure
    returns (bytes32 key);

  /**
   * @notice Pure function to determine the home address that corresponds to
   * a given key.
   * @param key bytes32 The unique value used to derive the home address.
   * @return The home address.
   */
  function getHomeAddress(bytes32 key)
    external
    pure
    returns (address homeAddress);

  /**
   * @notice Pure function for retrieving the metamorphic initialization code
   * used to deploy arbitrary contracts to home addresses. Provided for easy
   * verification and for use in other applications.
   * @return The 32-byte metamorphic initialization code.
   * @dev This metamorphic init code works via the "metamorphic delegator"
   * mechanism, which is explained in greater detail at `_deployToHomeAddress`.
   */
  function getMetamorphicDelegatorInitializationCode()
    external
    pure
    returns (bytes32 metamorphicDelegatorInitializationCode);

  /**
   * @notice Pure function for retrieving the keccak256 of the metamorphic
   * initialization code used to deploy arbitrary contracts to home addresses.
   * This is the value that you should use, along with this contract's address
   * and a caller address that you control, to mine for an partucular type of
   * home address (such as one at a compact or gas-efficient address).
   * @return The keccak256 hash of the metamorphic initialization code.
   */
  function getMetamorphicDelegatorInitializationCodeHash()
    external
    pure
    returns (bytes32 metamorphicDelegatorInitializationCodeHash);

  /**
   * @notice Pure function for retrieving the prelude that will be inserted
   * ahead of the code payload in order to deploy a runtime storage contract.
   * @return The 11-byte "arbitrary runtime" prelude.
   */
  function getArbitraryRuntimeCodePrelude()
    external
    pure
    returns (bytes11 prelude);
}
