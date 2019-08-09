pragma solidity 0.5.9; // optimization enabled, runs: 10000, evm: constantinople

import "./openzeppelin-solidity/token/ERC721/ERC721Enumerable.sol";
import "../interfaces/IERC721Metadata.sol";
import "../interfaces/IERC20.sol";
import "../interfaces/IERC1412.sol";
import "../interfaces/IHomeWork.sol";


/**
 * @title HomeWork (version 1)
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
contract HomeWork is IHomeWork, ERC721Enumerable, IERC721Metadata, IERC1412 {
  // Allocate storage to track the current initialization-in-runtime contract.
  address private _initializationRuntimeStorageContract;

  // Finder of home address with lowest uint256 value can recover lost funds.
  bytes32 private _highScoreKey;

  // Track information on the Home address corresponding to each key.
  mapping (bytes32 => HomeAddress) private _home;

  // Provide optional reverse-lookup for key derivation of a given home address.
  mapping (address => KeyInformation) private _key;

  // Set 0xff + address(this) as a constant to use when deriving home addresses.
  bytes21 private constant _FF_AND_THIS_CONTRACT = bytes21(
    0xff0000000000001b84b1cb32787B0D64758d019317
  );

  // Set the address of the tokenURI runtime storage contract as a constant.
  address private constant _URI_END_SEGMENT_STORAGE = address(
    0x000000000071C1c84915c17BF21728BfE4Dac3f3
  );

  // Deploy arbitrary contracts to home addresses using metamorphic init code.
  bytes32 private constant _HOME_INIT_CODE = bytes32(
    0x5859385958601c335a585952fa1582838382515af43d3d93833e601e57fd5bf3
  );

  // Compute hash of above metamorphic init code in order to compute addresses.
  bytes32 private constant _HOME_INIT_CODE_HASH = bytes32(
    0x7816562e7f85866cae07183593075f3b5ec32aeff914a0693e20aaf39672babc
  );

  // Write arbitrary code to a contract's runtime using the following prelude.
  bytes11 private constant _ARBITRARY_RUNTIME_PRELUDE = bytes11(
    0x600b5981380380925939f3
  );

  // Set EIP165 interface IDs as constants (already set 165 and 721+enumerable).
  bytes4 private constant _INTERFACE_ID_HOMEWORK = 0xe5399799;
  /* this.deploy.selector ^ this.lock.selector ^ this.redeem.selector ^
     this.assignController.selector ^ this.relinquishControl.selector ^
     this.redeemAndDeploy.selector ^ this.deriveKey.selector ^
     this.deriveKeyAndLock.selector ^
     this.deriveKeyAndAssignController.selector ^
     this.deriveKeyAndRelinquishControl.selector ^
     this.setReverseLookup.selector ^ this.setDerivedReverseLookup.selector ^
     this.deployRuntimeStorageContract.selector ^
     this.deployViaExistingRuntimeStorageContract.selector ^
     this.redeemAndDeployViaExistingRuntimeStorageContract.selector ^
     this.deriveKeyAndDeploy.selector ^
     this.deriveKeyAndDeployViaExistingRuntimeStorageContract.selector ^
     this.batchLock.selector ^ this.deriveKeysAndBatchLock.selector ^
     this.batchLock_63efZf.selector ^ this.claimHighScore.selector ^
     this.recover.selector ^ this.isDeployable.selector ^
     this.getHighScore.selector ^ this.getHomeAddressInformation.selector ^
     this.hasNeverBeenDeployed.selector ^ this.reverseLookup.selector ^
     this.getDerivedKey.selector ^ this.getHomeAddress.selector ^
     this.getMetamorphicDelegatorInitializationCode.selector ^
     this.getMetamorphicDelegatorInitializationCodeHash.selector ^
     this.getArbitraryRuntimeCodePrelude.selector == 0xe5399799
  */

  bytes4 private constant _INTERFACE_ID_ERC721_METADATA = 0x5b5e139f;

  bytes4 private constant _INTERFACE_ID_ERC1412_BATCH_TRANSFERS = 0x2b89bcaa;

  // Set name of this contract as a constant (hex encoding is to support emoji).
  string private constant _NAME = (
    hex"486f6d65576f726b20f09f8fa0f09f9ba0efb88f"
  );

  // Set symbol of this contract as a constant.
  string private constant _SYMBOL = "HWK";

  // Set the start of each token URI for issued ERC721 tokens as a constant.
  bytes private constant _URI_START_SEGMENT = abi.encodePacked(
    hex"646174613a6170706c69636174696f6e2f6a736f6e2c7b226e616d65223a22486f6d65",
    hex"253230416464726573732532302d2532303078"
  ); /* data:application/json,{"name":"Home%20Address%20-%200x */

  // Store reused revert messages as constants.
  string private constant _ACCOUNT_EXISTS = string(
    "Only non-existent accounts can be deployed or used to mint tokens."
  );

  string private constant _ONLY_CONTROLLER = string(
    "Only the designated controller can call this function."
  );

  string private constant _NO_INIT_CODE_SUPPLIED = string(
    "Cannot deploy a contract with no initialization code supplied."
  );

  /**
   * @notice In the constructor, verify that deployment addresses are correct
   * and that supplied constant hash value of the contract creation code used to
   * deploy arbitrary contracts to home addresses is valid, and set an initial
   * high score key with the null address as the high score "holder". ERC165
   * supported interfaces are all registered during initizialization as well.
   */
  constructor() public {
    // Verify that the deployment address is set correctly as a constant.
    assert(address(this) == address(uint160(uint168(_FF_AND_THIS_CONTRACT))));

    // Verify the derivation of the deployment address.
    bytes32 initialDeployKey = bytes32(
      0x486f6d65576f726b20f09f8fa0f09f9ba0efb88faa3c548a76f9bd3c000c0000
    );    
    assert(address(this) == address(
      uint160(                      // Downcast to match the address type.
        uint256(                    // Convert to uint to truncate upper digits.
          keccak256(                // Compute the CREATE2 hash using 4 inputs.
            abi.encodePacked(       // Pack all inputs to the hash together.
              bytes1(0xff),         // Start with 0xff to distinguish from RLP.
              msg.sender,           // The deployer will be the caller.
              initialDeployKey,     // Pass in the supplied key as the salt.
              _HOME_INIT_CODE_HASH  // The metamorphic initialization code hash.
            )
          )
        )
      )
    ));

    // Verify the derivation of the tokenURI runtime storage address.
    bytes32 uriDeployKey = bytes32(
      0x486f6d65576f726b202d20746f6b656e55524920c21352fee5a62228db000000
    );
    bytes32 uriInitCodeHash = bytes32(
      0xdea98294867e3fdc48eb5975ecc53a79e2e1ea6e7e794137a9c34c4dd1565ba2
    );
    assert(_URI_END_SEGMENT_STORAGE == address(
      uint160(                      // Downcast to match the address type.
        uint256(                    // Convert to uint to truncate upper digits.
          keccak256(                // Compute the CREATE2 hash using 4 inputs.
            abi.encodePacked(       // Pack all inputs to the hash together.
              bytes1(0xff),         // Start with 0xff to distinguish from RLP.
              msg.sender,           // The deployer will be the caller.
              uriDeployKey,         // Pass in the supplied key as the salt.
              uriInitCodeHash       // The storage contract init code hash.
            )
          )
        )
      )
    ));

    // Verify that the correct runtime code is at the tokenURI storage contract.
    bytes32 expectedRuntimeStorageHash = bytes32(
      0x8834602968080bb1df9c44c9834c0a93533b72bbfa3865ee2c5be6a0c4125fc3
    );
    address runtimeStorage = _URI_END_SEGMENT_STORAGE;
    bytes32 runtimeStorageHash;
    assembly { runtimeStorageHash := extcodehash(runtimeStorage) }
    assert(runtimeStorageHash == expectedRuntimeStorageHash);

    // Verify that the supplied hash for the metamorphic init code is valid.
    assert(keccak256(abi.encode(_HOME_INIT_CODE)) == _HOME_INIT_CODE_HASH);

    // Set an initial high score key with the null address as the submitter.
    _highScoreKey = bytes32(
      0x0000000000000000000000000000000000000000ffffffffffffffffffffffff
    );

    // Register EIP165 interface for HomeWork.
    _registerInterface(_INTERFACE_ID_HOMEWORK);

    // Register EIP165 interface for ERC721 metadata.
    _registerInterface(_INTERFACE_ID_ERC721_METADATA);

    // Register EIP165 interface for ERC1412 (batch transfers).
    _registerInterface(_INTERFACE_ID_ERC1412_BATCH_TRANSFERS);
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
    onlyEmpty(key)
    onlyControllerDeployer(key)
    returns (address homeAddress, bytes32 runtimeCodeHash)
  {
    // Ensure that initialization code was supplied.
    require(initializationCode.length > 0, _NO_INIT_CODE_SUPPLIED);

    // Deploy the initialization storage contract and set address in storage.
    _initializationRuntimeStorageContract = _deployRuntimeStorageContract(
      initializationCode
    );

    // Use metamorphic initialization code to deploy contract to home address.
    (homeAddress, runtimeCodeHash) = _deployToHomeAddress(key);
  }

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
  function lock(bytes32 key, address owner)
    external
    onlyEmpty(key)
    onlyController(key)
  {
    // Ensure that the specified owner is a valid ERC721 receiver.
    _validateOwner(owner, key);

    // Get the HomeAddress storage struct from the mapping using supplied key.
    HomeAddress storage home = _home[key];

    // Set the exists flag to true and the controller to this contract.
    home.exists = true;
    home.controller = address(this);

    // Emit an event signifying that this contract is now the controller. 
    emit NewController(key, address(this));

    // Mint the ERC721 token to the designated owner.
    _mint(owner, uint256(key));
  }

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
  function redeem(uint256 tokenId, address controller)
    external
    onlyTokenOwnerOrApprovedSpender(tokenId)
  {
    // Convert the token ID to a bytes32 key.
    bytes32 key = bytes32(tokenId);

    // Prevent the controller from being set to prohibited account values.
    _validateController(controller, key);

    // Burn the ERC721 token in question.
    _burn(tokenId);

    // Assign the new controller to the corresponding home address.
    _home[key].controller = controller;

    // Emit an event with the new controller. 
    emit NewController(key, controller);
  }

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
  function assignController(bytes32 key, address controller)
    external
    onlyController(key)
  {
    // Prevent the controller from being set to prohibited account values.
    _validateController(controller, key);

    // Assign the new controller to the corresponding home address.
    HomeAddress storage home = _home[key];
    home.exists = true;
    home.controller = controller;

    // Emit an event with the new controller. 
    emit NewController(key, controller);
  }

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
  function relinquishControl(bytes32 key)
    external
    onlyController(key)
  {
    // Assign the null address as the controller of the given key.
    HomeAddress storage home = _home[key];
    home.exists = true;
    home.controller = address(0);

    // Emit an event with the null address as the controller. 
    emit NewController(key, address(0));
  }

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
    onlyTokenOwnerOrApprovedSpender(tokenId)
    returns (address homeAddress, bytes32 runtimeCodeHash)
  {
    // Ensure that initialization code was supplied.
    require(initializationCode.length > 0, _NO_INIT_CODE_SUPPLIED);

    // Convert the token ID to a bytes32 key.
    bytes32 key = bytes32(tokenId);

    // Prevent the controller from being set to prohibited account values.
    _validateController(controller, key);

    // Burn the ERC721 token in question.
    _burn(tokenId);

    // Deploy the initialization storage contract and set address in storage.
    _initializationRuntimeStorageContract = _deployRuntimeStorageContract(
      initializationCode
    );

    // Set provided controller and increment contract deploy count at once.
    HomeAddress storage home = _home[key];
    home.exists = true;
    home.controller = controller;
    home.deploys += 1;

    // Emit an event with the new controller. 
    emit NewController(key, controller);

    // Use metamorphic initialization code to deploy contract to home address.
    (homeAddress, runtimeCodeHash) = _deployToHomeAddress(key);
  }

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
  function deriveKey(bytes32 salt) external returns (bytes32 key) {
    // Derive the key using the supplied salt and the calling address.
    key = _deriveKey(salt, msg.sender);

    // Register key and set caller as controller if it is not yet registered.
    HomeAddress storage home = _home[key];
    if (!home.exists) {
      home.exists = true;
      home.controller = msg.sender;

      // Emit an event with the sender as the new controller. 
      emit NewController(key, msg.sender);
    }
  }

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
    returns (bytes32 key)
  {
    // Derive the key using the supplied salt and the calling address.
    key = _deriveKey(salt, msg.sender);

    // Ensure that the specified owner is a valid ERC721 receiver.
    _validateOwner(owner, key);

    // Ensure that a contract is not currently deployed to the home address.
    require(_isNotDeployed(key), _ACCOUNT_EXISTS);

    // Ensure that the caller is the controller of the derived key.
    HomeAddress storage home = _home[key];
    if (home.exists) {
      require(home.controller == msg.sender, _ONLY_CONTROLLER);
    }

    // Set the exists flag to true and the controller to this contract.
    home.exists = true;
    home.controller = address(this);

    // Mint the ERC721 token to the designated owner.
    _mint(owner, uint256(key));

    // Emit an event signifying that this contract is now the controller. 
    emit NewController(key, address(this));
  }

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
    returns (bytes32 key)
  {
    // Derive the key using the supplied salt and the calling address.
    key = _deriveKey(salt, msg.sender);

    // Prevent the controller from being set to prohibited account values.
    _validateController(controller, key);

    // Ensure that the caller is the controller of the derived key.
    HomeAddress storage home = _home[key];
    if (home.exists) {
      require(home.controller == msg.sender, _ONLY_CONTROLLER);
    }

    // Assign the new controller to the corresponding home address.
    home.exists = true;
    home.controller = controller;

    // Emit an event with the new controller. 
    emit NewController(key, controller);
  }

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
    returns (bytes32 key)
  {
    // Derive the key using the supplied salt and the calling address.
    key = _deriveKey(salt, msg.sender);

    // Ensure that the caller is the controller of the derived key.
    HomeAddress storage home = _home[key];
    if (home.exists) {
      require(home.controller == msg.sender, _ONLY_CONTROLLER);
    }

    // Assign the null address as the controller of the given derived key.
    home.exists = true;
    home.controller = address(0);

    // Emit an event with the null address as the controller. 
    emit NewController(key, address(0));
  }

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
  function setReverseLookup(bytes32 key) external {
    // Derive home address of given key and set home address and key in mapping.
    _key[_getHomeAddress(key)].key = key;
  }

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
  function setDerivedReverseLookup(bytes32 salt, address submitter) external {
    // Derive the key using the supplied salt and submitter.
    bytes32 key = _deriveKey(salt, submitter);

    // Derive home address and set it along with all other relevant information.
    _key[_getHomeAddress(key)] = KeyInformation({
      key: key,
      salt: salt,
      submitter: submitter
    });
  }

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
    returns (address runtimeStorageContract)
  {
    // Ensure that a code payload was supplied.
    require(codePayload.length > 0, "No runtime code payload supplied.");

    // Deploy payload to the runtime storage contract and return the address.
    runtimeStorageContract = _deployRuntimeStorageContract(codePayload);
  }

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
    onlyEmpty(key)
    onlyControllerDeployer(key)
    returns (address homeAddress, bytes32 runtimeCodeHash)
  {
    // Ensure that the supplied runtime storage contract is not empty.
    _validateRuntimeStorageIsNotEmpty(initializationRuntimeStorageContract);

    // Set initialization runtime storage contract address in contract storage.
    _initializationRuntimeStorageContract = initializationRuntimeStorageContract;

    // Use metamorphic initialization code to deploy contract to home address.
    (homeAddress, runtimeCodeHash) = _deployToHomeAddress(key);
  }

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
    onlyTokenOwnerOrApprovedSpender(tokenId)
    returns (address homeAddress, bytes32 runtimeCodeHash)
  {
    // Ensure that the supplied runtime storage contract is not empty.
    _validateRuntimeStorageIsNotEmpty(initializationRuntimeStorageContract);

    // Convert the token ID to a bytes32 key.
    bytes32 key = bytes32(tokenId);

    // Prevent the controller from being set to prohibited account values.
    _validateController(controller, key);

    // Burn the ERC721 token in question.
    _burn(tokenId);

    // Set initialization runtime storage contract address in contract storage.
    _initializationRuntimeStorageContract = initializationRuntimeStorageContract;

    // Set provided controller and increment contract deploy count at once.
    HomeAddress storage home = _home[key];
    home.exists = true;
    home.controller = controller;
    home.deploys += 1;

    // Emit an event with the new controller. 
    emit NewController(key, controller);

    // Use metamorphic initialization code to deploy contract to home address.
    (homeAddress, runtimeCodeHash) = _deployToHomeAddress(key);
  }

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
    returns (address homeAddress, bytes32 key, bytes32 runtimeCodeHash)
  {
    // Ensure that initialization code was supplied.
    require(initializationCode.length > 0, _NO_INIT_CODE_SUPPLIED);

    // Derive key and prepare to deploy using supplied salt and calling address.
    key = _deriveKeyAndPrepareToDeploy(salt);

    // Deploy the initialization storage contract and set address in storage.
    _initializationRuntimeStorageContract = _deployRuntimeStorageContract(
      initializationCode
    );

    // Use metamorphic initialization code to deploy contract to home address.
    (homeAddress, runtimeCodeHash) = _deployToHomeAddress(key);
  }

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
    returns (address homeAddress, bytes32 key, bytes32 runtimeCodeHash)
  {
    // Ensure that the supplied runtime storage contract is not empty.
    _validateRuntimeStorageIsNotEmpty(initializationRuntimeStorageContract);

    // Derive key and prepare to deploy using supplied salt and calling address.
    key = _deriveKeyAndPrepareToDeploy(salt);

    // Set the initialization runtime storage contract in contract storage.
    _initializationRuntimeStorageContract = initializationRuntimeStorageContract;

    // Use metamorphic initialization code to deploy contract to home address.
    (homeAddress, runtimeCodeHash) = _deployToHomeAddress(key);
  }

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
  function batchLock(address owner, bytes32[] calldata keys) external {
    // Track each key in the array of keys.
    bytes32 key;

    // Ensure that the specified owner is a valid ERC721 receiver.
    if (keys.length > 0) {
      _validateOwner(owner, keys[0]);
    }

    // Iterate through each provided key argument.
    for (uint256 i; i < keys.length; i++) {
      key = keys[i];

      // Skip if the key currently has a contract deployed to its home address.
      if (!_isNotDeployed(key)) {
        continue;
      }

      // Skip if the caller is not the controller.
      if (_getController(key) != msg.sender) {
        continue;
      }

      // Set the exists flag to true and the controller to this contract.
      HomeAddress storage home = _home[key];
      home.exists = true;
      home.controller = address(this);

      // Emit an event signifying that this contract is now the controller. 
      emit NewController(key, address(this));

      // Mint the ERC721 token to the designated owner.
      _mint(owner, uint256(key));
    }
  }

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
    external
  {
    // Track each key derived from the array of salts.
    bytes32 key;

    // Ensure that the specified owner is a valid ERC721 receiver.
    if (salts.length > 0) {
      _validateOwner(owner, _deriveKey(salts[0], msg.sender));
    }

    // Iterate through each provided salt argument.
    for (uint256 i; i < salts.length; i++) {
      // Derive the key using the supplied salt and the calling address.
      key = _deriveKey(salts[i], msg.sender);

      // Skip if the key currently has a contract deployed to its home address.
      if (!_isNotDeployed(key)) {
        continue;
      }

      // Skip if the caller is not the controller.
      HomeAddress storage home = _home[key];
      if (home.exists && home.controller != msg.sender) {
        continue;
      }

      // Set the exists flag to true and the controller to this contract.
      home.exists = true;
      home.controller = address(this);

      // Emit an event signifying that this contract is now the controller. 
      emit NewController(key, address(this));

      // Mint the ERC721 token to the designated owner.
      _mint(owner, uint256(key));
    }
  }

  /**
   * @notice Safely transfers the ownership of a group of token IDs to another
   * address in a batch. If the target address is a contract, it must implement
   * `onERC721Received`, called upon a safe transfer, and return the magic value
   * `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`;
   * otherwise, or if another error occurs, the entire batch is reverted.
   * Requires msg.sender to be the owner, approved, or operator of the tokens.
   * @param from address The current owner of the tokens.
   * @param to address The account to receive ownership of the given tokens.
   * @param tokenIds uint256[] ID of the tokens to be transferred.
   */
  function safeBatchTransferFrom(
    address from,
    address to,
    uint256[] calldata tokenIds
  )
    external
  {
    // Track each token ID in the batch.
    uint256 tokenId;

    // Iterate over each supplied token ID.
    for (uint256 i = 0; i < tokenIds.length; i++) {
      // Set the current token ID.
      tokenId = tokenIds[i];

      // Perform the token transfer.
      safeTransferFrom(from, to, tokenId);
    }
  }

  /**
   * @notice Safely transfers the ownership of a group of token IDs to another
   * address in a batch. If the target address is a contract, it must implement
   * `onERC721Received`, called upon a safe transfer, and return the magic value
   * `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`;
   * otherwise, or if another error occurs, the entire batch is reverted.
   * Requires msg.sender to be the owner, approved, or operator of the tokens.
   * @param from address The current owner of the tokens.
   * @param to address The account to receive ownership of the given tokens.
   * @param tokenIds uint256[] ID of the tokens to be transferred.
   * @param data bytes A data payload to include with each transfer.   
   */
  function safeBatchTransferFrom(
    address from,
    address to,
    uint256[] calldata tokenIds,
    bytes calldata data
  )
    external
  {
    // Track each token ID in the batch.
    uint256 tokenId;

    // Iterate over each supplied token ID.
    for (uint256 i = 0; i < tokenIds.length; i++) {
      // Set the current token ID.
      tokenId = tokenIds[i];

      // Perform the token transfer.
      safeTransferFrom(from, to, tokenId, data);
    }
  }

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
  function batchLock_63efZf(/* packed owner and key segments */) external {
    // Get the owner from calldata, located at bytes 4-23 (sig is bytes 0-3).
    address owner;

    // Determine number of 12-byte key segments in calldata from byte 24 on.
    uint256 passedSaltSegments;

    // Get the owner and calculate the total number of key segments.
    assembly {
      owner := shr(0x60, calldataload(4))                  // comes after sig
      passedSaltSegments := div(sub(calldatasize, 24), 12) // after sig & owner
    }

    // Track each key, located at each 12-byte segment from byte 24 on.
    bytes32 key;

    // Iterate through each provided key segment argument.
    for (uint256 i; i < passedSaltSegments; i++) {
      // Construct keys by concatenating msg.sender with each key segment.
      assembly {
        key := add(                   // Combine msg.sender & provided key.
          shl(0x60, caller),          // Place msg.sender at start of word.
          shr(0xa0, calldataload(add(24, mul(i, 12))))   // Segment at end.
        )
      }

      // Ensure that the key does not currently have a deployed contract.
      require(_isNotDeployed(key), _ACCOUNT_EXISTS);

      // Ensure that the caller is the controller of the key.
      HomeAddress storage home = _home[key];
      if (home.exists) {
        require(home.controller == msg.sender, _ONLY_CONTROLLER);
      }

      // Set the exists flag to true and the controller to this contract.
      home.exists = true;
      home.controller = address(this);

      // Emit an event signifying that this contract is now the controller. 
      emit NewController(key, address(this));

      // Mint the ERC721 token to the designated owner.
      _mint(owner, uint256(key));
    }
  }

  /**
   * @notice Perform a dry-run of the deployment of a contract using a given key
   * and revert on successful deployment. It cannot be called from outside the
   * contract (even though it is marked as external).
   * @param key bytes32 The unique value used to derive the home address.
   * @dev This contract is called by `_isNotDeployable` in extreme cases where
   * the deployability of the contract cannot be determined conclusively.
   */
  function staticCreate2Check(bytes32 key) external {
    require(
      msg.sender == address(this),
      "This function can only be called by this contract."
    );

    assembly {
      // Write the 32-byte metamorphic initialization code to scratch space.
      mstore(
        0,
        0x5859385958601c335a585952fa1582838382515af43d3d93833e601e57fd5bf3
      )

      // Call `CREATE2` using metamorphic init code with supplied key as salt.
      let deploymentAddress := create2(0, 0, 32, key)

      // Revert and return the metamorphic init code on successful deployment.
      if deploymentAddress {        
        revert(0, 32)
      }
    }
  }

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
  function claimHighScore(bytes32 key) external {
    require(
      msg.sender == address(bytes20(key)),
      "Only submitters directly encoded in a given key may claim a high score."
    );

    // Derive the "home address" of the current high score key.
    address currentHighScore = _getHomeAddress(_highScoreKey);

    // Derive the "home address" of the new high score key.
    address newHighScore = _getHomeAddress(key);

    // Use addresses to ensure that supplied key is in fact a new high score.
    require(
      uint160(newHighScore) < uint160(currentHighScore),
      "Submitted high score is not better than the current high score."
    );

    // Set the new high score to the supplied key.
    _highScoreKey = key;

    // The score is equal to (2^160 - 1) - ("home address" of high score key).
    uint256 score = uint256(uint160(-1) - uint160(newHighScore));

    // Emit an event to signify that a new high score has been reached.
    emit NewHighScore(key, msg.sender, score);
  }

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
  function recover(IERC20 token, address payable recipient) external {
    require(
      msg.sender == address(bytes20(_highScoreKey)),
      "Only the current high score holder may recover tokens."
    );

    if (address(token) == address(0)) {
      // Recover ETH if the token's contract address is set to the null address.
      recipient.transfer(address(this).balance);
    } else {
      // Determine the given ERC20 token balance and transfer to the recipient.
      uint256 balance = token.balanceOf(address(this));
      token.transfer(recipient, balance);
    }
  }

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
    returns (bool deployable)
  {
    deployable = _isNotDeployed(key);
  }

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
    returns (address holder, uint256 score, bytes32 key)
  {
    // Get the key and subbmitter holding the current high score.
    key = _highScoreKey;
    holder = address(bytes20(key));

    // The score is equal to (2^160 - 1) - ("home address" of high score key).
    score = uint256(uint160(-1) - uint160(_getHomeAddress(key)));
  }

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
    )
  {
    // Derive home address and retrieve other information using supplied key.
    homeAddress = _getHomeAddress(key);
    HomeAddress memory home = _home[key];

    // If the home address has not been seen before, use the default controller.
    if (!home.exists) {
      controller = address(bytes20(key));
    } else {
      controller = home.controller;
    }

    // Retrieve the count of total deploys to the home address.
    deploys = home.deploys;

    // Retrieve keccak256 hash of runtime code currently at the home address.
    assembly { currentRuntimeCodeHash := extcodehash(homeAddress) }
  }

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
    returns (bool neverBeenDeployed)
  {
    neverBeenDeployed = (_home[key].deploys == 0);
  }

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
    returns (bytes32 key, bytes32 salt, address submitter)
  {
    KeyInformation memory keyInformation = _key[homeAddress];
    key = keyInformation.key;
    salt = keyInformation.salt;
    submitter = keyInformation.submitter;
  }

  /**
   * @notice View function used by the metamorphic initialization code when
   * deploying a contract to a home address. It returns the address of the
   * runtime storage contract that holds the contract creation code, which the
   * metamorphic creation code then `DELEGATECALL`s into in order to set up the
   * contract and deploy the target runtime code.
   * @return The current runtime storage contract that contains the target
   * contract creation code.
   * @dev This method is not meant to be part of the user-facing contract API,
   * but is rather a mechanism for enabling the deployment of arbitrary code via
   * fixed initialization code. The odd naming is chosen so that function
   * selector will be 0x00000009 - that way, the metamorphic contract can simply
   * use the `PC` opcode in order to push the selector to the stack.
   */
  function getInitializationCodeFromContractRuntime_6CLUNS()
    external
    view
    returns (address initializationRuntimeStorageContract)
  {
    // Return address of contract with initialization code set as runtime code.
    initializationRuntimeStorageContract = _initializationRuntimeStorageContract;
  }

  /**
   * @notice View function to return an URI for a given token ID. Throws if the
   * token ID does not exist.
   * @param tokenId uint256 ID of the token to query.
   * @return String representing the URI data encoding of JSON metadata.
   * @dev The URI returned by this method takes the following form (with all
   * returns and initial whitespace removed - it's just here for clarity):
   *
   * data:application/json,{
   *   "name":"Home%20Address%20-%200x********************",
   *   "description":"< ... HomeWork NFT desription ... >",
   *   "image":"data:image/svg+xml;charset=utf-8;base64,< ... Image ... >"}
   *
   * where ******************** represents the checksummed home address that the
   * token confers control over.
   */
  function tokenURI(uint256 tokenId)
    external
    view
    returns (string memory)
  {
    // Only return a URI for tokens that exist.
    require(_exists(tokenId), "A token with the given ID does not exist.");

    // Get the home address that the given tokenId corresponds to.
    address homeAddress = _getHomeAddress(bytes32(tokenId));

    // Get the checksummed, ascii-encoded representation of the home address.
    string memory asciiHomeAddress = _toChecksummedAsciiString(homeAddress);
    
    bytes memory uriEndSegment = _getTokenURIStorageRuntime();

    // Insert checksummed address into URI in name and image fields and return.
    return string(
      abi.encodePacked(      // Concatenate all the string segments together.
        _URI_START_SEGMENT,  // Data URI ID and initial formatting is constant.
        asciiHomeAddress,    // Checksummed home address is in the name field.
        uriEndSegment        // Description, image, and formatting is constant.
      )
    );
  }

  /**
   * @notice Pure function to get the token name.
   * @return String representing the token name.
   */
  function name() external pure returns (string memory) {
    return _NAME;
  }

  /**
   * @notice Pure function to get the token symbol.
   * @return String representing the token symbol.
   */
  function symbol() external pure returns (string memory) {
    return _SYMBOL;
  }

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
    returns (bytes32 key)
  {
    // Derive the key using the supplied salt and submitter.
    key = _deriveKey(salt, submitter);
  }

  /**
   * @notice Pure function to determine the home address that corresponds to
   * a given key.
   * @param key bytes32 The unique value used to derive the home address.
   * @return The home address.
   */
  function getHomeAddress(bytes32 key)
    external
    pure
    returns (address homeAddress)
  {
    // Derive the home address using the supplied key.
    homeAddress = _getHomeAddress(key);
  }

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
    returns (bytes32 metamorphicDelegatorInitializationCode)
  {
    metamorphicDelegatorInitializationCode = _HOME_INIT_CODE;
  }

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
    returns (bytes32 metamorphicDelegatorInitializationCodeHash)
  {
    metamorphicDelegatorInitializationCodeHash = _HOME_INIT_CODE_HASH;
  }

  /**
   * @notice Pure function for retrieving the prelude that will be inserted
   * ahead of the code payload in order to deploy a runtime storage contract.
   * @return The 11-byte "arbitrary runtime" prelude.
   */
  function getArbitraryRuntimeCodePrelude()
    external
    pure
    returns (bytes11 prelude)
  {
    prelude = _ARBITRARY_RUNTIME_PRELUDE;
  }

  /**
   * @notice Internal function for deploying a runtime storage contract given a
   * particular payload.
   * @return The address of the runtime storage contract.
   * @dev To take the provided code payload and deploy a contract with that
   * payload as its runtime code, use the following prelude:
   *
   * 0x600b5981380380925939f3...
   *
   * 00  60  push1 0b      [11 -> offset]
   * 02  59  msize         [offset, 0]
   * 03  81  dup2          [offset, 0, offset]
   * 04  38  codesize      [offset, 0, offset, codesize]
   * 05  03  sub           [offset, 0, codesize - offset]
   * 06  80  dup1          [offset, 0, codesize - offset, codesize - offset]
   * 07  92  swap3         [codesize - offset, 0, codesize - offset, offset]
   * 08  59  msize         [codesize - offset, 0, codesize - offset, offset, 0]
   * 09  39  codecopy      [codesize - offset, 0] <init_code_in_runtime>
   * 10  f3  return        [] *init_code_in_runtime*
   * ... init_code
   */
  function _deployRuntimeStorageContract(bytes memory payload)
    internal
    returns (address runtimeStorageContract)
  {
    // Construct the contract creation code using the prelude and the payload.
    bytes memory runtimeStorageContractCreationCode = abi.encodePacked(
      _ARBITRARY_RUNTIME_PRELUDE,
      payload
    );

    assembly {
      // Get the location and length of the newly-constructed creation code.
      let encoded_data := add(0x20, runtimeStorageContractCreationCode)
      let encoded_size := mload(runtimeStorageContractCreationCode)

      // Deploy the runtime storage contract via standard `CREATE`.
      runtimeStorageContract := create(0, encoded_data, encoded_size)

      // Pass along revert message if the contract did not deploy successfully.
      if iszero(runtimeStorageContract) {
        returndatacopy(0, 0, returndatasize)
        revert(0, returndatasize)
      }
    }

    // Emit an event with address of newly-deployed runtime storage contract.
    emit NewRuntimeStorageContract(runtimeStorageContract, keccak256(payload));
  }

  /**
   * @notice Internal function for deploying arbitrary contract code to the home
   * address corresponding to a suppied key via metamorphic initialization code.
   * @return The home address and the hash of the deployed runtime code.
   * @dev This deployment method uses the "metamorphic delegator" pattern, where
   * it will retrieve the address of the contract that contains the target
   * initialization code, then delegatecall into it, which executes the
   * initialization code stored there and returns the runtime code (or reverts).
   * Then, the runtime code returned by the delegatecall is returned, and since
   * we are still in the initialization context, it will be set as the runtime
   * code of the metamorphic contract. The 32-byte metamorphic initialization
   * code is as follows:
   *
   * 0x5859385958601c335a585952fa1582838382515af43d3d93833e601e57fd5bf3
   *
   * 00  58  PC               [0]
   * 01  59  MSIZE            [0, 0]
   * 02  38  CODESIZE         [0, 0, codesize -> 32]
   * 03  59  MSIZE            [0, 0, 32, 0]
   * 04  58  PC               [0, 0, 32, 0, 4]
   * 05  60  PUSH1 0x1c       [0, 0, 32, 0, 4, 28]
   * 07  33  CALLER           [0, 0, 32, 0, 4, 28, caller]
   * 08  5a  GAS              [0, 0, 32, 0, 4, 28, caller, gas]
   * 09  58  PC               [0, 0, 32, 0, 4, 28, caller, gas, 9 -> selector]
   * 10  59  MSIZE            [0, 0, 32, 0, 4, 28, caller, gas, selector, 0]
   * 11  52  MSTORE           [0, 0, 32, 0, 4, 28, caller, gas] <selector>
   * 12  fa  STATICCALL       [0, 0, 1 => success] <init_in_runtime_address>
   * 13  15  ISZERO           [0, 0, 0]
   * 14  82  DUP3             [0, 0, 0, 0]
   * 15  83  DUP4             [0, 0, 0, 0, 0]
   * 16  83  DUP4             [0, 0, 0, 0, 0, 0]
   * 17  82  DUP3             [0, 0, 0, 0, 0, 0, 0]
   * 18  51  MLOAD            [0, 0, 0, 0, 0, 0, init_in_runtime_address]
   * 19  5a  GAS              [0, 0, 0, 0, 0, 0, init_in_runtime_address, gas]
   * 20  f4  DELEGATECALL     [0, 0, 1 => success] {runtime_code}
   * 21  3d  RETURNDATASIZE   [0, 0, 1 => success, size]
   * 22  3d  RETURNDATASIZE   [0, 0, 1 => success, size, size]
   * 23  93  SWAP4            [size, 0, 1 => success, size, 0]
   * 24  83  DUP4             [size, 0, 1 => success, size, 0, 0]
   * 25  3e  RETURNDATACOPY   [size, 0, 1 => success] <runtime_code>
   * 26  60  PUSH1 0x1e       [size, 0, 1 => success, 30]
   * 28  57  JUMPI            [size, 0]
   * 29  fd  REVERT           [] *runtime_code*
   * 30  5b  JUMPDEST         [size, 0]
   * 31  f3  RETURN           []
   */
  function _deployToHomeAddress(bytes32 key)
    internal
    returns (address homeAddress, bytes32 runtimeCodeHash)
  {    
    assembly {
      // Write the 32-byte metamorphic initialization code to scratch space.
      mstore(
        0,
        0x5859385958601c335a585952fa1582838382515af43d3d93833e601e57fd5bf3
      )

      // Call `CREATE2` using above init code with the supplied key as the salt.
      homeAddress := create2(callvalue, 0, 32, key)

      // Pass along revert message if the contract did not deploy successfully.
      if iszero(homeAddress) {
        returndatacopy(0, 0, returndatasize)
        revert(0, returndatasize)
      }

      // Get the runtime hash of the deployed contract.
      runtimeCodeHash := extcodehash(homeAddress)
    }

    // Clear the address of the runtime storage contract from storage.
    delete _initializationRuntimeStorageContract;

    // Emit an event with home address, key, and runtime hash of new contract.
    emit NewResident(homeAddress, key, runtimeCodeHash);
  }

  /**
   * @notice Internal function for deriving a key given a particular salt and
   * caller and for performing verifications of, and modifications to, the
   * information set on that key.
   * @param salt bytes32 The value used to derive the key.
   * @return The derived key.
   */
  function _deriveKeyAndPrepareToDeploy(bytes32 salt)
    internal
    returns (bytes32 key)
  {
    // Derive the key using the supplied salt and the calling address.
    key = _deriveKey(salt, msg.sender);

    // Ensure that a contract is not currently deployed to the home address.
    require(_isNotDeployed(key), _ACCOUNT_EXISTS);

    // Set appropriate controller and increment contract deploy count at once.
    HomeAddress storage home = _home[key];
    if (!home.exists) {
      home.exists = true;
      home.controller = msg.sender;
      home.deploys += 1;

      // Emit an event signifying that this contract is now the controller. 
      emit NewController(key, msg.sender);
    
    } else {
      home.deploys += 1;
    }

    // Ensure that the caller is the designated controller before proceeding.
    require(home.controller == msg.sender, _ONLY_CONTROLLER);
  }

  /**
   * @notice Internal function for verifying that an owner that cannot accept
   * ERC721 tokens has not been supplied.
   * @param owner address The specified owner.
   * @param key bytes32 The unique value used to derive the home address.
   */
  function _validateOwner(address owner, bytes32 key) internal {
    // Ensure that the specified owner is a valid ERC721 receiver.
    require(
      _checkOnERC721Received(address(0), owner, uint256(key), bytes("")),
      "Owner must be an EOA or a contract that implements `onERC721Received`."
    );
  }

  /**
   * @notice Internal "view" function for determining if a contract currently
   * exists at a given home address corresponding to a particular key.
   * @param key bytes32 The unique value used to derive the home address.
   * @return A boolean signifying whether the home address has a contract
   * deployed or not.
   */
  function _isNotDeployed(bytes32 key)
    internal
    /* view */
    returns (bool notDeployed)
  {
    // Derive the home address using the supplied key.
    address homeAddress = _getHomeAddress(key);

    // Check whether account at home address is non-existent using EXTCODEHASH.
    bytes32 hash;
    assembly { hash := extcodehash(homeAddress) }

    // Account does not exist, and contract is not deployed, if hash equals 0.
    if (hash == bytes32(0)) {
      return true;
    }

    // Contract is deployed (notDeployed = false) if codesize is greater than 0.
    uint256 size;
    assembly { size := extcodesize(homeAddress) }
    if (size > 0) {
      return false;
    }

    // Declare variable to move current runtime storage from storage to memory.
    address currentStorage;

    // Set runtime storage contract to null address temporarily if necessary.
    if (_initializationRuntimeStorageContract != address(0)) {
      // Place the current runtime storage contract address in memory.
      currentStorage = _initializationRuntimeStorageContract;
      
      // Remove the existing runtime storage contract address from storage.
      delete _initializationRuntimeStorageContract;
    }

    // Set gas to use when performing dry-run deployment (future-proof a bit).
    uint256 checkGas = 27000 + (block.gaslimit / 1000);
    
    // As a last resort, deploy a contract to the address and revert on success.
    (bool contractExists, bytes memory code) = address(this).call.gas(checkGas)(
      abi.encodeWithSelector(this.staticCreate2Check.selector, key)
    );

    // Place runtime storage contract back in storage if necessary.
    if (currentStorage != address(0)) {
      _initializationRuntimeStorageContract = currentStorage;
    }

    // Check revert string to ensure failure is due to successful deployment.
    bytes32 revertMessage;
    assembly { revertMessage := mload(add(code, 32)) }

    // Contract is not deployed if `staticCreate2Check` reverted with message.
    notDeployed = !contractExists && revertMessage == _HOME_INIT_CODE;
  }

  /**
   * @notice Internal view function for verifying that a restricted controller
   * has not been supplied.
   * @param controller address The specified controller.
   * @param key bytes32 The unique value used to derive the home address.
   */
  function _validateController(address controller, bytes32 key) internal view {
    // Prevent the controller from being set to prohibited account values.
    require(
      controller != address(0),
      "The null address may not be set as the controller using this function."
    );
    require(
      controller != address(this),
      "This contract may not be set as the controller using this function."
    );
    require(
      controller != _getHomeAddress(key),
      "Home addresses cannot be set as the controller of themselves."
    );
  }

  /**
   * @notice Internal view function for verifying that a supplied runtime
   * storage contract is not empty.
   * @param target address The runtime storage contract.
   */
  function _validateRuntimeStorageIsNotEmpty(address target) internal view {
    // Ensure that the runtime storage contract is not empty.
    require(
      target.isContract(),
      "No runtime code found at the supplied runtime storage address."
    );
  }

  /**
   * @notice Internal view function for retrieving the controller of a home
   * address corresponding to a particular key.
   * @param key bytes32 The unique value used to derive the home address.
   * @return The controller of the home address corresponding to the supplied
   * key.
   */
  function _getController(bytes32 key)
    internal
    view
    returns (address controller)
  {
    // Get controller from mapping, defaulting to first 20 bytes of the key.
    HomeAddress memory home = _home[key];
    if (!home.exists) {
      controller = address(bytes20(key));
    } else {
      controller = home.controller;
    }
  }

  /**
   * @notice Internal view function for getting the runtime code at the tokenURI
   * data storage address.
   * @return The runtime code at the tokenURI storage address.
   */
  function _getTokenURIStorageRuntime()
    internal
    view
    returns (bytes memory runtime)
  {
    // Bring the tokenURI storage address into memory for use in assembly block.
    address target = _URI_END_SEGMENT_STORAGE;
    
    assembly {
      // Retrieve the size of the external code.
      let size := extcodesize(target)
      
      // Allocate output byte array.
      runtime := mload(0x40)
      
      // Set new "memory end" including padding.
      mstore(0x40, add(runtime, and(add(size, 0x3f), not(0x1f))))
      
      // Store length in memory.
      mstore(runtime, size)
      
      // Get the code using extcodecopy.
      extcodecopy(target, add(runtime, 0x20), 0, size)
    }
  }

  /**
   * @notice Internal pure function for calculating a home address given a
   * particular key.
   * @param key bytes32 The unique value used to derive the home address.
   * @return The home address corresponding to the supplied key.
   */
  function _getHomeAddress(bytes32 key)
    internal
    pure
    returns (address homeAddress)
  {
    // Determine the home address by replicating CREATE2 logic.
    homeAddress = address(
      uint160(                       // Downcast to match the address type.
        uint256(                     // Cast to uint to truncate upper digits.
          keccak256(                 // Compute CREATE2 hash using 4 inputs.
            abi.encodePacked(        // Pack all inputs to the hash together.
              _FF_AND_THIS_CONTRACT, // This contract will be the caller.
              key,                   // Pass in the supplied key as the salt.
              _HOME_INIT_CODE_HASH   // The metamorphic init code hash.
            )
          )
        )
      )
    );
  }

  /**
   * @notice Internal pure function for deriving a key given a particular salt
   * and caller.
   * @param salt bytes32 The value used to derive the key.
   * @param submitter address The submitter of the salt used to derive the key.
   * @return The derived key.
   */
  function _deriveKey(bytes32 salt, address submitter)
    internal
    pure
    returns (bytes32 key)
  {
    // Set the key as the keccak256 hash of the salt and submitter.
    key = keccak256(abi.encodePacked(salt, submitter));
  }

  /**
   * @notice Internal pure function for converting the bytes representation of
   * an address to an ASCII string. This function is derived from the function
   * at https://ethereum.stackexchange.com/a/56499/48410
   * @param data bytes20 The account address to be converted.
   * @return The account string in ASCII format. Note that leading "0x" is not
   * included.
   */
  function _toAsciiString(bytes20 data)
    internal
    pure
    returns (string memory asciiString)
  {
    // Create an in-memory fixed-size bytes array.
    bytes memory asciiBytes = new bytes(40);

    // Declare variable types.
    uint8 oneByte;
    uint8 leftNibble;
    uint8 rightNibble;

    // Iterate over bytes, processing left and right nibble in each iteration.
    for (uint256 i = 0; i < data.length; i++) {
      // locate the byte and extract each nibble.
      oneByte = uint8(uint160(data) / (2 ** (8 * (19 - i))));
      leftNibble = oneByte / 16;
      rightNibble = oneByte - 16 * leftNibble;

      // To convert to ascii characters, add 48 to 0-9 and 87 to a-f.
      asciiBytes[2 * i] = byte(leftNibble + (leftNibble < 10 ? 48 : 87));
      asciiBytes[2 * i + 1] = byte(rightNibble + (rightNibble < 10 ? 48 : 87));
    }

    asciiString = string(asciiBytes);
  }

  /**
   * @notice Internal pure function for getting a fixed-size array of whether or
   * not each character in an account will be capitalized in the checksum.
   * @param account address The account to get the checksum capitalization
   * information for.
   * @return A fixed-size array of booleans that signify if each character or
   * "nibble" of the hex encoding of the address will be capitalized by the
   * checksum.
   */
  function _getChecksumCapitalizedCharacters(address account)
    internal
    pure
    returns (bool[40] memory characterIsCapitalized)
  {
    // Convert the address to bytes.
    bytes20 addressBytes = bytes20(account);

    // Hash the address (used to calculate checksum).
    bytes32 hash = keccak256(abi.encodePacked(_toAsciiString(addressBytes)));

    // Declare variable types.
    uint8 leftNibbleAddress;
    uint8 rightNibbleAddress;
    uint8 leftNibbleHash;
    uint8 rightNibbleHash;

    // Iterate over bytes, processing left and right nibble in each iteration.
    for (uint256 i; i < addressBytes.length; i++) {
      // locate the byte and extract each nibble for the address and the hash.
      rightNibbleAddress = uint8(addressBytes[i]) % 16;
      leftNibbleAddress = (uint8(addressBytes[i]) - rightNibbleAddress) / 16;
      rightNibbleHash = uint8(hash[i]) % 16;
      leftNibbleHash = (uint8(hash[i]) - rightNibbleHash) / 16;

      // Set the capitalization flags based on the characters and the checksums.
      characterIsCapitalized[2 * i] = (
        leftNibbleAddress > 9 &&
        leftNibbleHash > 7
      );
      characterIsCapitalized[2 * i + 1] = (
        rightNibbleAddress > 9 &&
        rightNibbleHash > 7
      );
    }
  }

  /**
   * @notice Internal pure function for converting the bytes representation of
   * an address to a checksummed ASCII string.
   * @param account address The account address to be converted.
   * @return The checksummed account string in ASCII format. Note that leading
   * "0x" is not included.
   */
  function _toChecksummedAsciiString(address account)
    internal
    pure
    returns (string memory checksummedAsciiString)
  {
    // Get capitalized characters in the checksum.
    bool[40] memory caps = _getChecksumCapitalizedCharacters(account);

    // Create an in-memory fixed-size bytes array.
    bytes memory asciiBytes = new bytes(40);

    // Declare variable types.
    uint8 oneByte;
    uint8 leftNibble;
    uint8 rightNibble;
    uint8 leftNibbleOffset;
    uint8 rightNibbleOffset;

    // Convert account to bytes20.
    bytes20 data = bytes20(account);

    // Iterate over bytes, processing left and right nibble in each iteration.
    for (uint256 i = 0; i < data.length; i++) {
      // locate the byte and extract each nibble.
      oneByte = uint8(uint160(data) / (2 ** (8 * (19 - i))));
      leftNibble = oneByte / 16;
      rightNibble = oneByte - 16 * leftNibble;

      // To convert to ascii characters, add 48 to 0-9, 55 to A-F, & 87 to a-f.
      if (leftNibble < 10) {
        leftNibbleOffset = 48;
      } else if (caps[i * 2]) {
        leftNibbleOffset = 55;
      } else {
        leftNibbleOffset = 87;
      }

      if (rightNibble < 10) {
        rightNibbleOffset = 48;
      } else {
        rightNibbleOffset = caps[(i * 2) + 1] ? 55 : 87; // instrumentation fix
      }

      asciiBytes[2 * i] = byte(leftNibble + leftNibbleOffset);
      asciiBytes[2 * i + 1] = byte(rightNibble + rightNibbleOffset);
    }

    checksummedAsciiString = string(asciiBytes);
  }

  /**
   * @notice Modifier to ensure that a contract is not currently deployed to the
   * home address corresponding to a given key on the decorated function.
   * @param key bytes32 The unique value used to derive the home address.
   */
  modifier onlyEmpty(bytes32 key) {
    require(_isNotDeployed(key), _ACCOUNT_EXISTS);
    _;
  }

  /**
   * @notice Modifier to ensure that the caller of the decorated function is the
   * controller of the home address corresponding to a given key.
   * @param key bytes32 The unique value used to derive the home address.
   */
  modifier onlyController(bytes32 key) {
    require(_getController(key) == msg.sender, _ONLY_CONTROLLER);
    _;
  }

  /**
   * @notice Modifier to track initial controllers and to count deploys, and to
   * validate that only the designated controller has access to the decorated
   * function.
   * @param key bytes32 The unique value used to derive the home address.
   */
  modifier onlyControllerDeployer(bytes32 key) {
    HomeAddress storage home = _home[key];

    // Set appropriate controller and increment contract deploy count at once.
    if (!home.exists) {
      home.exists = true;
      home.controller = address(bytes20(key));
      home.deploys += 1;
    } else {
      home.deploys += 1;
    }

    require(home.controller == msg.sender, _ONLY_CONTROLLER);
    _;
  }

  /**
   * @notice Modifier to ensure that only the owner of the supplied ERC721
   * token, or an approved spender, can access the decorated function.
   * @param tokenId uint256 The ID of the ERC721 token.
   */
  modifier onlyTokenOwnerOrApprovedSpender(uint256 tokenId) {
    require(
      _isApprovedOrOwner(msg.sender, tokenId),
      "Only the token owner or an approved spender may call this function."
    );
    _;
  }
}
