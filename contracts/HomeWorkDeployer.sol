pragma solidity 0.5.9; // optimization enabled, runs: 10000, evm: constantinople


/**
 * @title HomeWork Deployer (alpha version)
 * @author 0age
 * @notice This contract is a stripped-down version of HomeWork that is used to
 * deploy HomeWork itself.
 */
contract HomeWorkDeployer {
  // Fires when HomeWork has been deployed.
  event HomeWorkDeployment(address homeAddress, bytes32 key);

  // Fires HomeWork's initialization-in-runtime storage contract is deployed.
  event StorageContractDeployment(address runtimeStorageContract);

  // Allocate storage to track the current initialization-in-runtime contract.
  address private _initializationRuntimeStorageContract;

  // Once HomeWork has been deployed, disable this contract.
  bool private _disabled;

  // Write arbitrary code to a contract's runtime using the following prelude.
  bytes11 private constant _ARBITRARY_RUNTIME_PRELUDE = bytes11(
    0x600b5981380380925939f3
  );

  /**
   * @notice Perform phase one of the deployment.
   * @param code bytes The contract creation code for HomeWork.
   */
  function phaseOne(bytes calldata code) external onlyUntilDisabled {
    // Deploy payload to the runtime storage contract and set the address.
    _initializationRuntimeStorageContract = _deployRuntimeStorageContract(
      bytes32(0),
      code
    );
  }

  /**
   * @notice Perform phase two of the deployment (tokenURI data).
   * @param key bytes32 The salt to provide to create2.
   */
  function phaseTwo(bytes32 key) external onlyUntilDisabled {
    // Deploy runtime storage contract with the string used to construct end of
    // token URI for issued ERC721s (data URI with a base64-encoded jpeg image).    
    bytes memory code = abi.encodePacked(
      hex"222c226465736372697074696f6e223a22546869732532304e465425323063616e25",
      hex"3230626525323072656465656d65642532306f6e253230486f6d65576f726b253230",
      hex"746f2532306772616e7425323061253230636f6e74726f6c6c657225323074686525",
      hex"32306578636c75736976652532307269676874253230746f2532306465706c6f7925",
      hex"3230636f6e7472616374732532307769746825323061726269747261727925323062",
      hex"797465636f6465253230746f25323074686525323064657369676e61746564253230",
      hex"686f6d65253230616464726573732e222c22696d616765223a22646174613a696d61",
      hex"67652f7376672b786d6c3b636861727365743d7574662d383b6261736536342c5048",
      hex"4e325a79423462577875637a30696148523063446f764c336433647935334d793576",
      hex"636d63764d6a41774d43397a646d636949485a705a58644362336739496a41674d43",
      hex"41784e4451674e7a4969506a787a64486c735a543438495674445245465551567375",
      hex"516e747a64484a766132557462476c755a57707661573436636d3931626d52394c6b",
      hex"4e37633352796232746c4c5731706447567962476c74615851364d5442394c6b5237",
      hex"633352796232746c4c5864705a48526f4f6a4a394c6b56375a6d6c7362446f6a4f57",
      hex"4935596a6c686653354765334e30636d39725a5331736157356c593246774f6e4a76",
      hex"6457356b66563164506a7776633352356247552b5047636764484a68626e4e6d6233",
      hex"4a7450534a74595852796158676f4d5334774d694177494441674d5334774d694134",
      hex"4c6a45674d436b69506a78775958526f49475a706247773949694e6d5a6d59694947",
      hex"5139496b30784f53417a4d6d677a4e4859794e4567784f586f694c7a34385a79427a",
      hex"64484a766132553949694d774d44416949474e7359584e7a50534a4349454d675243",
      hex"492b50484268644767675a6d6c7362443069493245314e7a6b7a4f5349675a443069",
      hex"545449314944517761446c324d545a6f4c546c364969382b50484268644767675a6d",
      hex"6c7362443069497a6b795a444e6d4e5349675a443069545451774944517761446832",
      hex"4e3267744f486f694c7a3438634746306143426d615778735053496a5a5745315954",
      hex"51334969426b50534a4e4e544d674d7a4a494d546c324c5446734d5459744d545967",
      hex"4d5467674d545a364969382b50484268644767675a6d6c7362443069626d39755a53",
      hex"49675a4430695454453549444d7961444d30646a49305344453565694976506a7877",
      hex"5958526f49475a706247773949694e6c595456684e44636949475139496b30794f53",
      hex"41794d5777744e53413164693035614456364969382b5043396e506a77765a7a3438",
      hex"5a794230636d467563325a76636d3039496d316864484a70654367754f4451674d43",
      hex"4177494334344e4341324e5341314b53492b50484268644767675a44306954546b75",
      hex"4e5341794d693435624451754f4341324c6a52684d7934784d69417a4c6a45794944",
      hex"41674d4341784c544d674d693479624330304c6a67744e6934305979347a4c544575",
      hex"4e4341784c6a59744d69343049444d744d693479656949675a6d6c73624430694932",
      hex"517759325a6a5a534976506a78775958526f49475a706247773949694d774d544178",
      hex"4d44456949475139496b30304d53343349444d344c6a56734e5334784c5459754e53",
      hex"4976506a78775958526f49475139496b30304d693435494449334c6a684d4d546775",
      hex"4e4341314f4334784944493049445979624449784c6a67744d6a63754d7941794c6a",
      hex"4d744d693434656949675932786863334d39496b55694c7a3438634746306143426d",
      hex"615778735053496a4d4445774d5441784969426b50534a4e4e444d754e4341794f53",
      hex"347a624330304c6a63674e5334344969382b50484268644767675a44306954545132",
      hex"4c6a67674d7a4a6a4d793479494449754e6941344c6a63674d533479494445794c6a",
      hex"45744d793479637a4d754e6930354c6a6b754d7930784d693431624330314c6a4567",
      hex"4e6934314c5449754f4330754d5330754e7930794c6a63674e5334784c5459754e57",
      hex"4d744d7934794c5449754e6930344c6a63744d5334794c5445794c6a45674d793479",
      hex"6379307a4c6a59674f5334354c53347a494445794c6a556949474e7359584e7a5053",
      hex"4a464969382b50484268644767675a6d6c7362443069493245314e7a6b7a4f534967",
      hex"5a443069545449334c6a4d674d6a5a734d5445754f4341784e53343349444d754e43",
      hex"41794c6a51674f533478494445304c6a51744d793479494449754d79307849433433",
      hex"4c5445774c6a49744d544d754e6930784c6a4d744d7934354c5445784c6a67744d54",
      hex"55754e336f694c7a3438634746306143426b50534a4e4d5449674d546b754f577731",
      hex"4c6a6b674e793435494445774c6a49744e7934324c544d754e4330304c6a567a4e69",
      hex"34344c5455754d5341784d4334334c5451754e574d77494441744e6934324c544d74",
      hex"4d544d754d7941784c6a46544d5449674d546b754f5341784d6941784f5334356569",
      hex"49675932786863334d39496b55694c7a34385a79426d6157787350534a756232356c",
      hex"4969427a64484a766132553949694d774d44416949474e7359584e7a50534a434945",
      hex"4d675243492b50484268644767675a44306954545579494455344c6a6c4d4e444175",
      hex"4f5341304d7934796243307a4c6a45744d69347a4c5445774c6a59744d5451754e79",
      hex"30794c6a6b674d693479494445774c6a59674d5451754e7941784c6a45674d793432",
      hex"494445784c6a55674d5455754e58704e4d5449754e5341784f533434624455754f43",
      hex"4134494445774c6a4d744e7934304c544d754d7930304c6a5a7a4e6934354c545567",
      hex"4d5441754f4330304c6a4e6a4d4341774c5459754e69307a4c6a45744d544d754d79",
      hex"3435637930784d43347a494463754e4330784d43347a494463754e4870744c544975",
      hex"4e6941794c6a6c734e433433494459754e574d744c6a55674d53347a4c5445754e79",
      hex"41794c6a45744d7941794c6a4a734c5451754e7930324c6a566a4c6a4d744d533430",
      hex"494445754e6930794c6a51674d7930794c6a4a364969382b50484268644767675a44",
      hex"3069545451784c6a4d674d7a67754e5777314c6a45744e6934316253307a4c6a5574",
      hex"4d693433624330304c6a59674e533434625467754d53307a4c6a466a4d7934794944",
      hex"49754e6941344c6a63674d533479494445794c6a45744d793479637a4d754e693035",
      hex"4c6a6b754d7930784d693431624330314c6a45674e6934314c5449754f4330754d53",
      hex"30754f4330794c6a63674e5334784c5459754e574d744d7934794c5449754e693034",
      hex"4c6a63744d5334794c5445794c6a45674d7934794c544d754e4341304c6a4d744d79",
      hex"343249446b754f5330754d7941784d6934314969426a6247467a637a306952694976",
      hex"506a78775958526f49475139496b307a4d433434494451304c6a524d4d546b674e54",
      hex"67754f57773049444d674d5441744d5449754e7949675932786863334d39496b5969",
      hex"4c7a34384c32632b5043396e506a777663335a6e50673d3d227d"
    ); /* ","description":"This%20NFT%20can%20be%20redeemed%20on%20HomeWork%20
          to%20grant%20a%20controller%20the%20exclusive%20right%20to%20deploy%20
          contracts%20with%20arbitrary%20bytecode%20to%20the%20designated%20home
          %20address.","image":"data:image/svg+xml;charset=utf-8;base64,..."} */

    // Deploy payload to the runtime storage contract.
    _deployRuntimeStorageContract(key, code);
  }

  /**
   * @notice Perform phase three of the deployment and disable this contract.
   * @param key bytes32 The salt to provide to create2.
   */
  function phaseThree(bytes32 key) external onlyUntilDisabled {
    // Use metamorphic initialization code to deploy contract to home address.
    _deployToHomeAddress(key);

    // Disable this contract from here on out - use HomeWork itself instead.
    _disabled = true;
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
   * @notice Internal function for deploying a runtime storage contract given a
   * particular payload.
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
  function _deployRuntimeStorageContract(bytes32 key, bytes memory payload)
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

      // Deploy the runtime storage contract via `CREATE2`.
      runtimeStorageContract := create2(0, encoded_data, encoded_size, key)

      // Pass along revert message if the contract did not deploy successfully.
      if iszero(runtimeStorageContract) {
        returndatacopy(0, 0, returndatasize)
        revert(0, returndatasize)
      }
    }

    // Emit an event with address of newly-deployed runtime storage contract.
    emit StorageContractDeployment(runtimeStorageContract);
  }

  /**
   * @notice Internal function for deploying arbitrary contract code to the home
   * address corresponding to a suppied key via metamorphic initialization code.
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
   * returndatac03  59  MSIZE            [0, 0, 32, 0]
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
  function _deployToHomeAddress(bytes32 key) internal {
    // Declare a variable for the home address.
    address homeAddress;

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
    }

    // Clear the address of the runtime storage contract from storage.
    delete _initializationRuntimeStorageContract;

    // Emit an event with home address and key for the newly-deployed contract.
    emit HomeWorkDeployment(homeAddress, key);
  }

  /**
   * @notice Modifier to disable the contract once deployment is complete.
   */
  modifier onlyUntilDisabled() {
    require(!_disabled, "Contract is disabled.");
    _;
  }
}
