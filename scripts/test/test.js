var assert = require('assert')
var fs = require('fs')
var util = require('ethereumjs-util')

const HomeWorkDeployerArtifact = require('../../build/contracts/HomeWorkDeployer.json')
const HomeWorkArtifact = require('../../build/contracts/HomeWork.json')

const MockContractArtifact = require('../../build/contracts/MockContract.json')
const MockRevertContractArtifact = require('../../build/contracts/MockRevertContract.json')
const MockCodeCheckArtifact = require('../../build/contracts/MockCodeCheck.json')
const MockERC20StubArtifact = require('../../build/contracts/MockERC20Stub.json')
const MockERC721HolderArtifact = require('../../build/contracts/MockERC721Holder.json')
const MockReentryPartOneArtifact = require('../../build/contracts/MockReentryPartOne.json')
const MockReentryPartTwoArtifact = require('../../build/contracts/MockReentryPartTwo.json')

const METAMORPHIC_INIT_CODE = '0x5859385958601c335a585952fa1582838382515af43d3d93833e601e57fd5bf3'
const METAMORPHIC_INIT_CODE_HASH = '0x7816562e7f85866cae07183593075f3b5ec32aeff914a0693e20aaf39672babc'
const INIT_CODE_IN_RUNTIME_CODE_PRELUDE = '0x600b5981380380925939f3'
const nullAddress = '0x0000000000000000000000000000000000000000'
const nullBytes32 = '0x0000000000000000000000000000000000000000000000000000000000000000'
const emptyHash = '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'

const keylessCreate2DeployerAddress = '0x4c8D290a1B368ac4728d83a9e8321fC3af2b39b1'
const keylessCreate2DeploymentTransaction = '0xf87e8085174876e800830186a08080ad601f80600e600039806000f350fe60003681823780368234f58015156014578182fd5b80825250506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222'
const keylessCreate2Address = '0x7A0D94F55792C434d74a40883C6ed8545E406D12'

const uriDeployKey = (
  '0x486f6d65576f726b202d20746f6b656e55524920c21352fee5a62228db000000'
)

const deployKey = (
  '0x486f6d65576f726b20f09f8fa0f09f9ba0efb88faa3c548a76f9bd3c000c0000'
)

const uriRuntime = (
  '0x222c226465736372697074696f6e223a22546869732532304e465425323063616e253230626525323072656465656d65642532306f6e253230486f6d65576f726b253230746f2532306772616e7425323061253230636f6e74726f6c6c65722532307468652532306578636c75736976652532307269676874253230746f2532306465706c6f79253230636f6e7472616374732532307769746825323061726269747261727925323062797465636f6465253230746f25323074686525323064657369676e61746564253230686f6d65253230616464726573732e222c22696d616765223a22646174613a696d6167652f7376672b786d6c3b636861727365743d7574662d383b6261736536342c50484e325a79423462577875637a30696148523063446f764c336433647935334d793576636d63764d6a41774d43397a646d636949485a705a58644362336739496a41674d4341784e4451674e7a4969506a787a64486c735a543438495674445245465551567375516e747a64484a766132557462476c755a57707661573436636d3931626d52394c6b4e37633352796232746c4c5731706447567962476c74615851364d5442394c6b5237633352796232746c4c5864705a48526f4f6a4a394c6b56375a6d6c7362446f6a4f574935596a6c686653354765334e30636d39725a5331736157356c593246774f6e4a766457356b66563164506a7776633352356247552b5047636764484a68626e4e6d62334a7450534a74595852796158676f4d5334774d694177494441674d5334774d6941344c6a45674d436b69506a78775958526f49475a706247773949694e6d5a6d596949475139496b30784f53417a4d6d677a4e4859794e4567784f586f694c7a34385a79427a64484a766132553949694d774d44416949474e7359584e7a50534a4349454d675243492b50484268644767675a6d6c7362443069493245314e7a6b7a4f5349675a443069545449314944517761446c324d545a6f4c546c364969382b50484268644767675a6d6c7362443069497a6b795a444e6d4e5349675a4430695454517749445177614468324e3267744f486f694c7a3438634746306143426d615778735053496a5a574531595451334969426b50534a4e4e544d674d7a4a494d546c324c5446734d5459744d5459674d5467674d545a364969382b50484268644767675a6d6c7362443069626d39755a5349675a4430695454453549444d7961444d30646a49305344453565694976506a78775958526f49475a706247773949694e6c595456684e44636949475139496b30794f5341794d5777744e53413164693035614456364969382b5043396e506a77765a7a34385a794230636d467563325a76636d3039496d316864484a70654367754f4451674d434177494334344e4341324e5341314b53492b50484268644767675a44306954546b754e5341794d693435624451754f4341324c6a52684d7934784d69417a4c6a4579494441674d4341784c544d674d693479624330304c6a67744e6934305979347a4c5445754e4341784c6a59744d69343049444d744d693479656949675a6d6c73624430694932517759325a6a5a534976506a78775958526f49475a706247773949694d774d5441784d44456949475139496b30304d53343349444d344c6a56734e5334784c5459754e534976506a78775958526f49475139496b30304d693435494449334c6a684d4d5467754e4341314f4334784944493049445979624449784c6a67744d6a63754d7941794c6a4d744d693434656949675932786863334d39496b55694c7a3438634746306143426d615778735053496a4d4445774d5441784969426b50534a4e4e444d754e4341794f53347a624330304c6a63674e5334344969382b50484268644767675a443069545451324c6a67674d7a4a6a4d793479494449754e6941344c6a63674d533479494445794c6a45744d793479637a4d754e6930354c6a6b754d7930784d693431624330314c6a45674e6934314c5449754f4330754d5330754e7930794c6a63674e5334784c5459754e574d744d7934794c5449754e6930344c6a63744d5334794c5445794c6a45674d7934796379307a4c6a59674f5334354c53347a494445794c6a556949474e7359584e7a50534a464969382b50484268644767675a6d6c7362443069493245314e7a6b7a4f5349675a443069545449334c6a4d674d6a5a734d5445754f4341784e53343349444d754e4341794c6a51674f533478494445304c6a51744d793479494449754d793078494334334c5445774c6a49744d544d754e6930784c6a4d744d7934354c5445784c6a67744d5455754e336f694c7a3438634746306143426b50534a4e4d5449674d546b754f5777314c6a6b674e793435494445774c6a49744e7934324c544d754e4330304c6a567a4e6934344c5455754d5341784d4334334c5451754e574d77494441744e6934324c544d744d544d754d7941784c6a46544d5449674d546b754f5341784d6941784f533435656949675932786863334d39496b55694c7a34385a79426d6157787350534a756232356c4969427a64484a766132553949694d774d44416949474e7359584e7a50534a4349454d675243492b50484268644767675a44306954545579494455344c6a6c4d4e4441754f5341304d7934796243307a4c6a45744d69347a4c5445774c6a59744d5451754e7930794c6a6b674d693479494445774c6a59674d5451754e7941784c6a45674d793432494445784c6a55674d5455754e58704e4d5449754e5341784f533434624455754f434134494445774c6a4d744e7934304c544d754d7930304c6a5a7a4e6934354c5455674d5441754f4330304c6a4e6a4d4341774c5459754e69307a4c6a45744d544d754d793435637930784d43347a494463754e4330784d43347a494463754e4870744c5449754e6941794c6a6c734e433433494459754e574d744c6a55674d53347a4c5445754e7941794c6a45744d7941794c6a4a734c5451754e7930324c6a566a4c6a4d744d533430494445754e6930794c6a51674d7930794c6a4a364969382b50484268644767675a443069545451784c6a4d674d7a67754e5777314c6a45744e6934316253307a4c6a55744d693433624330304c6a59674e533434625467754d53307a4c6a466a4d793479494449754e6941344c6a63674d533479494445794c6a45744d793479637a4d754e6930354c6a6b754d7930784d693431624330314c6a45674e6934314c5449754f4330754d5330754f4330794c6a63674e5334784c5459754e574d744d7934794c5449754e6930344c6a63744d5334794c5445794c6a45674d7934794c544d754e4341304c6a4d744d79343249446b754f5330754d7941784d6934314969426a6247467a637a306952694976506a78775958526f49475139496b307a4d433434494451304c6a524d4d546b674e5467754f57773049444d674d5441744d5449754e7949675932786863334d39496b59694c7a34384c32632b5043396e506a777663335a6e50673d3d227d'
)

// pull this out so that coverage instrumentation won't alter deploy address.
const deployBytecode = (
  '0x608060405234801561001057600080fd5b5061136d806100206000396000f3fe608060405234801561001057600080fd5b50600436106100495760003560e01c8060091461004e578063131a2f411461007f578063d96a852e1461009e578063e65f3a9f146100bb575b600080fd5b61005661012b565b6040805173ffffffffffffffffffffffffffffffffffffffff9092168252519081900360200190f35b61009c6004803603602081101561009557600080fd5b5035610147565b005b61009c600480360360208110156100b457600080fd5b503561055d565b61009c600480360360208110156100d157600080fd5b8101906020810181356401000000008111156100ec57600080fd5b8201836020820111156100fe57600080fd5b8035906020019184600183028401116401000000008311171561012057600080fd5b509092509050610632565b60005473ffffffffffffffffffffffffffffffffffffffff1690565b60005474010000000000000000000000000000000000000000900460ff16156101d157604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601560248201527f436f6e74726163742069732064697361626c65642e0000000000000000000000604482015290519081900360640190fd5b60606040516020018080610cfb6022913960220180610c7360229139602201806110b36022913960220180610a0f6022913960220180610ab96022913960220180610cb760229139602201806110f76022913960220180610f816022913960220180610adb6022913960220180610dc760229139602201806112d36022913960220180610c2f602291396022018061113b6022913960220180610d1d6022913960220180610a756022913960220180610ef96022913960220180610f5f6022913960220180610c516022913960220180610e2d60229139602201806110d5602291396022018061106f60229139602201806110096022913960220180610f3d6022913960220180610e936022913960220180610eb56022913960220180610c0d6022913960220180610ba760229139602201806109ed6022913960220180610e0b6022913960220180610f1b6022913960220180610d836022913960220180610b856022913960220180610ed76022913960220180611091602291396022018061122960229139602201806109cb60229139602201806112f560229139602201806113176022913960220180610c956022913960220180610fc560229139602201806111c36022913960220180610de960229139602201806111a16022913960220180610fa360229139602201806111e5602291396022018061115d6022913960220180610afd602291396022018061126d602291396022018061102b6022913960220180610943602291396022018061096560229139602201806109a96022913960220180610a536022913960220180610fe76022913960220180610beb6022913960220180610b416022913960220180610b63602291396022018061104d6022913960220180610cd96022913960220180610987602291396022018061124b60229139602201806112b16022913960220180610d616022913960220180610b1f60229139602201806112076022913960220180610d3f6022913960220180610a97602291396022018061128f6022913960220180610e716022913960220180610bc960229139602201806111196022913960220180610a31602291396022018061117f6022913960220180610da56022913960220180610e4f60229139602201807f4c7a34384c32632b5043396e506a777663335a6e50673d3d227d000000000000815250601a01905060405160208183030381529060405290506105588282610748565b505050565b60005474010000000000000000000000000000000000000000900460ff16156105e757604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601560248201527f436f6e74726163742069732064697361626c65642e0000000000000000000000604482015290519081900360640190fd5b6105f081610887565b50600080547fffffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffff1674010000000000000000000000000000000000000000179055565b60005474010000000000000000000000000000000000000000900460ff16156106bc57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601560248201527f436f6e74726163742069732064697361626c65642e0000000000000000000000604482015290519081900360640190fd5b6106ff6000801b83838080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525061074892505050565b600080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff929092169190911790555050565b600060606a600b5981380380925939f360a81b83604051602001808374ffffffffffffffffffffffffffffffffffffffffff191674ffffffffffffffffffffffffffffffffffffffffff19168152600b0182805190602001908083835b602083106107e257805182527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe090920191602091820191016107a5565b6001836020036101000a0380198251168184511680821785525050505050509050019250505060405160208183030381529060405290508060200181518581836000f5935083610836573d6000803e3d6000fd5b50506040805173ffffffffffffffffffffffffffffffffffffffff8416815290517e1646301cb41f8f4707c3f7133579372fa8f1f970bff1f9bbd954c9dc4993d59181900360200190a15092915050565b60007f5859385958601c335a585952fa1582838382515af43d3d93833e601e57fd5bf3600052816020600034f59050806108c5573d6000803e3d6000fd5b600080547fffffffffffffffffffffffff00000000000000000000000000000000000000001690556040805173ffffffffffffffffffffffffffffffffffffffff831681526020810184905281517fcfd7d9f356663d207d975fad05045eae2e2bf7bfb20ccc822bc361527a46c8c9929181900390910190a1505056fe4c5445774c6a49744d544d754e6930784c6a4d744d7934354c5445784c6a67744d5455754e336f694c7a3438634746306143426b50534a4e4d5449674d546b754f577731494445784c6a55674d5455754e58704e4d5449754e5341784f533434624455754f434c6a6b674e793435494445774c6a49744e7934324c544d754e4330304c6a567a4e694d44456949475139496b30304d53343349444d344c6a56734e5334784c5459754e535958526f49475a706247773949694e6c595456684e44636949475139496b30794f5332306578636c75736976652532307269676874253230746f2532306465706c6f79254c6a63744d5334794c5445794c6a45674d7934794c544d754e4341304c6a4d744d7934344c5455754d5341784d4334334c5451754e574d77494441744e6934324c544d744935596a6c686653354765334e30636d39725a5331736157356c593246774f6e4a763069545451784c6a4d674d7a67754e5777314c6a45744e6934316253307a4c6a55743230636f6e74726163747325323077697468253230617262697472617279253230624e325a79423462577875637a30696148523063446f764c336433647935334d7935764a464969382b50484268644767675a6d6c7362443069493245314e7a6b7a4f5349674e6941794c6a6c734e433433494459754e574d744c6a55674d53347a4c5445754e794969427a64484a766132553949694d774d44416949474e7359584e7a50534a4349454d675243492b50484268644767675a44306954545579494455344c6a6c4d4e4441754e5341794d693435624451754f4341324c6a52684d7934784d69417a4c6a4579494449675a4430695454453549444d7961444d30646a49305344453565694976506a78774c6a6b754d7930784d693431624330314c6a45674e6934314c5449754f4330754d5349675932786863334d39496b55694c7a34385a79426d6157787350534a756232356c4d5467674d545a364969382b50484268644767675a6d6c7362443069626d39755a53516e747a64484a766132557462476c755a57707661573436636d3931626d52394c6b4c6a45674d436b69506a78775958526f49475a706247773949694e6d5a6d596949473230626525323072656465656d65642532306f6e253230486f6d65576f726b2532304d744d693434656949675932786863334d39496b55694c7a3438634746306143426d797465636f6465253230746f25323074686525323064657369676e6174656425323030794c6a6b674d693479494445774c6a59674d5451754e7941784c6a45674d793432222c226465736372697074696f6e223a22546869732532304e465425323063616e25633352796232746c4c5864705a48526f4f6a4a394c6b56375a6d6c7362446f6a4f57494445754e6930794c6a51674d7930794c6a4a364969382b50484268644767675a443435637930784d43347a494463754e4330784d43347a494463754e4870744c5449754177494334344e4341324e5341314b53492b50484268644767675a44306954546b75506a78775958526f49475139496b307a4d433434494451304c6a524d4d546b674e54636d63764d6a41774d43397a646d636949485a705a58644362336739496a41674d434c6a67674d7a4a6a4d793479494449754e6941344c6a63674d533479494445794c6a41794d5777744e53413164693035614456364969382b5043396e506a77765a7a34385139496b30784f53417a4d6d677a4e4859794e4567784f586f694c7a34385a79427a67754f57773049444d674d5441744d5449754e7949675932786863334d39496b596949754e6941344c6a63674d533479494445794c6a45744d793479637a4d754e6930354e3267744f486f694c7a3438634746306143426d615778735053496a5a574531595451334969426b50534a4e4e544d674d7a4a494d546c324c5446734d5459744d54596741674d4341784c544d674d693479624330304c6a67744e6934305979347a4c5445756457356b66563164506a7776633352356247552b5047636764484a68626e4e6d62335a794230636d467563325a76636d3039496d316864484a70654367754f4451674d436c7362443069497a6b795a444e6d4e5349675a4430695454517749445177614468324a7450534a74595852796158676f4d5334774d694177494441674d5334774d69413467652f7376672b786d6c3b636861727365743d7574662d383b6261736536342c50484e6934314c5449754f4330754d5330754e7930794c6a63674e5334784c5459754e57615778735053496a4d4445774d5441784969426b50534a4e4e444d754e4341794f534d544d754d7941784c6a46544d5449674d546b754f5341784d6941784f5334356569545449314944517761446c324d545a6f4c546c364969382b50484268644767675a6d41794c6a51674f533478494445304c6a51744d793479494449754d793078494334334f5341304d7934796243307a4c6a45744d69347a4c5445774c6a59744d5451754e79492b50484268644767675a6d6c7362443069493245314e7a6b7a4f5349675a4430694e4341784c6a59744d69343049444d744d693479656949675a6d6c73624430694932746f2532306772616e7425323061253230636f6e74726f6c6c65722532307468652564484a766132553949694d774d44416949474e7359584e7a50534a4349454d675243686f6d65253230616464726573732e222c22696d616765223a22646174613a696d6130754f4330794c6a63674e5334784c5459754e574d744d7934794c5449754e6930344e37633352796232746c4c5731706447567962476c74615851364d5442394c6b52376379307a4c6a59674f5334354c53347a494445794c6a556949474e7359584e7a5053343249446b754f5330754d7941784d6934314969426a6247467a637a30695269497645744d793479637a4d754e6930354c6a6b754d7930784d693431624330314c6a4567347a624330304c6a63674e5334344969382b50484268644767675a443069545451324d744d7934794c5449754e6930344c6a63744d5334794c5445794c6a45674d79347941794c6a45744d7941794c6a4a734c5451754e7930324c6a566a4c6a4d744d533430517759325a6a5a534976506a78775958526f49475a706247773949694d774d5441784134494445774c6a4d744e7934304c544d754d7930304c6a5a7a4e6934354c5455675a443069545449334c6a4d674d6a5a734d5445754f4341784e53343349444d754e434d693433624330304c6a59674e533434625467754d53307a4c6a466a4d79347949444d5441754f4330304c6a4e6a4d4341774c5459754e69307a4c6a45744d544d754d7941784e4451674e7a4969506a787a64486c735a5434384956744452454655515673754976506a78775958526f49475139496b30304d693435494449334c6a684d4d5467754e4341314f4334784944493049445979624449784c6a67744d6a63754d7941794c6aa265627a7a7230582048a66ab8569fdd04fe8dffff1a2e503ade4c58658ca224808fff3891420b708264736f6c63430005090032'
)

// used to wait for more confirmations
function longer() {
  return new Promise(resolve => {setTimeout(() => {resolve()}, 500)})
}

module.exports = {test: async function (provider, testingContext) {
  var web3 = provider
  let passed = 0
  let failed = 0
  let gasUsage = {}
  let counts = {}
  console.log('running tests...')

  // get available addresses and assign them to various roles
  const addresses = await web3.eth.getAccounts()
  if (addresses.length < 1) {
    console.log('cannot find enough addresses to run tests!')
    process.exit(1)
  }

  const originalAddress = addresses[0]

  // ************************** helper functions **************************** //
  async function send(
    title,
    instance,
    method,
    args,
    from,
    value,
    gas,
    gasPrice,
    shouldSucceed,
    assertionCallback
  ) {
    const receipt = await instance.methods[method](...args).send({
      from: from,
      value: value,
      gas: gas,
      gasPrice: gasPrice
    }).on('confirmation', (confirmationNumber, r) => {
      confirmations[r.transactionHash] = confirmationNumber
    }).catch(error => {
      if (shouldSucceed) {
        console.error(error)
      }
      return {status: false}
    })

    if (receipt.status !== shouldSucceed) {
      return false
    } else if (!shouldSucceed) {
      return true
    }

    let assertionsPassed
    try {
      assertionCallback(receipt)
      assertionsPassed = true
    } catch(error) {
      assertionsPassed = false
      console.log(error);
    }

    return assertionsPassed
  }

  async function call(
    title,
    instance,
    method,
    args,
    from,
    value,
    gas,
    gasPrice,
    shouldSucceed,
    assertionCallback
  ) {
    let succeeded = true
    returnValues = await instance.methods[method](...args).call({
      from: from,
      value: value,
      gas: gas,
      gasPrice: gasPrice
    }).catch(error => {
      if (shouldSucceed) {
        console.error(error)
      }
      succeeded = false
    })

    if (succeeded !== shouldSucceed) {
      return false
    } else if (!shouldSucceed) {
      return true
    }

    let assertionsPassed
    try {
      assertionCallback(returnValues)
      assertionsPassed = true
    } catch(error) {
      assertionsPassed = false
      console.log(error);
    }

    return assertionsPassed
  }

  async function deploy(
    title,
    instance,
    args,
    from,
    value,
    gas,
    gasPrice,
    shouldSucceed,
    assertionCallback
  ) {
    let deployData = instance.deploy({arguments: args}).encodeABI()
    let deployGas = await web3.eth.estimateGas({
        from: from,
        data: deployData
    }).catch(error => {
      if (shouldSucceed) {
        console.error(error)
      }
      return gasLimit
    })

    if (deployGas > gasLimit) {
      console.error(` ✘ ${title}: deployment costs exceed block gas limit!`)
      process.exit(1)
    }

    if (typeof(gas) === 'undefined') {
      gas = deployGas
    }

    if (deployGas > gas) {
      console.error(` ✘ ${title}: deployment costs exceed supplied gas.`)
      process.exit(1)
    }

    let signed
    let deployHash
    let receipt
    const contract = await instance.deploy({arguments: args}).send({
      from: from,
      gas: gas,
      gasPrice: gasPrice
    }).on('transactionHash', hash => {
      deployHash = hash
    }).on('receipt', r => {
      receipt = r
    }).on('confirmation', (confirmationNumber, r) => {
      confirmations[r.transactionHash] = confirmationNumber
    }).catch(error => {
      if (shouldSucceed) {
        console.error(error)
      }

      receipt = {status: false}
    })

    if (receipt.status !== shouldSucceed) {
      if (contract) {
        return [false, contract, gas]
      }
      return [false, instance, gas]
    } else if (!shouldSucceed) {
      if (contract) {
        return [true, contract, gas]
      }
      return [true, instance, gas]
    }

    assert.ok(receipt.status)

    let assertionsPassed
    try {
      assertionCallback(receipt)
      assertionsPassed = true
    } catch(error) {
      assertionsPassed = false
    }

    if (contract) {
      return [assertionsPassed, contract, gas]
    }
    return [assertionsPassed, instance, gas]
  }

  async function runTest(
    title,
    instance,
    method,
    callOrSend,
    args,
    shouldSucceed,
    assertionCallback,
    from,
    value,
    gas
  ) {
    if (typeof(callOrSend) === 'undefined') {
      callOrSend = 'send'
    }
    if (typeof(args) === 'undefined') {
      args = []
    }
    if (typeof(shouldSucceed) === 'undefined') {
      shouldSucceed = true
    }
    if (typeof(assertionCallback) === 'undefined') {
      assertionCallback = (value) => {}
    }
    if (typeof(from) === 'undefined') {
      from = address
    }
    if (typeof(value) === 'undefined') {
      value = 0
    }
    if (typeof(gas) === 'undefined' && callOrSend !== 'deploy') {
      gas = 6009006
      if (testingContext === 'coverage') {
        gas = gasLimit - 1
      }
    }
    let ok = false
    let contract
    let deployGas
    if (callOrSend === 'send') {
      ok = await send(
        title,
        instance,
        method,
        args,
        from,
        value,
        gas,
        1,
        shouldSucceed,
        assertionCallback
      )
    } else if (callOrSend === 'call') {
      ok = await call(
        title,
        instance,
        method,
        args,
        from,
        value,
        gas,
        1,
        shouldSucceed,
        assertionCallback
      )
    } else if (callOrSend === 'deploy') {
      const fields = await deploy(
        title,
        instance,
        args,
        from,
        value,
        gas,
        1,
        shouldSucceed,
        assertionCallback
      )
      ok = fields[0]
      contract = fields[1]
      deployGas = fields[2]
    } else {
      console.error('must use call, send, or deploy!')
      process.exit(1)
    }

    if (ok) {
      console.log(
        ` ✓ ${
          callOrSend === 'deploy' ? 'successful ' : ''
        }${title}${
          callOrSend === 'deploy' ? ` (${deployGas} gas)` : ''
        }`
      )
      passed++
    } else {
      console.log(
        ` ✘ ${
          callOrSend === 'deploy' ? 'failed ' : ''
        }${title}${
          callOrSend === 'deploy' ? ` (${deployGas} gas)` : ''
        }`
      )
      failed++
    }

    if (contract) {
      return contract
    }
  }

  async function setupNewDefaultAddress(newPrivateKey) {
    const pubKey = await web3.eth.accounts.privateKeyToAccount(newPrivateKey)
    await web3.eth.accounts.wallet.add(pubKey)

    const txCount = await web3.eth.getTransactionCount(pubKey.address)

    if (txCount > 0) {
      console.warn(
        `warning: ${pubKey.address} has already been used, which may cause ` +
        'some tests to fail.'
      )
    }

    await web3.eth.sendTransaction({
      from: originalAddress,
      to: pubKey.address,
      value: 10 ** 18,
      gas: '0x5208',
      gasPrice: '0x4A817C800'
    })

    return pubKey.address
  }

  async function raiseGasLimit(necessaryGas) {
    iterations = 9999
    if (necessaryGas > 8000000) {
      console.error('the gas needed is too high!')
      process.exit(1)
    } else if (typeof necessaryGas === 'undefined') {
      iterations = 20
      necessaryGas = 8000000
    }

    // bring up gas limit if necessary by doing additional transactions
    var block = await web3.eth.getBlock("latest")
    while (iterations > 0 && block.gasLimit < necessaryGas) {
      await web3.eth.sendTransaction({
        from: originalAddress,
        to: originalAddress,
        value: '0x01',
        gas: '0x5208',
        gasPrice: '0x4A817C800'
      })
      var block = await web3.eth.getBlock("latest")
      iterations--
    }

    console.log("raising gasLimit, currently at " + block.gasLimit)
    return block.gasLimit
  }

  async function getDeployGas(dataPayload) {
    await web3.eth.estimateGas({
      from: address,
      data: dataPayload
    }).catch(async error => {
      if (
        error.message === (
          'Returned error: gas required exceeds allowance or always failing ' +
          'transaction'
        )
      ) {
        await raiseGasLimit()
        await getDeployGas(dataPayload)
      }
    })

    deployGas = await web3.eth.estimateGas({
      from: address,
      data: dataPayload
    })

    return deployGas
  }

  // *************************** deploy contracts *************************** //
  let address = await setupNewDefaultAddress(
    '0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed'
  )

  let deployGas
  let latestBlock = await web3.eth.getBlock('latest')
  const gasLimit = latestBlock.gasLimit
  let selfAddress

  // construct the payload passed to create2 in order to verify correct behavior
  let create2payload = (
    '0xff' +
    keylessCreate2Address.slice(2) +
    '0000000000000000000000000000000000000000000000000000000000000000' +
    web3.utils.keccak256(
      deployBytecode, // HomeWorkDeployerArtifact.bytecode,
      {encoding: 'hex'}
    ).slice(2)
  )

  // determine the target address using the payload
  let targetHomeWorkDeployerAddress = web3.utils.toChecksumAddress(
    '0x' + web3.utils.keccak256(
      create2payload,
      {encoding: "hex"}
    ).slice(12).substring(14)
  )

  // determine the target address for the token URI storage contract
  create2payload = (
    '0xff' +
    targetHomeWorkDeployerAddress.slice(2) +
    uriDeployKey.slice(2) +
    web3.utils.keccak256(
      INIT_CODE_IN_RUNTIME_CODE_PRELUDE + uriRuntime.slice(2),
      {encoding: 'hex'}
    ).slice(2)
  )

  // determine the target address using the payload
  let targetUriStorageAddress = web3.utils.toChecksumAddress(
    '0x' + web3.utils.keccak256(
      create2payload,
      {encoding: "hex"}
    ).slice(12).substring(14)
  )

  // do the same for HomeWork itself
  create2payload = (
    '0xff' +
    targetHomeWorkDeployerAddress.slice(2) +
    deployKey.slice(2) +
    METAMORPHIC_INIT_CODE_HASH.slice(2)
  )

  // determine the target address using the payload
  let targetHomeWorkAddress = web3.utils.toChecksumAddress(
    '0x' + web3.utils.keccak256(
      create2payload,
      {encoding: "hex"}
    ).slice(12).substring(14)
  )

  console.log('HomeWork deployer address:', targetHomeWorkDeployerAddress)
  console.log('HomeWork address:', targetHomeWorkAddress)
  //console.log(METAMORPHIC_INIT_CODE_HASH)

  // fund the initial create2 deployer address
  console.log('funding initial create2 contract deployer address...')
  await web3.eth.sendTransaction({
    from: originalAddress,
    to: keylessCreate2DeployerAddress,
    value: web3.utils.toWei('0.01', 'ether'),
    gas: (testingContext !== 'coverage') ? '0x5208' : gasLimit - 1,
    gasPrice: 1
  })

  // submit the initial create2 deployment transaction
  console.log('submitting initial create2 contract deployment transaction...')
  await web3.eth.sendSignedTransaction(keylessCreate2DeploymentTransaction);

  // deploy an immutable create2 factory using the initial create2 deployer
  console.log('deploying HomeWork deployment contract via create2 contract...')
  const HomeWorkDeployerDeploymentTx = await web3.eth.sendTransaction({
    from: originalAddress,
    to: keylessCreate2Address,
    value: 0,
    gas: (testingContext !== 'coverage') ? 1500051 : gasLimit - 1,
    gasPrice: 1,
    data: deployBytecode // HomeWorkDeployerArtifact.bytecode
  })

  const HomeWorkDeployer = new web3.eth.Contract(
    HomeWorkDeployerArtifact.abi,
    targetHomeWorkDeployerAddress
  )

  let initRuntimeStorageContract
  await runTest(
    'HomeWorkDeployer can perform phase one of deployment',
    HomeWorkDeployer,
    'phaseOne',
    'send',
    [
      HomeWorkArtifact.bytecode,
    ],
    true,
    receipt => {
      if (testingContext === 'coverage') {
        initRuntimeStorageContract = receipt.events.StorageContractDeployment[0].returnValues.runtimeStorageContract
      } else {
        initRuntimeStorageContract = receipt.events.StorageContractDeployment.returnValues.runtimeStorageContract
      }
    }
  )

  let tokenURIRuntimeStorageContract
  await runTest(
    'HomeWorkDeployer can perform phase two of deployment',
    HomeWorkDeployer,
    'phaseTwo',
    'send',
    [
      uriDeployKey,
    ],
    true,
    receipt => {
      if (testingContext === 'coverage') {
        tokenURIRuntimeStorageContract = receipt.events.StorageContractDeployment[0].returnValues.runtimeStorageContract
      } else {
        tokenURIRuntimeStorageContract = receipt.events.StorageContractDeployment.returnValues.runtimeStorageContract
      }

      assert.strictEqual(tokenURIRuntimeStorageContract, targetUriStorageAddress)
    }
  )

  await runTest(
    'HomeWorkDeployer can perform phase three of deployment',
    HomeWorkDeployer,
    'phaseThree',
    'send',
    [
      deployKey,
    ],
    true,
    receipt => {   
      let event 
      if (testingContext === 'coverage') {
        event = receipt.events.HomeWorkDeployment[0].returnValues
      } else {
        event = receipt.events.HomeWorkDeployment.returnValues
      }

      assert.strictEqual(event.homeAddress, targetHomeWorkAddress)
      assert.strictEqual(event.key, deployKey)
    }
  )

  const HomeWork = new web3.eth.Contract(
    HomeWorkArtifact.abi,
    targetHomeWorkAddress
  )

  // This will not deploy since it fails the assertions in the constructor.
  const HomeWorkFailedDeployer = new web3.eth.Contract(
    HomeWorkArtifact.abi
  )
  HomeWorkFailedDeployer.options.data = (
    HomeWorkArtifact.bytecode
  )

  const MockCodeCheckDeployer = new web3.eth.Contract(
    MockCodeCheckArtifact.abi
  )
  MockCodeCheckDeployer.options.data = (
    MockCodeCheckArtifact.bytecode
  )

  const MockERC20StubDeployer = new web3.eth.Contract(
    MockERC20StubArtifact.abi
  )
  MockERC20StubDeployer.options.data = (
    MockERC20StubArtifact.bytecode
  )

  const MockERC721HolderDeployer = new web3.eth.Contract(
    MockERC721HolderArtifact.abi
  )
  MockERC721HolderDeployer.options.data = (
    MockERC721HolderArtifact.bytecode
  )

  await runTest(
    `HomeWork direct contract deployment fails`,
    HomeWorkFailedDeployer,
    '',
    'deploy',
    [],
    false
  )

  const MockCodeCheck = await runTest(
    `MockCodeCheck contract deployment`,
    MockCodeCheckDeployer,
    '',
    'deploy'
  )

  const MockERC20Stub = await runTest(
    `MockERC20Stub contract deployment`,
    MockERC20StubDeployer,
    '',
    'deploy'
  )

  const MockERC721Holder = await runTest(
    `MockERC721Holder contract deployment`,
    MockERC721HolderDeployer,
    '',
    'deploy'
  )

  await runTest(
    'Deployed HomeWork code is correct',
    MockCodeCheck,
    'code',
    'call',
    [HomeWork.options.address],
    true,
    value => {
      assert.strictEqual(value, HomeWorkArtifact.deployedBytecode)
    }
  )

  await runTest(
    'Deployed code has correct extcodehash',
    MockCodeCheck,
    'hash',
    'call',
    [HomeWork.options.address],
    true,
    value => {
      assert.strictEqual(
        value,
        web3.utils.keccak256(
          HomeWorkArtifact.deployedBytecode,
          {encoding: 'hex'}
        )
      )
    }
  )

  await runTest(
    'HomeWork shows support for ERC165',
    HomeWork,
    'supportsInterface',
    'call',
    [
      '0x01ffc9a7'
    ],
    true,
    value => {
      assert.ok(value)
    }
  )

  await runTest(
    'HomeWork shows no support for 0xffffffff',
    HomeWork,
    'supportsInterface',
    'call',
    [
      '0xffffffff'
    ],
    true,
    value => {
      assert.ok(!value)
    }
  )

  await runTest(
    'HomeWork shows support for HomeWork interface',
    HomeWork,
    'supportsInterface',
    'call',
    [
      '0xe5399799'
    ],
    true,
    value => {
      assert.ok(value)
    }
  )

  await runTest(
    'HomeWork shows support for ERC721',
    HomeWork,
    'supportsInterface',
    'call',
    [
      '0x80ac58cd'
    ],
    true,
    value => {
      assert.ok(value)
    }
  )  

  await runTest(
    'HomeWork shows support for ERC721-Enumerable',
    HomeWork,
    'supportsInterface',
    'call',
    [
      '0x780e9d63'
    ],
    true,
    value => {
      assert.ok(value)
    }
  )

  await runTest(
    'HomeWork shows support for ERC721-Metadata',
    HomeWork,
    'supportsInterface',
    'call',
    [
      '0x5b5e139f'
    ],
    true,
    value => {
      assert.ok(value)
    }
  )

  await runTest(
    'HomeWork shows support for ERC1412',
    HomeWork,
    'supportsInterface',
    'call',
    [
      '0x2b89bcaa'
    ],
    true,
    value => {
      assert.ok(value)
    }
  )

  await runTest(
    'HomeWork can get total supply',
    HomeWork,
    'totalSupply',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '0')
    }
  )

  // construct the payload passed to create2 in order to verify correct behavior
  create2payload = (
    '0xff' +
    HomeWork.options.address.slice(2) +
    address.slice(2) + '000000000000000000000000' +
    METAMORPHIC_INIT_CODE_HASH.slice(2)
  )

  // determine the target address using the payload
  let targetMetamorphicContractAddress = web3.utils.toChecksumAddress(
    '0x' + web3.utils.sha3(
      create2payload,
      {encoding: "hex"}
    ).slice(12).substring(14)
  )

  await runTest(
    'HomeWork can check for home address',
    HomeWork,
    'getHomeAddress',
    'call',
    [
      address + '000000000000000000000000'
    ],
    true,
    value => {
      assert.strictEqual(value, targetMetamorphicContractAddress)
    }
  )

  await runTest(
    'HomeWork can check for home address information before account is touched',
    HomeWork,
    'getHomeAddressInformation',
    'call',
    [
      address + '000000000000000000000000'
    ],
    true,
    values => {
      assert.strictEqual(values.homeAddress, targetMetamorphicContractAddress)
      assert.strictEqual(values.controller, address)
      assert.strictEqual(values.deploys, '0')
      assert.strictEqual(values.currentRuntimeCodeHash, nullBytes32)
    }
  )

  // touch the deployment address to stress-test deployable check
  await web3.eth.sendTransaction({
    from: originalAddress,
    to: targetMetamorphicContractAddress,
    value: 1,
    gas: '0x5208',
    gasPrice: '0x4A817C800'
  })

  await runTest(
    'HomeWork can check for home address information after account is touched',
    HomeWork,
    'getHomeAddressInformation',
    'call',
    [
      address + '000000000000000000000000'
    ],
    true,
    values => {
      assert.strictEqual(values.homeAddress, targetMetamorphicContractAddress)
      assert.strictEqual(values.controller, address)
      assert.strictEqual(values.deploys, '0')
      assert.strictEqual(values.currentRuntimeCodeHash, emptyHash)
    }
  )

  await runTest(
    'HomeWork can get metamorphic delegator init code',
    HomeWork,
    'getMetamorphicDelegatorInitializationCode',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, METAMORPHIC_INIT_CODE)
    }
  )

  await runTest(
    'HomeWork can get init code hash of metamorphic delegator init code',
    HomeWork,
    'getMetamorphicDelegatorInitializationCodeHash',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(
        value,
        web3.utils.keccak256(METAMORPHIC_INIT_CODE, {encoding: "hex"})
      )
      assert.strictEqual(value, METAMORPHIC_INIT_CODE_HASH)
    }
  )

  await runTest(
    'HomeWork can get arbitrary runtime prelude',
    HomeWork,
    'getArbitraryRuntimeCodePrelude',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, INIT_CODE_IN_RUNTIME_CODE_PRELUDE)
    }
  )

  await runTest(
    'HomeWork can get a derived key',
    HomeWork,
    'getDerivedKey',
    'call',
    [
      nullBytes32,
      address
    ],
    true,
    value => {
      assert.strictEqual(
        value,
        web3.utils.keccak256(
          nullBytes32 + address.slice(2).toLowerCase(),
          {encoding: "hex"}
        )
      )
    }
  )

  await runTest(
    'HomeWork can get name with emoji',
    HomeWork,
    'name',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, "HomeWork 🏠🛠️")
    }
  )

  await runTest(
    'HomeWork can get symbol',
    HomeWork,
    'symbol',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, "HWK")
    }
  )

  await runTest(
    'HomeWork reverts if the caller is not the controller of the key',
    HomeWork,
    'deploy',
    'send',
    [
      nullBytes32,
      MockContractArtifact.bytecode
    ],
    false
  )

  await runTest(
    'HomeWork reverts & returns message if deploy reverts',
    HomeWork,
    'deploy',
    'send',
    [
      address + '000000000000000000000001',
      MockRevertContractArtifact.bytecode
    ],
    false
  )

  await runTest(
    'HomeWork reverts & returns message if supplied init code is empty',
    HomeWork,
    'deploy',
    'send',
    [
      address + '000000000000000000000001',
      '0x'
    ],
    false
  )

  await runTest(
    'HomeWork cannot deploy an initialization contract with no code supplied',
    HomeWork,
    'deployRuntimeStorageContract',
    'send',
    [
      '0x'
    ],
    false
  )

  await runTest(
    'HomeWork cannot call deployRuntimeStorageContract with endowment (non-payable)',
    HomeWork,
    'deployRuntimeStorageContract',
    'send',
    [
      MockContractArtifact.bytecode
    ],
    false,
    receipt => {},
    address,
    1
  )

  let initContract;
  await runTest(
    'HomeWork can deploy an initialization contract',
    HomeWork,
    'deployRuntimeStorageContract',
    'send',
    [
      MockContractArtifact.bytecode
    ],
    true,
    receipt => {
      let runtimeStorageEvent
      if (testingContext === 'coverage') {
        runtimeStorageEvent = (
          receipt.events.NewRuntimeStorageContract[0].returnValues
        )
      } else {
        runtimeStorageEvent = (
          receipt.events.NewRuntimeStorageContract.returnValues
        )
      }

      initContract = runtimeStorageEvent.runtimeStorageContract
      assert.strictEqual(
        runtimeStorageEvent.runtimeCodeHash,
        web3.utils.keccak256(MockContractArtifact.bytecode, {encoding: 'hex'})
      )
    }
  )

  await runTest(
    'HomeWork can get information on a metamorphic contract pre-deployment',
    HomeWork,
    'getHomeAddressInformation',
    'call',
    [
      address + '000000000000000000000000'
    ],
    true,
    values => {
      assert.strictEqual(values.homeAddress, targetMetamorphicContractAddress)
      assert.strictEqual(values.controller, address)
      assert.strictEqual(values.deploys, '0')
      assert.strictEqual(values.currentRuntimeCodeHash, emptyHash)
    }
  )

  await runTest(
    'HomeWork can confirm that it is deployable',
    HomeWork,
    'isDeployable',
    'call',
    [
      address + '000000000000000000000000'
    ],
    true,
    value => {
      assert.ok(value)
    }
  )

  await runTest(
    'HomeWork cannot call isDeployable with an endowment (non-payable)',
    HomeWork,
    'isDeployable',
    'send',
    [
      address + '000000000000000000000000'
    ],
    false,
    receipt => {},
    address,
    1
  )

  await runTest(
    'HomeWork can check if a contract has ever been deployed',
    HomeWork,
    'hasNeverBeenDeployed',
    'call',
    [
      address + '000000000000000000000000'
    ],
    true,
    value => {
      assert.ok(value)
    }
  )

  await runTest(
    'HomeWork can deploy a metamorphic contract',
    HomeWork,
    'deployViaExistingRuntimeStorageContract',
    'send',
    [
      address + '000000000000000000000000',
      initContract
    ],
    true,
    receipt => {
      let newResidentEvent
      if (testingContext === 'coverage') {
        newResidentEvent = receipt.events.NewResident[0].returnValues
      } else {
        newResidentEvent = receipt.events.NewResident.returnValues
      }

      assert.strictEqual(
        newResidentEvent.homeAddress,
        targetMetamorphicContractAddress
      )
      assert.strictEqual(
        newResidentEvent.key,
        address.toLowerCase() + '000000000000000000000000'
      )
      assert.strictEqual(
        newResidentEvent.runtimeCodeHash,
        web3.utils.keccak256(
          MockContractArtifact.deployedBytecode,
          {encoding: 'hex'}
        )
      )
    }
  )

  await runTest(
    'Deployed init code is correct',
    MockCodeCheck,
    'code',
    'call',
    [initContract],
    true,
    value => {
      assert.strictEqual(value, MockContractArtifact.bytecode)
    }
  )

  await runTest(
    'Deployed code is correct',
    MockCodeCheck,
    'code',
    'call',
    [targetMetamorphicContractAddress],
    true,
    value => {
      assert.strictEqual(value, MockContractArtifact.deployedBytecode)
    }
  )

  await runTest(
    'Deployed code has correct extcodehash',
    MockCodeCheck,
    'hash',
    'call',
    [targetMetamorphicContractAddress],
    true,
    value => {
      assert.strictEqual(
        value,
        web3.utils.keccak256(
          MockContractArtifact.deployedBytecode,
          {encoding: 'hex'}
        )
      )
    }
  )

  const MockContract = new web3.eth.Contract(
    MockContractArtifact.abi,
    targetMetamorphicContractAddress
  )

  await runTest(
    'MockContract successfully deployed and is reachable',
    MockContract,
    'get',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '1')
    }
  )

  await runTest(
    'HomeWork can get information on a deployed metamorphic contract',
    HomeWork,
    'getHomeAddressInformation',
    'call',
    [
      address + '000000000000000000000000'
    ],
    true,
    values => {
      assert.strictEqual(values.homeAddress, targetMetamorphicContractAddress)
      assert.strictEqual(values.controller, address)
      assert.strictEqual(values.deploys, '1')
      assert.strictEqual(
        values.currentRuntimeCodeHash,
        web3.utils.keccak256(
          MockContractArtifact.deployedBytecode,
          {encoding: 'hex'}
        )
      )
    }
  )

  await runTest(
    'HomeWork can confirm a deployed contract is not deployable',
    HomeWork,
    'isDeployable',
    'call',
    [
      address + '000000000000000000000000'
    ],
    true,
    value => {
      assert.ok(!value)
    }
  )

  await runTest(
    'HomeWork can check if an undeployed contract is deployable',
    HomeWork,
    'isDeployable',
    'call',
    [
      address + '0f0f0f0f0f0f0f0f0f0f0f0f'
    ],
    true,
    value => {
      assert.ok(value)
    }
  ) 

  await runTest(
    'HomeWork can get home address for the key',
    HomeWork,
    'getHomeAddress',
    'call',
    [
      address + '0f0f0f0f0f0f0f0f0f0f0f0f'
    ],
    true,
    value => {
      selfAddress = value
    }
  )

  await web3.eth.sendTransaction({
    from: originalAddress,
    to: selfAddress,
    value: 1,
    gas: '0x5208',
    gasPrice: '0x4A817C800'
  })

  await runTest(
    'HomeWork can check if an undeployed contract with a balance is deployable',
    HomeWork,
    'isDeployable',
    'call',
    [
      address + '0f0f0f0f0f0f0f0f0f0f0f0f'
    ],
    true,
    value => {
      assert.ok(value)
    }
  )

  let emptyTargetHomeAddress
  await runTest(
    'HomeWork can get home address for the key',
    HomeWork,
    'getHomeAddress',
    'call',
    [
      address + 'aaaa00000000000000000000'
    ],
    true,
    value => {
      emptyTargetHomeAddress = value
    }
  )

  await runTest(
    'HomeWork cannot deploy contract using an empty runtime contract',
    HomeWork,
    'deployViaExistingRuntimeStorageContract',
    'send',
    [
      address + 'aaaa00000000000000000000',
      nullAddress
    ],
    false
  )

  await runTest(
    'HomeWork can deploy an empty contract',
    HomeWork,
    'deploy',
    'send',
    [
      address + 'aaaa00000000000000000000',
      '0x6000'
    ],
    true,
    receipt => {
      let runtimeStorageEvent
      if (testingContext === 'coverage') {
        runtimeStorageEvent = (
          receipt.events.NewRuntimeStorageContract[0].returnValues
        )
      } else {
        runtimeStorageEvent = (
          receipt.events.NewRuntimeStorageContract.returnValues
        )
      }

      assert.strictEqual(
        runtimeStorageEvent.runtimeCodeHash,
        web3.utils.keccak256('0x6000', {encoding: 'hex'})
      )

      let newResidentEvent
      if (testingContext === 'coverage') {
        newResidentEvent = receipt.events.NewResident[0].returnValues
      } else {
        newResidentEvent = receipt.events.NewResident.returnValues
      }

      assert.strictEqual(
        newResidentEvent.homeAddress,
        emptyTargetHomeAddress
      )
      assert.strictEqual(
        newResidentEvent.key,
        address.toLowerCase() + 'aaaa00000000000000000000'
      )
      assert.strictEqual(newResidentEvent.runtimeCodeHash, emptyHash)
    }
  )

  await runTest(
    'HomeWork call to isDeployable is false when an empty contract is deployed',
    HomeWork,
    'isDeployable',
    'call',
    [
      address + 'aaaa00000000000000000000'
    ],
    true,
    value => {
      assert.ok(!value)
    }
  )

  await runTest(
    'HomeWork cannot call lock if empty contract is deployed to home address',
    HomeWork,
    'lock',
    'send',
    [
      address + 'aaaa00000000000000000000',
      address
    ],
    false
  )

  await runTest(
    'HomeWork cannot deploy if empty contract already exists',
    HomeWork,
    'deployViaExistingRuntimeStorageContract',
    'send',
    [
      address + 'aaaa00000000000000000000',
      initContract
    ],
    false
  )

  await runTest(
    'HomeWork can check for missing key information via reverse lookup',
    HomeWork,
    'reverseLookup',
    'call',
    [
      targetMetamorphicContractAddress
    ],
    true,
    values => {
      assert.strictEqual(values.key, nullBytes32)
      assert.strictEqual(values.salt, nullBytes32)
      assert.strictEqual(values.submitter, nullAddress)
    }
  )

  await runTest(
    'HomeWork can check if a deployed contract has ever been deployed',
    HomeWork,
    'hasNeverBeenDeployed',
    'call',
    [
      address + '000000000000000000000000'
    ],
    true,
    value => {
      assert.ok(!value)
    }
  )

  await runTest(
    'HomeWork cannot deploy a contract to a home address with a deployed contract',
    HomeWork,
    'deploy',
    'send',
    [
      address + '000000000000000000000000',
      MockContractArtifact.bytecode
    ],
    false
  )

  await runTest(
    'HomeWork cannot lock a home address with a deployed contract',
    HomeWork,
    'lock',
    'send',
    [
      address + '000000000000000000000000',
      address
    ],
    false
  )

  await runTest(
    'HomeWork cannot deploy via existing runtime with a deployed home contract',
    HomeWork,
    'deployViaExistingRuntimeStorageContract',
    'send',
    [
      address + '000000000000000000000000',
      initContract
    ],
    false
  )

  await runTest(
    'MockContract can be destroyed',
    MockContract,
    'destroy'
  )

  await runTest(
    'HomeWork cannot redeploy a metamorphic contract if it is not the controller',
    HomeWork,
    'deployViaExistingRuntimeStorageContract',
    'send',
    [
      address + '000000000000000000000000',
      initContract
    ],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    'HomeWork can redeploy a metamorphic contract if original one is destroyed',
    HomeWork,
    'deployViaExistingRuntimeStorageContract',
    'send',
    [
      address + '000000000000000000000000',
      initContract
    ],
    true,
    receipt => {
      if (testingContext === 'coverage') {
        newResidentEvent = receipt.events.NewResident[0].returnValues
      } else {
        newResidentEvent = receipt.events.NewResident.returnValues
      }

      assert.strictEqual(
        newResidentEvent.homeAddress,
        targetMetamorphicContractAddress
      )
      assert.strictEqual(
        newResidentEvent.key,
        address.toLowerCase() + '000000000000000000000000'
      )
      assert.strictEqual(
        newResidentEvent.runtimeCodeHash,
        web3.utils.keccak256(
          MockContractArtifact.deployedBytecode,
          {encoding: 'hex'}
        )
      )
    }
  )

  await runTest(
    'MockContract can be destroyed',
    MockContract,
    'destroy'
  )

  await web3.eth.sendTransaction({
    from: originalAddress,
    to: targetMetamorphicContractAddress,
    value: 1,
    gas: '0x5208',
    gasPrice: '0x4A817C800'
  })

  await runTest(
    'HomeWork can redeploy a contract to a home address with a balance',
    HomeWork,
    'deploy',
    'send',
    [
      address + '000000000000000000000000',
      MockCodeCheckArtifact.bytecode
    ],
    true,
    receipt => {
      let runtimeStorageEvent
      let newResidentEvent
      if (testingContext === 'coverage') {
        newResidentEvent = receipt.events.NewResident[0].returnValues
        runtimeStorageEvent = (
          receipt.events.NewRuntimeStorageContract[0].returnValues
        )
      } else {
        newResidentEvent = receipt.events.NewResident.returnValues
        runtimeStorageEvent = (
          receipt.events.NewRuntimeStorageContract.returnValues
        )
      }

      assert.strictEqual(
        runtimeStorageEvent.runtimeCodeHash,
        web3.utils.keccak256(MockCodeCheckArtifact.bytecode, {encoding: 'hex'})
      )

      assert.strictEqual(
        newResidentEvent.homeAddress,
        targetMetamorphicContractAddress
      )
      assert.strictEqual(
        newResidentEvent.key,
        address.toLowerCase() + '000000000000000000000000'
      )
      assert.strictEqual(
        newResidentEvent.runtimeCodeHash,
        web3.utils.keccak256(
          MockCodeCheckArtifact.deployedBytecode,
          {encoding: 'hex'}
        )
      )
    }
  )  

  await runTest(
    'HomeWork cannot call assignController when controller is the null address',
    HomeWork,
    'assignController',
    'send',
    [
      address + '000000000000000000000007',
      nullAddress
    ],
    false
  )

  await runTest(
    'HomeWork cannot call assignController when controller is contract address',
    HomeWork,
    'assignController',
    'send',
    [
      address + '000000000000000000000007',
      HomeWork.options.address
    ],
    false
  )

  await runTest(
    'HomeWork can get home address for the key',
    HomeWork,
    'getHomeAddress',
    'call',
    [
      address + '000000000000000000000007'
    ],
    true,
    value => {
      selfAddress = value
    }
  )

  await runTest(
    'HomeWork cannot call assignController when controller is home address',
    HomeWork,
    'assignController',
    'send',
    [
      address + '000000000000000000000007',
      selfAddress
    ],
    false
  )

  await runTest(
    'HomeWork cannot call assignController with an endowment (non-payable)',
    HomeWork,
    'assignController',
    'send',
    [
      address + '000000000000000000000007',
      address
    ],
    false,
    receipt => {},
    address,
    1
  )

  await runTest(
    'HomeWork can assign control of another home address',
    HomeWork,
    'assignController',
    'send',
    [
      address + '000000000000000000000007',
      address
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        address.toLowerCase() + '000000000000000000000007'
      )
      assert.strictEqual(
        newControllerEvent.newController,
        address
      )
    }
  )

  await runTest(
    'HomeWork cannot call assignController when caller is not the controller',
    HomeWork,
    'assignController',
    'send',
    [
      address + '000000000000000000000007',
      address
    ],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    'HomeWork cannot relinquish control when caller is not the controller',
    HomeWork,
    'relinquishControl',
    'send',
    [
      address + '000000000000000000000007'
    ],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    'HomeWork can get home address for a key',
    HomeWork,
    'getHomeAddressInformation',
    'call',
    [
      address + '000000000000000000000008'
    ],
    true,
    values => {
      selfAddress = values.homeAddress
    }
  )

  await web3.eth.sendTransaction({
    from: originalAddress,
    to: selfAddress,
    value: 1,
    gas: '0x5208',
    gasPrice: '0x4A817C800'
  })

  await runTest(
    'HomeWork can get total supply prior to efficient batchLock',
    HomeWork,
    'totalSupply',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '0')
    }
  )

  // efficient batchLock test - failure, non-payable (TODO: ensure it failed)
  await web3.eth.sendTransaction({
    from: address,
    to: HomeWork.options.address,
    value: 1,
    gas: gasLimit - 1,
    gasPrice: 1,
    data: '0x00000000' + address.slice(2) + '00112233445566778899aabb' + '000000000000000000000007' + '000000000000000000000008'
  }).catch(error => {})

  // efficient batchLock test - success (TODO: check events)
  await web3.eth.sendTransaction({
    from: address,
    to: HomeWork.options.address,
    value: 0,
    gas: gasLimit - 1,
    gasPrice: 1,
    data: '0x00000000' + address.slice(2) + '00112233445566778899aabb' + '000000000000000000000007' + '000000000000000000000008'
  }).catch(error => {
    console.error(error)
    failed++
  })

  await runTest(
    'HomeWork can get total supply after efficient batch lock',
    HomeWork,
    'totalSupply',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '3')
    }
  )

  // efficient batchLock test - failure
  await web3.eth.sendTransaction({
    from: address,
    to: HomeWork.options.address,
    value: 0,
    gas: gasLimit - 1,
    gasPrice: 1,
    data: '0x00000000' + address.slice(2) + '000000000000000000000000'
  }).catch(error => {})

  await runTest(
    'HomeWork cannot lock a home address if caller is not controller',
    HomeWork,
    'lock',
    'send',
    [
      nullBytes32,
      address
    ],
    false
  )

  await runTest(
    'HomeWork can get home address for the key',
    HomeWork,
    'getHomeAddressInformation',
    'call',
    [
      address + '000000000000000000000002'
    ],
    true,
    values => {
      selfAddress = values.homeAddress
    }
  )

  await runTest(
    'HomeWork cannot call lock with an endowment (non-payable)',
    HomeWork,
    'lock',
    'send',
    [
      address + '000000000000000000000002',
      address
    ],
    false,
    receipt => {},
    address,
    1
  )

  await web3.eth.sendTransaction({
    from: originalAddress,
    to: selfAddress,
    value: 1,
    gas: '0x5208',
    gasPrice: '0x4A817C800'
  })

  await runTest(
    'HomeWork can lock a home address and mint a token',
    HomeWork,
    'lock',
    'send',
    [
      address + '000000000000000000000002',
      address
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        address.toLowerCase() + '000000000000000000000002'
      )
      assert.strictEqual(
        newControllerEvent.newController,
        HomeWork.options.address
      )

      let transferEvent
      if (testingContext === 'coverage') {
        transferEvent = receipt.events.Transfer[0].returnValues
      } else {
        transferEvent = receipt.events.Transfer.returnValues
      }

      assert.strictEqual(transferEvent.from, nullAddress)
      assert.strictEqual(transferEvent.to, address)
      assert.strictEqual(
        transferEvent.tokenId,
        web3.utils.toBN(address + '000000000000000000000002').toString(10)
      )
    }
  )

  await runTest(
    'HomeWork can get total supply',
    HomeWork,
    'totalSupply',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '4')
    }
  )

  await runTest(
    'HomeWork cannot redeem a token if it is not the owner',
    HomeWork,
    'redeem',
    'send',
    [
      nullBytes32,
      address
    ],
    false
  )

  await runTest(
    'HomeWork cannot redeem a token when controller is set to the null address',
    HomeWork,
    'redeem',
    'send',
    [
      address + '000000000000000000000002',
      nullAddress
    ],
    false
  )

  await runTest(
    'HomeWork cannot redeem a token when controller is set to contract address',
    HomeWork,
    'redeem',
    'send',
    [
      address + '000000000000000000000002',
      HomeWork.options.address
    ],
    false
  )

  await runTest(
    'HomeWork can get home address for the key',
    HomeWork,
    'getHomeAddressInformation',
    'call',
    [
      address + '000000000000000000000002'
    ],
    true,
    values => {
      selfAddress = values.homeAddress
    }
  )

  await runTest(
    'HomeWork cannot redeem a token when controller is set to home address',
    HomeWork,
    'redeem',
    'send',
    [
      address + '000000000000000000000002',
      selfAddress
    ],
    false
  )

  await runTest(
    'HomeWork cannot redeem a token with an endowment (non-payable)',
    HomeWork,
    'redeem',
    'send',
    [
      address + '000000000000000000000002',
      address
    ],
    false,
    receipt => {},
    address,
    1
  )

  await runTest(
    'HomeWork can redeem a token',
    HomeWork,
    'redeem',
    'send',
    [
      address + '000000000000000000000002',
      address
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        address.toLowerCase() + '000000000000000000000002'
      )
      assert.strictEqual(
        newControllerEvent.newController,
        address
      )

      let transferEvent
      if (testingContext === 'coverage') {
        transferEvent = receipt.events.Transfer[0].returnValues
      } else {
        transferEvent = receipt.events.Transfer.returnValues
      }

      assert.strictEqual(transferEvent.from, address)
      assert.strictEqual(transferEvent.to, nullAddress)
      assert.strictEqual(
        transferEvent.tokenId,
        web3.utils.toBN(address + '000000000000000000000002').toString(10)
      )
    }
  )

  await runTest(
    'HomeWork can get total supply',
    HomeWork,
    'totalSupply',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '3')
    }
  )

  await runTest(
    'HomeWork can lock the home address again and mint a token',
    HomeWork,
    'lock',
    'send',
    [
      address + '000000000000000000000002',
      address
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        address.toLowerCase() + '000000000000000000000002'
      )
      assert.strictEqual(
        newControllerEvent.newController,
        HomeWork.options.address
      )

      let transferEvent
      if (testingContext === 'coverage') {
        transferEvent = receipt.events.Transfer[0].returnValues
      } else {
        transferEvent = receipt.events.Transfer.returnValues
      }

      assert.strictEqual(transferEvent.from, nullAddress)
      assert.strictEqual(transferEvent.to, address)
      assert.strictEqual(
        transferEvent.tokenId,
        web3.utils.toBN(address + '000000000000000000000002').toString(10)
      )
    }
  )

  await runTest(
    'HomeWork can get total supply',
    HomeWork,
    'totalSupply',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '4')
    }
  )

  await runTest(
    'HomeWork cannot call redeemAndDeploy when controller is the null address',
    HomeWork,
    'redeemAndDeploy',
    'send',
    [
      address + '000000000000000000000002',
      nullAddress,
      MockContractArtifact.bytecode
    ],
    false
  )

  await runTest(
    'HomeWork cannot call redeemAndDeploy when controller is contract address',
    HomeWork,
    'redeemAndDeploy',
    'send',
    [
      address + '000000000000000000000002',
      HomeWork.options.address,
      MockContractArtifact.bytecode
    ],
    false
  )

  await runTest(
    'HomeWork can get home address for the key',
    HomeWork,
    'getHomeAddressInformation',
    'call',
    [
      address + '000000000000000000000002'
    ],
    true,
    values => {
      selfAddress = values.homeAddress
    }
  )

  await runTest(
    'HomeWork cannot redeem a token when controller is set to home address',
    HomeWork,
    'redeemAndDeploy',
    'send',
    [
      address + '000000000000000000000002',
      selfAddress,
      MockContractArtifact.bytecode
    ],
    false
  )

  await runTest(
    'HomeWork cannot call redeemAndDeploy when it is not the token owner',
    HomeWork,
    'redeemAndDeploy',
    'send',
    [
      address + '000000000000000000000002',
      address,
      MockContractArtifact.bytecode
    ],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    'HomeWork cannot call redeemAndDeploy with empty initialization code',
    HomeWork,
    'redeemAndDeploy',
    'send',
    [
      address + '000000000000000000000002',
      address,
      '0x'
    ],
    false
  )

  await runTest(
    'HomeWork can call redeemAndDeploy using a token to deploy a contract',
    HomeWork,
    'redeemAndDeploy',
    'send',
    [
      address + '000000000000000000000002',
      address,
      MockContractArtifact.bytecode
    ],
    true,
    receipt => {
      let runtimeStorageEvent
      let newControllerEvent
      if (testingContext === 'coverage') {
        runtimeStorageEvent = (
          receipt.events.NewRuntimeStorageContract[0].returnValues
        )
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        runtimeStorageEvent = (
          receipt.events.NewRuntimeStorageContract.returnValues
        )
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        runtimeStorageEvent.runtimeCodeHash,
        web3.utils.keccak256(MockContractArtifact.bytecode, {encoding: 'hex'})
      )

      assert.strictEqual(
        newControllerEvent.key,
        address.toLowerCase() + '000000000000000000000002'
      )
      assert.strictEqual(
        newControllerEvent.newController,
        address
      )

      let transferEvent
      if (testingContext === 'coverage') {
        transferEvent = receipt.events.Transfer[0].returnValues
      } else {
        transferEvent = receipt.events.Transfer.returnValues
      }

      assert.strictEqual(transferEvent.from, address)
      assert.strictEqual(transferEvent.to, nullAddress)
      assert.strictEqual(
        transferEvent.tokenId,
        web3.utils.toBN(address + '000000000000000000000002').toString(10)
      )

      let newResidentEvent
      if (testingContext === 'coverage') {
        newResidentEvent = receipt.events.NewResident[0].returnValues
      } else {
        newResidentEvent = receipt.events.NewResident.returnValues
      }

      const payload = (
        '0xff' +
        HomeWork.options.address.slice(2) +
        address.slice(2) + '000000000000000000000002' +
        METAMORPHIC_INIT_CODE_HASH.slice(2)
      )

      const targetAddress = web3.utils.toChecksumAddress(
        '0x' + web3.utils.sha3(
          payload,
          {encoding: "hex"}
        ).slice(12).substring(14)
      )

      assert.strictEqual(
        newResidentEvent.homeAddress,
        targetAddress
      )
      assert.strictEqual(
        newResidentEvent.key,
        address.toLowerCase() + '000000000000000000000002'
      )
      assert.strictEqual(
        newResidentEvent.runtimeCodeHash,
        web3.utils.keccak256(
          MockContractArtifact.deployedBytecode,
          {encoding: 'hex'}
        )
      )
    }
  )

  await runTest(
    'HomeWork can get total supply',
    HomeWork,
    'totalSupply',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '3')
    }
  )

  await runTest(
    'HomeWork can assign control of a home address',
    HomeWork,
    'assignController',
    'send',
    [
      address + '000000000000000000000003',
      address
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        address.toLowerCase() + '000000000000000000000003'
      )
      assert.strictEqual(
        newControllerEvent.newController,
        address
      )
    }
  )

  await runTest(
    'HomeWork cannot mint a token if the owner cannot accept ERC721s',
    HomeWork,
    'lock',
    'send',
    [
      address + '000000000000000000000003',
      MockContract.options.address
    ],
    false
  )

  await runTest(
    'HomeWork can lock the home address again and mint a token',
    HomeWork,
    'lock',
    'send',
    [
      address + '000000000000000000000003',
      address
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        address.toLowerCase() + '000000000000000000000003'
      )
      assert.strictEqual(
        newControllerEvent.newController,
        HomeWork.options.address
      )

      let transferEvent
      if (testingContext === 'coverage') {
        transferEvent = receipt.events.Transfer[0].returnValues
      } else {
        transferEvent = receipt.events.Transfer.returnValues
      }

      assert.strictEqual(transferEvent.from, nullAddress)
      assert.strictEqual(transferEvent.to, address)
      assert.strictEqual(
        transferEvent.tokenId,
        web3.utils.toBN(address + '000000000000000000000003').toString(10)
      )
    }
  )

  await runTest(
    'HomeWork can get total supply',
    HomeWork,
    'totalSupply',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '4')
    }
  )

  await runTest(
    'HomeWork cannot call relinquishControl with an endowment (non-payable)',
    HomeWork,
    'relinquishControl',
    'send',
    [
      address + '000000000000000000000004'
    ],
    false,
    receipt => {},
    address,
    1
  )

  await runTest(
    'HomeWork can relinquish control of a home address',
    HomeWork,
    'relinquishControl',
    'send',
    [
      address + '000000000000000000000004'
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        address.toLowerCase() + '000000000000000000000004'
      )
      assert.strictEqual(
        newControllerEvent.newController,
        nullAddress
      )
    }
  )

  // efficient batchLock test - failure (no control)
  await web3.eth.sendTransaction({
    from: address,
    to: HomeWork.options.address,
    value: 0,
    gas: gasLimit - 1,
    gasPrice: 1,
    data: '0x00000000' + address.slice(2) + '000000000000000000000004'
  }).catch(error => {})

  await runTest(
    'HomeWork does not allow calling staticCreate2Check from outside callers',
    HomeWork,
    'staticCreate2Check',
    'send',
    [
      nullBytes32
    ],
    false
  )

  await runTest(
    'HomeWork cannot call deriveKey with an endowment (non-payable)',
    HomeWork,
    'deriveKey',
    'send',
    [
      nullBytes32
    ],
    false,
    receipt => {},
    address,
    1
  )

  await runTest(
    'HomeWork can derive a key',
    HomeWork,
    'deriveKey',
    'send',
    [
      nullBytes32
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        web3.utils.keccak256(
          nullBytes32 + address.slice(2).toLowerCase(),
          {encoding: 'hex'}
        )
      )
      assert.strictEqual(
        newControllerEvent.newController,
        address
      )
    }
  )

  await runTest(
    'HomeWork can derive a key twice (idempotent)',
    HomeWork,
    'deriveKey',
    'send',
    [
      nullBytes32
    ],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(Object.entries(receipt.events).length, 0)
      }
    }
  )

  let derivedKey
  await runTest(
    'HomeWork can get the derived key',
    HomeWork,
    'getDerivedKey',
    'call',
    [
      nullBytes32,
      address
    ],
    true,
    value => {
      derivedKey = value
    }
  )  

  await runTest(
    'HomeWork can get home address for the key',
    HomeWork,
    'getHomeAddress',
    'call',
    [
      derivedKey
    ],
    true,
    value => {
      selfAddress = value
    }
  )

  await web3.eth.sendTransaction({
    from: originalAddress,
    to: selfAddress,
    value: 1,
    gas: '0x5208',
    gasPrice: '0x4A817C800'
  })

  await runTest(
    'HomeWork cannot mint a token if the owner cannot accept ERC721s',
    HomeWork,
    'deriveKeyAndLock',
    'send',
    [
      nullBytes32,
      MockContract.options.address
    ],
    false
  )

  await runTest(
    'HomeWork cannot call deriveKeyAndLock with an endowment (non-payable)',
    HomeWork,
    'deriveKeyAndLock',
    'send',
    [
      nullBytes32,
      address
    ],
    false,
    receipt => {},
    address,
    1
  )

  await runTest(
    'HomeWork can derive a known key and lock it to mint a token',
    HomeWork,
    'deriveKeyAndLock',
    'send',
    [
      nullBytes32,
      address
    ],
    true,
    receipt => {
      const derivedKey = web3.utils.keccak256(
        nullBytes32 + address.slice(2).toLowerCase(),
        {encoding: 'hex'}
      )

      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(newControllerEvent.key, derivedKey)
      assert.strictEqual(
        newControllerEvent.newController,
        HomeWork.options.address
      )

      let transferEvent
      if (testingContext === 'coverage') {
        transferEvent = receipt.events.Transfer[0].returnValues
      } else {
        transferEvent = receipt.events.Transfer.returnValues
      }

      assert.strictEqual(transferEvent.from, nullAddress)
      assert.strictEqual(transferEvent.to, address)
      assert.strictEqual(
        transferEvent.tokenId,
        web3.utils.toBN(derivedKey).toString(10)
      )
    }
  )

  await runTest(
    'HomeWork can get total supply',
    HomeWork,
    'totalSupply',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '5')
    }
  )

  await runTest(
    'HomeWork can derive a new key and lock it to mint a token',
    HomeWork,
    'deriveKeyAndLock',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      address
    ],
    true,
    receipt => {
      const derivedKey = web3.utils.keccak256(
        '0x0000000000000000000000000000000000000000000000000000000000000001' + address.slice(2).toLowerCase(),
        {encoding: 'hex'}
      )

      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        derivedKey
      )
      assert.strictEqual(
        newControllerEvent.newController,
        HomeWork.options.address
      )

      let transferEvent
      if (testingContext === 'coverage') {
        transferEvent = receipt.events.Transfer[0].returnValues
      } else {
        transferEvent = receipt.events.Transfer.returnValues
      }

      assert.strictEqual(transferEvent.from, nullAddress)
      assert.strictEqual(transferEvent.to, address)
      assert.strictEqual(
        transferEvent.tokenId,
        web3.utils.toBN(derivedKey).toString(10)
      )
    }
  )

  await runTest(
    'HomeWork can get total supply',
    HomeWork,
    'totalSupply',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '6')
    }
  )

  await runTest(
    'HomeWork cannot assign control of a derived key to null address',
    HomeWork,
    'deriveKeyAndAssignController',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000002',
      nullAddress
    ],
    false
  )

  await runTest(
    'HomeWork cannot assign control of a derived key to contract address',
    HomeWork,
    'deriveKeyAndAssignController',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000002',
      HomeWork.options.address
    ],
    false
  )

  await runTest(
    'HomeWork can get the derived key',
    HomeWork,
    'getDerivedKey',
    'call',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000002',
      address
    ],
    true,
    value => {
      derivedKey = value
    }
  )

  await runTest(
    'HomeWork can get home address for the key',
    HomeWork,
    'getHomeAddress',
    'call',
    [
      derivedKey
    ],
    true,
    value => {
      selfAddress = value
    }
  )

  await runTest(
    'HomeWork cannot assign control of a derived key to home address',
    HomeWork,
    'deriveKeyAndAssignController',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000002',
      selfAddress
    ],
    false
  )

  await runTest(
    'HomeWork cannot call deriveKeyAndAssignController with endowment (non-payable)',
    HomeWork,
    'deriveKeyAndAssignController',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000002',
      address
    ],
    false,
    receipt => {},
    address,
    1
  )

  await runTest(
    'HomeWork can derive a key and assign a new controller',
    HomeWork,
    'deriveKeyAndAssignController',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000002',
      address
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        web3.utils.keccak256(
          '0x0000000000000000000000000000000000000000000000000000000000000002' + address.slice(2).toLowerCase(),
          {encoding: 'hex'}
        )
      )
      assert.strictEqual(
        newControllerEvent.newController,
        address
      )
    }
  )

  await runTest(
    'HomeWork cannot call deriveKeyAndRelinquishControl with endowment (non-payable)',
    HomeWork,
    'deriveKeyAndRelinquishControl',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000003'
    ],
    false,
    receipt => {},
    address,
    1
  )

  await runTest(
    'HomeWork can derive a key and relinquish control of it',
    HomeWork,
    'deriveKeyAndRelinquishControl',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000003'
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        web3.utils.keccak256(
          '0x0000000000000000000000000000000000000000000000000000000000000003' + address.slice(2).toLowerCase(),
          {encoding: 'hex'}
        )
      )
      assert.strictEqual(
        newControllerEvent.newController,
        nullAddress
      )
    }
  )

  await runTest(
    'HomeWork can derive another key and assign a new controller',
    HomeWork,
    'deriveKeyAndAssignController',
    'send',
    [
      '0x000000000000000000000000000000000000000000000000000000000000000a',
      address
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        web3.utils.keccak256(
          '0x000000000000000000000000000000000000000000000000000000000000000a' + address.slice(2).toLowerCase(),
          {encoding: 'hex'}
        )
      )
      assert.strictEqual(
        newControllerEvent.newController,
        address
      )
    }
  )

  await runTest(
    'HomeWork can derive the same key and reassign a new controller',
    HomeWork,
    'deriveKeyAndAssignController',
    'send',
    [
      '0x000000000000000000000000000000000000000000000000000000000000000a',
      address
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        web3.utils.keccak256(
          '0x000000000000000000000000000000000000000000000000000000000000000a' + address.slice(2).toLowerCase(),
          {encoding: 'hex'}
        )
      )
      assert.strictEqual(
        newControllerEvent.newController,
        address
      )
    }
  )

  await runTest(
    'HomeWork can derive a key and relinquish control of it after assignment',
    HomeWork,
    'deriveKeyAndRelinquishControl',
    'send',
    [
      '0x000000000000000000000000000000000000000000000000000000000000000a'
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        web3.utils.keccak256(
          '0x000000000000000000000000000000000000000000000000000000000000000a' + address.slice(2).toLowerCase(),
          {encoding: 'hex'}
        )
      )
      assert.strictEqual(
        newControllerEvent.newController,
        nullAddress
      )
    }
  )

  await runTest(
    'HomeWork cannot derive a key and deploy if it is not the controller',
    HomeWork,
    'deriveKeyAndDeployViaExistingRuntimeStorageContract',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000003',
      initContract
    ],
    false
  )

  await runTest(
    'HomeWork cannot lock using a relinquished derived key',
    HomeWork,
    'deriveKeyAndLock',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000003',
      address
    ],
    false
  )

  await runTest(
    'HomeWork cannot assign a new controller to a relinquished derived key',
    HomeWork,
    'deriveKeyAndAssignController',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000003',
      address
    ],
    false
  )

  await runTest(
    'HomeWork cannot relinquish control of an already-relinquished derived key',
    HomeWork,
    'deriveKeyAndRelinquishControl',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000003'
    ],
    false
  )

  await runTest(
    'HomeWork cannot call setReverseLookup with an endowment (non-payable)',
    HomeWork,
    'setReverseLookup',
    'send',
    [
      nullBytes32
    ],
    false,
    receipt => {},
    address,
    1
  )

  await runTest(
    'HomeWork can set reverse lookup on a key',
    HomeWork,
    'setReverseLookup',
    'send',
    [
      address + '000000000000000000000000'
    ],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(Object.entries(receipt.events).length, 0)
      }
    }
  )

  await runTest(
    'HomeWork can check for key information via reverse lookup',
    HomeWork,
    'reverseLookup',
    'call',
    [
      targetMetamorphicContractAddress
    ],
    true,
    values => {
      assert.strictEqual(
        values.key,
        address.toLowerCase() + '000000000000000000000000'
      )
      assert.strictEqual(values.salt, nullBytes32)
      assert.strictEqual(values.submitter, nullAddress)
    }
  )

  await runTest(
    'HomeWork cannot call setDerivedReverseLookup with endowment (non-payable)',
    HomeWork,
    'setDerivedReverseLookup',
    'send',
    [
      nullBytes32,
      address
    ],
    false,
    receipt => {},
    address,
    1
  )

  await runTest(
    'HomeWork can set reverse lookup on a derived key',
    HomeWork,
    'setDerivedReverseLookup',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      address
    ],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(Object.entries(receipt.events).length, 0)
      }
    }
  )

  const reverseLookupDerivedKey = web3.utils.keccak256(
    '0x0000000000000000000000000000000000000000000000000000000000000001' + address.slice(2).toLowerCase(),
    {encoding: 'hex'}
  )

  const reverseLookupPayload = (
    '0xff' +
    HomeWork.options.address.slice(2) +
    reverseLookupDerivedKey.slice(2) +
    METAMORPHIC_INIT_CODE_HASH.slice(2)
  )

  const reverseLookupHomeAddress = web3.utils.toChecksumAddress(
    '0x' + web3.utils.sha3(
      reverseLookupPayload,
      {encoding: "hex"}
    ).slice(12).substring(14)
  )

  await runTest(
    'HomeWork can check for derived key information via reverse lookup',
    HomeWork,
    'reverseLookup',
    'call',
    [
      reverseLookupHomeAddress
    ],
    true,
    values => {
      assert.strictEqual(
        values.key,
        reverseLookupDerivedKey
      )
      assert.strictEqual(
        values.salt,
        '0x0000000000000000000000000000000000000000000000000000000000000001'
      )
      assert.strictEqual(values.submitter, address)
    }
  )

  await runTest(
    'HomeWork cannot redeem a token and deploy if controller is null address',
    HomeWork,
    'redeemAndDeployViaExistingRuntimeStorageContract',
    'send',
    [
      address + '000000000000000000000003',
      nullAddress,
      initContract
    ],
    false
  )

  await runTest(
    'HomeWork cannot redeem a token and deploy if controller is contract address',
    HomeWork,
    'redeemAndDeployViaExistingRuntimeStorageContract',
    'send',
    [
      address + '000000000000000000000003',
      HomeWork.options.address,
      initContract
    ],
    false
  )

  await runTest(
    'HomeWork can get home address for the key',
    HomeWork,
    'getHomeAddress',
    'call',
    [
      address + '000000000000000000000003'
    ],
    true,
    value => {
      selfAddress = value
    }
  )

  await runTest(
    'HomeWork cannot redeem a token and deploy if controller is home address',
    HomeWork,
    'redeemAndDeployViaExistingRuntimeStorageContract',
    'send',
    [
      address + '000000000000000000000003',
      selfAddress,
      initContract
    ],
    false
  )

  await runTest(
    'HomeWork can redeem a token and deploy if it is not the token owner',
    HomeWork,
    'redeemAndDeployViaExistingRuntimeStorageContract',
    'send',
    [
      address + '000000000000000000000003',
      address,
      initContract
    ],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    'HomeWork cannot redeem a token and deploy using an empty storage contract',
    HomeWork,
    'redeemAndDeployViaExistingRuntimeStorageContract',
    'send',
    [
      address + '000000000000000000000003',
      address,
      nullAddress
    ],
    false
  )

  await runTest(
    'HomeWork can redeem a token and deploy using an existing storage contract',
    HomeWork,
    'redeemAndDeployViaExistingRuntimeStorageContract',
    'send',
    [
      address + '000000000000000000000003',
      address,
      initContract
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        address.toLowerCase() + '000000000000000000000003'
      )
      assert.strictEqual(
        newControllerEvent.newController,
        address
      )

      let transferEvent
      if (testingContext === 'coverage') {
        transferEvent = receipt.events.Transfer[0].returnValues
      } else {
        transferEvent = receipt.events.Transfer.returnValues
      }

      assert.strictEqual(transferEvent.from, address)
      assert.strictEqual(transferEvent.to, nullAddress)
      assert.strictEqual(
        transferEvent.tokenId,
        web3.utils.toBN(address + '000000000000000000000003').toString(10)
      )

      if (testingContext === 'coverage') {
        newResidentEvent = receipt.events.NewResident[0].returnValues
      } else {
        newResidentEvent = receipt.events.NewResident.returnValues
      }

      assert.strictEqual(
        newResidentEvent.key,
        address.toLowerCase() + '000000000000000000000003'
      )
      assert.strictEqual(
        newResidentEvent.runtimeCodeHash,
        web3.utils.keccak256(
          MockContractArtifact.deployedBytecode,
          {encoding: 'hex'}
        )
      )
    }
  )

  await runTest(
    'HomeWork can get total supply',
    HomeWork,
    'totalSupply',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '5')
    }
  )

  await runTest(
    'HomeWork cannot derive a key and deploy with empty initialization data',
    HomeWork,
    'deriveKeyAndDeploy',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000004',
      '0x'
    ],
    false
  )

  let yetAnotherContract
  await runTest(
    'HomeWork can derive a key and deploy',
    HomeWork,
    'deriveKeyAndDeploy',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000004',
      MockContractArtifact.bytecode
    ],
    true,
    receipt => {
      const derivedKey = web3.utils.keccak256(
        '0x0000000000000000000000000000000000000000000000000000000000000004' + address.slice(2).toLowerCase(),
        {encoding: 'hex'}
      )

      const payload = (
        '0xff' +
        HomeWork.options.address.slice(2) +
        derivedKey.slice(2) +
        METAMORPHIC_INIT_CODE_HASH.slice(2)
      )

      const derivedHomeAddress = web3.utils.toChecksumAddress(
        '0x' + web3.utils.sha3(
          payload,
          {encoding: "hex"}
        ).slice(12).substring(14)
      )

      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        derivedKey
      )
      assert.strictEqual(
        newControllerEvent.newController,
        address
      )

      let newResidentEvent
      if (testingContext === 'coverage') {
        newResidentEvent = receipt.events.NewResident[0].returnValues
      } else {
        newResidentEvent = receipt.events.NewResident.returnValues
      }

      assert.strictEqual(
        newResidentEvent.homeAddress,
        derivedHomeAddress
      )
      assert.strictEqual(
        newResidentEvent.key,
        derivedKey
      )
      assert.strictEqual(
        newResidentEvent.runtimeCodeHash,
        web3.utils.keccak256(
          MockContractArtifact.deployedBytecode,
          {encoding: 'hex'}
        )
      )

      let runtimeStorageEvent
      if (testingContext === 'coverage') {
        runtimeStorageEvent = (
          receipt.events.NewRuntimeStorageContract[0].returnValues
        )
      } else {
        runtimeStorageEvent = (
          receipt.events.NewRuntimeStorageContract.returnValues
        )
      }

      assert.strictEqual(
        runtimeStorageEvent.runtimeCodeHash,
        web3.utils.keccak256(MockContractArtifact.bytecode, {encoding: 'hex'})
      )

      yetAnotherContract = newResidentEvent.homeAddress
    }
  )

  const YetAnotherContract = new web3.eth.Contract(
    MockContractArtifact.abi,
    yetAnotherContract
  )

  await runTest(
    'HomeWork cannot derive a key and deploy if a contract is already deployed',
    HomeWork,
    'deriveKeyAndDeploy',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000004',
      MockContractArtifact.bytecode
    ],
    false
  )

  await runTest(
    'HomeWork cannot derive a key and lock it if contract is deployed',
    HomeWork,
    'deriveKeyAndLock',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000004',
      address
    ],
    false
  )

  await runTest(
    'created contract can be destroyed',
    YetAnotherContract,
    'destroy'
  )

  await web3.eth.sendTransaction({
    from: originalAddress,
    to: YetAnotherContract.options.address,
    value: 1,
    gas: '0x5208',
    gasPrice: '0x4A817C800'
  })

  await runTest(
    'HomeWork can derive a key and relinquish control of it to prevent deployment',
    HomeWork,
    'deriveKeyAndRelinquishControl',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000004'
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        web3.utils.keccak256(
          '0x0000000000000000000000000000000000000000000000000000000000000004' + address.slice(2).toLowerCase(),
          {encoding: 'hex'}
        )
      )
      assert.strictEqual(
        newControllerEvent.newController,
        nullAddress
      )
    }
  )

  await runTest(
    'HomeWork cannot derive a key and deploy if control has been transferred',
    HomeWork,
    'deriveKeyAndDeploy',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000004',
      MockContractArtifact.bytecode
    ],
    false
  )

  await runTest(
    'HomeWork cannot derive a key and deploy using an empty storage contract',
    HomeWork,
    'deriveKeyAndDeployViaExistingRuntimeStorageContract',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000005',
      nullAddress
    ],
    false
  )

  let anotherContract
  await runTest(
    'HomeWork can derive a key and deploy using an existing storage contract',
    HomeWork,
    'deriveKeyAndDeployViaExistingRuntimeStorageContract',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000005',
      initContract
    ],
    true,
    receipt => {
      let newResidentEvent
      if (testingContext === 'coverage') {
        newResidentEvent = receipt.events.NewResident[0].returnValues
      } else {
        newResidentEvent = receipt.events.NewResident.returnValues
      }

      const derivedKey = web3.utils.keccak256(
        '0x0000000000000000000000000000000000000000000000000000000000000005' + address.slice(2).toLowerCase(),
        {encoding: 'hex'}
      )

      const payload = (
        '0xff' +
        HomeWork.options.address.slice(2) +
        derivedKey.slice(2) +
        METAMORPHIC_INIT_CODE_HASH.slice(2)
      )

      const targetAddress = web3.utils.toChecksumAddress(
        '0x' + web3.utils.sha3(
          payload,
          {encoding: "hex"}
        ).slice(12).substring(14)
      )

      assert.strictEqual(
        newResidentEvent.homeAddress,
        targetAddress
      )
      assert.strictEqual(
        newResidentEvent.key,
        derivedKey
      )
      assert.strictEqual(
        newResidentEvent.runtimeCodeHash,
        web3.utils.keccak256(
          MockContractArtifact.deployedBytecode,
          {encoding: 'hex'}
        )
      )

      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        derivedKey
      )
      assert.strictEqual(
        newControllerEvent.newController,
        address
      )

      anotherContract = newResidentEvent.homeAddress
    }
  )

  AnotherContract = new web3.eth.Contract(
    MockContractArtifact.abi,
    anotherContract
  )

  await runTest(
    'HomeWork cannot derive a key and deploy again if there is already a contract',
    HomeWork,
    'deriveKeyAndDeployViaExistingRuntimeStorageContract',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000005',
      initContract
    ],
    false
  )

  await runTest(
    'deployed contract can be destroyed',
    AnotherContract,
    'destroy'
  )

  await runTest(
    'HomeWork can get a derived key',
    HomeWork,
    'getDerivedKey',
    'call',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000005',
      address
    ],
    true,
    value => {
      derivedKey = value
    }
  )

  await runTest(
    'HomeWork can get home address for the key',
    HomeWork,
    'getHomeAddress',
    'call',
    [
      derivedKey
    ],
    true,
    value => {
      selfAddress = value
    }
  )

  await web3.eth.sendTransaction({
    from: originalAddress,
    to: selfAddress,
    value: 1,
    gas: '0x5208',
    gasPrice: '0x4A817C800'
  })

  await runTest(
    'HomeWork can derive a key and deploy again correctly',
    HomeWork,
    'deriveKeyAndDeployViaExistingRuntimeStorageContract',
    'send',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000005',
      initContract
    ],
    true,
    receipt => {
      let newResidentEvent
      if (testingContext === 'coverage') {
        newResidentEvent = receipt.events.NewResident[0].returnValues
      } else {
        newResidentEvent = receipt.events.NewResident.returnValues
      }

      const derivedKey = web3.utils.keccak256(
        '0x0000000000000000000000000000000000000000000000000000000000000005' + address.slice(2).toLowerCase(),
        {encoding: 'hex'}
      )

      const payload = (
        '0xff' +
        HomeWork.options.address.slice(2) +
        derivedKey.slice(2) +
        METAMORPHIC_INIT_CODE_HASH.slice(2)
      )

      const targetAddress = web3.utils.toChecksumAddress(
        '0x' + web3.utils.sha3(
          payload,
          {encoding: "hex"}
        ).slice(12).substring(14)
      )

      assert.strictEqual(
        newResidentEvent.homeAddress,
        targetAddress
      )
      assert.strictEqual(
        newResidentEvent.key,
        derivedKey
      )
      assert.strictEqual(
        newResidentEvent.runtimeCodeHash,
        web3.utils.keccak256(
          MockContractArtifact.deployedBytecode,
          {encoding: 'hex'}
        )
      )

      // No controller event if the derived key has already been created
      assert.ok(typeof receipt.events.NewController === 'undefined')

      anotherContract = newResidentEvent.homeAddress
    }
  )

  await runTest(
    'HomeWork can get home address for the key',
    HomeWork,
    'getHomeAddressInformation',
    'call',
    [
      address + '00000000000000000000000c'
    ],
    true,
    values => {
      selfAddress = values.homeAddress
    }
  )

  await web3.eth.sendTransaction({
    from: originalAddress,
    to: selfAddress,
    value: 1,
    gas: '0x5208',
    gasPrice: '0x4A817C800'
  })

  await runTest(
    'HomeWork can assign a different controller to an address before batchLock',
    HomeWork,
    'assignController',
    'send',
    [
      address + '00000000000000000000000c',
      originalAddress
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        address.toLowerCase() + '00000000000000000000000c'
      )
      assert.strictEqual(
        newControllerEvent.newController,
        originalAddress
      )
    }
  )

  await runTest(
    'HomeWork cannot call batchLock with an endowment (non-payable)',
    HomeWork,
    'batchLock',
    'send',
    [
      address,
      [
        address + '000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000001',
        address + '000000000000000000000005',
        address + '00000000000000000000000c'
      ]
    ],
    false,
    receipt => {},
    address,
    1
  ) 

  await runTest(
    'HomeWork can call batchLock',
    HomeWork,
    'batchLock',
    'send',
    [
      address,
      [
        address + '000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000001',
        address + '000000000000000000000005',
        address + '00000000000000000000000c'
      ]
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        address.toLowerCase() + '000000000000000000000005'
      )
      assert.strictEqual(
        newControllerEvent.newController,
        HomeWork.options.address
      )

      let transferEvent
      if (testingContext === 'coverage') {
        transferEvent = receipt.events.Transfer[0].returnValues
      } else {
        transferEvent = receipt.events.Transfer.returnValues
      }

      assert.strictEqual(transferEvent.from, nullAddress)
      assert.strictEqual(transferEvent.to, address)
      assert.strictEqual(
        transferEvent.tokenId,
        web3.utils.toBN(address + '000000000000000000000005').toString(10)
      )
    }
  ) 

  await runTest(
    'HomeWork can get total supply',
    HomeWork,
    'totalSupply',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '6')
    }
  )

  await runTest(
    'HomeWork call to batchLock does nothing when empty array is supplied',
    HomeWork,
    'batchLock',
    'send',
    [
      address,
      []
    ],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(Object.entries(receipt.events).length, 0)
      }
    }
  )

  await runTest(
    'HomeWork cannot call batchLock when the owner cannot accept ERC721s',
    HomeWork,
    'batchLock',
    'send',
    [
      MockContract.options.address,
      [
        address + '00000000000000000000000a'
      ]
    ],
    false
  )

  await runTest(
    'HomeWork can get a derived key',
    HomeWork,
    'getDerivedKey',
    'call',
    [
      '0x0000000000000000000000000000000000000000000000000000000000000009',
      address
    ],
    true,
    value => {
      derivedKey = value
    }
  )

  await runTest(
    'HomeWork can get home address for the key',
    HomeWork,
    'getHomeAddress',
    'call',
    [
      derivedKey
    ],
    true,
    value => {
      selfAddress = value
    }
  )

  await web3.eth.sendTransaction({
    from: originalAddress,
    to: selfAddress,
    value: 1,
    gas: '0x5208',
    gasPrice: '0x4A817C800'
  })

  await runTest(
    'HomeWork cannot call deriveKeysAndBatchLock with endowment (non-payable)',
    HomeWork,
    'deriveKeysAndBatchLock',
    'send',
    [
      address,
      [
        '0x0000000000000000000000000000000000000000000000000000000000000003',
        '0x0000000000000000000000000000000000000000000000000000000000000005',
        '0x0000000000000000000000000000000000000000000000000000000000000006',
        '0x0000000000000000000000000000000000000000000000000000000000000009'
      ]
    ],
    false,
    receipt => {},
    address,
    1
  )

  await runTest(
    'HomeWork can call deriveKeysAndBatchLock',
    HomeWork,
    'deriveKeysAndBatchLock',
    'send',
    [
      address,
      [
        '0x0000000000000000000000000000000000000000000000000000000000000003',
        '0x0000000000000000000000000000000000000000000000000000000000000005',
        '0x0000000000000000000000000000000000000000000000000000000000000006',
        '0x0000000000000000000000000000000000000000000000000000000000000009'
      ]
    ],
    true,
    receipt => {
      let newControllerEventOne
      let newControllerEventTwo
      if (testingContext === 'coverage') {
        return // TODO: parse multiple events from coverage
      } else {
        newControllerEventOne = receipt.events.NewController[0].returnValues
        newControllerEventTwo = receipt.events.NewController[1].returnValues
      }

      assert.strictEqual(
        newControllerEventOne.key,
        web3.utils.keccak256(
          '0x0000000000000000000000000000000000000000000000000000000000000006' + address.toLowerCase().slice(2)
        )
      )
      assert.strictEqual(
        newControllerEventOne.newController,
        HomeWork.options.address
      )

      assert.strictEqual(
        newControllerEventTwo.key,
        web3.utils.keccak256(
          '0x0000000000000000000000000000000000000000000000000000000000000009' + address.toLowerCase().slice(2)
        )
      )
      assert.strictEqual(
        newControllerEventTwo.newController,
        HomeWork.options.address
      )

      // TODO: multiple transfer events
    }
  )

  await runTest(
    'HomeWork call to deriveKeysAndBatchLock does nothing for empty array',
    HomeWork,
    'deriveKeysAndBatchLock',
    'send',
    [
      address,
      []
    ],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(Object.entries(receipt.events).length, 0)
      }
    }
  )

  await runTest(
    "HomeWork cannot call deriveKeysAndBatchLock if owner can't accept 721s",
    HomeWork,
    'deriveKeysAndBatchLock',
    'send',
    [
      MockContract.options.address,
      [
        '0x000000000000000000000000000000000000000000000000000000000000000e'
      ]
    ],
    false
  )

  const initialHighScoreKey = (
    '0x0000000000000000000000000000000000000000ffffffffffffffffffffffff'
  )

  create2payload = (
    '0xff' +
    HomeWork.options.address.slice(2) +
    initialHighScoreKey.slice(2) +
    METAMORPHIC_INIT_CODE_HASH.slice(2)
  )

  const initialHighScoreHomeAddress = web3.utils.toChecksumAddress(
    '0x' + web3.utils.sha3(
      create2payload,
      {encoding: "hex"}
    ).slice(12).substring(14)
  )

  const initialHighScore = web3.utils.toBN(initialHighScoreHomeAddress)

  await runTest(
    'HomeWork can get current high score',
    HomeWork,
    'getHighScore',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value.holder, nullAddress)
      assert.strictEqual(value.key, initialHighScoreKey)
      assert.strictEqual(
        value.score,
        web3.utils.toBN('0xffffffffffffffffffffffffffffffffffffffff')
          .sub(initialHighScore)
          .toString(10)
      )
    }
  )

  let newHighScoreKey
  let newHighScoreHomeAddress
  let notHighScoreKey
  let nonce = 0
  while (!newHighScoreKey || !notHighScoreKey) {
    let potentialKey = address + nonce.toString(10).padStart(24, '0')

    create2payload = (
      '0xff' +
      HomeWork.options.address.slice(2) +
      potentialKey.slice(2) +
      METAMORPHIC_INIT_CODE_HASH.slice(2)
    )

    let potentialHighScoreHomeAddress = web3.utils.toChecksumAddress(
      '0x' + web3.utils.sha3(
        create2payload,
        {encoding: "hex"}
      ).slice(12).substring(14)
    )

    let potentialHighScore = web3.utils.toBN(potentialHighScoreHomeAddress)

    if (!newHighScoreKey && potentialHighScore.lt(initialHighScore)) {
      newHighScoreKey = potentialKey
      newHighScoreHomeAddress = potentialHighScoreHomeAddress
    } else if (!notHighScoreKey && potentialHighScore.gt(initialHighScore)) {
      notHighScoreKey = potentialKey
    }

    nonce++
  }

  await runTest(
    'HomeWork cannot claim high score if the caller is not encoded in the key',
    HomeWork,
    'claimHighScore',
    'send',
    [
      nullBytes32
    ],
    false
  )

  await runTest(
    'HomeWork cannot claim high score if it is not better than current high score',
    HomeWork,
    'claimHighScore',
    'send',
    [
      notHighScoreKey
    ],
    false
  )

  await runTest(
    'HomeWork cannot call recover without holding the high score',
    HomeWork,
    'recover',
    'send',
    [
      address,
      address
    ],
    false
  )

  const newHighScore = (
    web3.utils.toBN('0xffffffffffffffffffffffffffffffffffffffff')
      .sub(web3.utils.toBN(newHighScoreHomeAddress))
      .toString(10)
  )

  await runTest(
    'HomeWork cannot call claimHighScore with an endowment (non-payable)',
    HomeWork,
    'claimHighScore',
    'send',
    [
      newHighScoreKey
    ],
    false,
    receipt => {},
    address,
    1
  )

  await runTest(
    'HomeWork can claim high score if it submits the best high score key',
    HomeWork,
    'claimHighScore',
    'send',
    [
      newHighScoreKey
    ],
    true,
    receipt => {
      let newHighScoreEvent
      if (testingContext === 'coverage') {
        newHighScoreEvent = receipt.events.NewHighScore[0].returnValues
      } else {
        newHighScoreEvent = receipt.events.NewHighScore.returnValues
      }

      assert.strictEqual(newHighScoreEvent.key, newHighScoreKey.toLowerCase())
      assert.strictEqual(newHighScoreEvent.submitter, address)
      assert.strictEqual(newHighScoreEvent.score, newHighScore)
    }
  )

  await runTest(
    'HomeWork can get new current high score',
    HomeWork,
    'getHighScore',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value.holder, address)
      assert.strictEqual(value.key, newHighScoreKey.toLowerCase())
      assert.strictEqual(value.score, newHighScore)
    }
  )

  await runTest(
    'HomeWork cannot call recover with an endowment (non-payable)',
    HomeWork,
    'recover',
    'send',
    [
      nullAddress,
      address
    ],
    false,
    receipt => {},
    address,
    1
  )

  let balanceBefore = await web3.eth.getBalance(HomeWork.options.address)
  assert.strictEqual(balanceBefore, '0')

  // TODO: fund contract with a balance (e.g. as a selfdestruct recipient)

  await runTest(
    'HomeWork high score holder can recover ETH',
    HomeWork,
    'recover',
    'send',
    [
      nullAddress,
      address
    ],
    true,
    receipt => {
      if (testingContext !== 'coverage') {
        assert.strictEqual(Object.entries(receipt.events).length, 0)
      }
    }
  )

  // TODO: verify that the balance was successfully transferred

  let balanceAfter = await web3.eth.getBalance(HomeWork.options.address)
  assert.strictEqual(balanceAfter, '0')

  await runTest(
    'MockERC20Stub shows a "balance" on HomeWork',
    MockERC20Stub,
    'balanceOf',
    'call',
    [
      HomeWork.options.address
    ],
    true,
    value => {
      assert.strictEqual(value, '1')
    }
  )

  // HomeWork high score holder can recover tokens (not working the regular way)
  const recoverTokensReceipt = await web3.eth.sendTransaction({
    from: address,
    to: HomeWork.options.address,
    value: 0,
    gas: gasLimit - 1,
    gasPrice: 1,
    data: '0x648bf774000000000000000000000000' + MockERC20Stub.options.address.slice(2) + '000000000000000000000000' + address.slice(2)
  })
  //console.log(recoverTokensReceipt)
  // TODO: validate Transfer event

  await runTest(
    'HomeWork cannot mint a token with the null address set as the owner',
    HomeWork,
    'lock',
    'send',
    [
      address + '00000000000000000000000d',
      nullAddress
    ],
    false
  )

  await runTest(
    'HomeWork cannot find approved information on a token that does not exist',
    HomeWork,
    'getApproved',
    'call',
    [
      nullBytes32,
    ],
    false
  )

  await runTest(
    'HomeWork cannot get the balance of the null address',
    HomeWork,
    'balanceOf',
    'call',
    [
      nullAddress,
    ],
    false
  )

  await runTest(
    'HomeWork can get the balance of an address',
    HomeWork,
    'balanceOf',
    'call',
    [
      address,
    ],
    true,
    value => {
      assert.strictEqual(value, '8')
    }
  )

  await runTest(
    'HomeWork cannot transfer a token using an operator that is not approved',
    HomeWork,
    'safeTransferFrom',
    'send',
    [
      address,
      originalAddress,
      address + '00000000000000000000000d'
    ],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    'HomeWork cannot call setApprovalForAll on itself',
    HomeWork,
    'setApprovalForAll',
    'send',
    [
      address,
      true
    ],
    false
  )

  await runTest(
    'HomeWork can call setApprovalForAll on another address',
    HomeWork,
    'setApprovalForAll',
    'send',
    [
      originalAddress,
      true
    ],
    true,
    receipt => {
      let approvalForAllEvent
      if (testingContext === 'coverage') {
        approvalForAllEvent = receipt.events.ApprovalForAll[0].returnValues
      } else {
        approvalForAllEvent = receipt.events.ApprovalForAll.returnValues
      }

      assert.strictEqual(approvalForAllEvent.owner, address)
      assert.strictEqual(approvalForAllEvent.operator, originalAddress)
      assert.ok(approvalForAllEvent.approved)
    }
  )

  await runTest(
    'HomeWork can lock a home address to mint the missing token',
    HomeWork,
    'lock',
    'send',
    [
      address + '00000000000000000000000d',
      address
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        address.toLowerCase() + '00000000000000000000000d'
      )
      assert.strictEqual(
        newControllerEvent.newController,
        HomeWork.options.address
      )

      let transferEvent
      if (testingContext === 'coverage') {
        transferEvent = receipt.events.Transfer[0].returnValues
      } else {
        transferEvent = receipt.events.Transfer.returnValues
      }

      assert.strictEqual(transferEvent.from, nullAddress)
      assert.strictEqual(transferEvent.to, address)
      assert.strictEqual(
        transferEvent.tokenId,
        web3.utils.toBN(address + '00000000000000000000000d').toString(10)
      )
    }
  )

  await runTest(
    'HomeWork can find approved information on the token (no approval yet)',
    HomeWork,
    'getApproved',
    'call',
    [
      address + '00000000000000000000000d'
    ],
    true,
    value => {
      assert.strictEqual(value, nullAddress)
    }
  )

  await runTest(
    'HomeWork cannot transfer to the null address',
    HomeWork,
    'safeTransferFrom',
    'send',
    [
      address,
      nullAddress,
      address + '00000000000000000000000d'
    ],
    false
  )

  await runTest(
    'HomeWork cannot transfer a token that it does not own',
    HomeWork,
    'safeTransferFrom',
    'send',
    [
      originalAddress,
      originalAddress,
      address + '00000000000000000000000d'
    ],
    false
  )

  await runTest(
    'HomeWork cannot make a safe transfer to a non-supporting contract',
    HomeWork,
    'safeTransferFrom',
    'send',
    [
      address,
      MockContract.options.address,
      address + '00000000000000000000000d'
    ],
    false
  )

  await runTest(
    'HomeWork can transfer a token using an operator',
    HomeWork,
    'safeTransferFrom',
    'send',
    [
      address,
      originalAddress,
      address + '00000000000000000000000d'
    ],
    true,
    receipt => {
      let transferEvent
      if (testingContext === 'coverage') {
        transferEvent = receipt.events.Transfer[0].returnValues
      } else {
        transferEvent = receipt.events.Transfer.returnValues
      }

      assert.strictEqual(transferEvent.from, address)
      assert.strictEqual(transferEvent.to, originalAddress)
      assert.strictEqual(
        transferEvent.tokenId,
        web3.utils.toBN(address + '00000000000000000000000d').toString(10)
      )
    },
    originalAddress
  )

  await runTest(
    'HomeWork cannot call approve on a token it does not own',
    HomeWork,
    'approve',
    'send',
    [
      address,
      address + '00000000000000000000000d'
    ],
    false
  )

  await runTest(
    'HomeWork cannot call approve on itself',
    HomeWork,
    'approve',
    'send',
    [
      originalAddress,
      address + '00000000000000000000000d'
    ],
    false,
    receipt => {},
    originalAddress
  )

  await runTest(
    'HomeWork can call approve on another address',
    HomeWork,
    'approve',
    'send',
    [
      address,
      address + '00000000000000000000000d'
    ],
    true,
    receipt => {
      let approvalEvent
      if (testingContext === 'coverage') {
        approvalEvent = receipt.events.Approval[0].returnValues
      } else {
        approvalEvent = receipt.events.Approval.returnValues
      }

      assert.strictEqual(approvalEvent.owner, originalAddress)
      assert.strictEqual(approvalEvent.approved, address)
      assert.strictEqual(
        approvalEvent.tokenId,
        web3.utils.toBN(address.toLowerCase() + '00000000000000000000000d')
          .toString(10)
      )
    },
    originalAddress
  )

  await runTest(
    'HomeWork can find approved information on an approved token',
    HomeWork,
    'getApproved',
    'call',
    [
      address + '00000000000000000000000d'
    ],
    true,
    value => {
      assert.strictEqual(value, address)
    }
  )

  await runTest(
    'HomeWork can redeem a token from an approved sender, clearing approval',
    HomeWork,
    'redeem',
    'send',
    [
      address + '00000000000000000000000d',
      address
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        address.toLowerCase() + '00000000000000000000000d'
      )
      assert.strictEqual(
        newControllerEvent.newController,
        address
      )

      let transferEvent
      if (testingContext === 'coverage') {
        transferEvent = receipt.events.Transfer[0].returnValues
      } else {
        transferEvent = receipt.events.Transfer.returnValues
      }

      assert.strictEqual(transferEvent.from, originalAddress)
      assert.strictEqual(transferEvent.to, nullAddress)
      assert.strictEqual(
        transferEvent.tokenId,
        web3.utils.toBN(address + '00000000000000000000000d').toString(10)
      )
    }
  )

  await runTest(
    'HomeWork can mint an additional token',
    HomeWork,
    'lock',
    'send',
    [
      address + '00000000000000000000000b',
      address
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        address.toLowerCase() + '00000000000000000000000b'
      )
      assert.strictEqual(
        newControllerEvent.newController,
        HomeWork.options.address
      )

      let transferEvent
      if (testingContext === 'coverage') {
        transferEvent = receipt.events.Transfer[0].returnValues
      } else {
        transferEvent = receipt.events.Transfer.returnValues
      }

      assert.strictEqual(transferEvent.from, nullAddress)
      assert.strictEqual(transferEvent.to, address)
      assert.strictEqual(
        transferEvent.tokenId,
        web3.utils.toBN(address + '00000000000000000000000b').toString(10)
      )
    }
  )

  await runTest(
    'HomeWork can transfer the token to a contract that supports receiving it',
    HomeWork,
    'safeTransferFrom',
    'send',
    [
      address,
      MockERC721Holder.options.address,
      address + '00000000000000000000000b'
    ],
    true,
    receipt => {
      let transferEvent
      if (testingContext === 'coverage') {
        transferEvent = receipt.events.Transfer[0].returnValues
      } else {
        transferEvent = receipt.events.Transfer.returnValues
      }

      assert.strictEqual(transferEvent.from, address)
      assert.strictEqual(transferEvent.to, MockERC721Holder.options.address)
      assert.strictEqual(
        transferEvent.tokenId,
        web3.utils.toBN(address + '00000000000000000000000b').toString(10)
      )
    }
  )

  let checksumHomeAddress;
  await runTest(
    'HomeWork can get home address information',
    HomeWork,
    'getHomeAddress',
    'call',
    [address + '00000000000000000000000b'],
    true,
    value => {
      checksumHomeAddress = value
    }
  )

  await runTest(
    'HomeWork can get correct token URI',
    HomeWork,
    'tokenURI',
    'call',
    [address + '00000000000000000000000b'],
    true,
    value => {
      assert.strictEqual(
        value,
        'data:application/json,{"name":"Home%20Address%20-%20' +
        checksumHomeAddress +
        '","description":"This%20NFT%20can%20be%20redeemed%20on%20HomeWork%20' +
        'to%20grant%20a%20controller%20the%20exclusive%20right%20to%20deploy%' +
        '20contracts%20with%20arbitrary%20bytecode%20to%20the%20designated%20' +
        'home%20address.","image":"data:image/svg+xml;charset=utf-8;base64,PH' +
        'N2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMC' +
        'AxNDQgNzIiPjxzdHlsZT48IVtDREFUQVsuQntzdHJva2UtbGluZWpvaW46cm91bmR9Lk' +
        'N7c3Ryb2tlLW1pdGVybGltaXQ6MTB9LkR7c3Ryb2tlLXdpZHRoOjJ9LkV7ZmlsbDojOW' +
        'I5YjlhfS5Ge3N0cm9rZS1saW5lY2FwOnJvdW5kfV1dPjwvc3R5bGU+PGcgdHJhbnNmb3' +
        'JtPSJtYXRyaXgoMS4wMiAwIDAgMS4wMiA4LjEgMCkiPjxwYXRoIGZpbGw9IiNmZmYiIG' +
        'Q9Ik0xOSAzMmgzNHYyNEgxOXoiLz48ZyBzdHJva2U9IiMwMDAiIGNsYXNzPSJCIEMgRC' +
        'I+PHBhdGggZmlsbD0iI2E1NzkzOSIgZD0iTTI1IDQwaDl2MTZoLTl6Ii8+PHBhdGggZm' +
        'lsbD0iIzkyZDNmNSIgZD0iTTQwIDQwaDh2N2gtOHoiLz48cGF0aCBmaWxsPSIjZWE1YT' +
        'Q3IiBkPSJNNTMgMzJIMTl2LTFsMTYtMTYgMTggMTZ6Ii8+PHBhdGggZmlsbD0ibm9uZS' +
        'IgZD0iTTE5IDMyaDM0djI0SDE5eiIvPjxwYXRoIGZpbGw9IiNlYTVhNDciIGQ9Ik0yOS' +
        'AyMWwtNSA1di05aDV6Ii8+PC9nPjwvZz48ZyB0cmFuc2Zvcm09Im1hdHJpeCguODQgMC' +
        'AwIC44NCA2NSA1KSI+PHBhdGggZD0iTTkuNSAyMi45bDQuOCA2LjRhMy4xMiAzLjEyID' +
        'AgMCAxLTMgMi4ybC00LjgtNi40Yy4zLTEuNCAxLjYtMi40IDMtMi4yeiIgZmlsbD0iI2' +
        'QwY2ZjZSIvPjxwYXRoIGZpbGw9IiMwMTAxMDEiIGQ9Ik00MS43IDM4LjVsNS4xLTYuNS' +
        'IvPjxwYXRoIGQ9Ik00Mi45IDI3LjhMMTguNCA1OC4xIDI0IDYybDIxLjgtMjcuMyAyLj' +
        'MtMi44eiIgY2xhc3M9IkUiLz48cGF0aCBmaWxsPSIjMDEwMTAxIiBkPSJNNDMuNCAyOS' +
        '4zbC00LjcgNS44Ii8+PHBhdGggZD0iTTQ2LjggMzJjMy4yIDIuNiA4LjcgMS4yIDEyLj' +
        'EtMy4yczMuNi05LjkuMy0xMi41bC01LjEgNi41LTIuOC0uMS0uNy0yLjcgNS4xLTYuNW' +
        'MtMy4yLTIuNi04LjctMS4yLTEyLjEgMy4ycy0zLjYgOS45LS4zIDEyLjUiIGNsYXNzPS' +
        'JFIi8+PHBhdGggZmlsbD0iI2E1NzkzOSIgZD0iTTI3LjMgMjZsMTEuOCAxNS43IDMuNC' +
        'AyLjQgOS4xIDE0LjQtMy4yIDIuMy0xIC43LTEwLjItMTMuNi0xLjMtMy45LTExLjgtMT' +
        'UuN3oiLz48cGF0aCBkPSJNMTIgMTkuOWw1LjkgNy45IDEwLjItNy42LTMuNC00LjVzNi' +
        '44LTUuMSAxMC43LTQuNWMwIDAtNi42LTMtMTMuMyAxLjFTMTIgMTkuOSAxMiAxOS45ei' +
        'IgY2xhc3M9IkUiLz48ZyBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIGNsYXNzPSJCIE' +
        'MgRCI+PHBhdGggZD0iTTUyIDU4LjlMNDAuOSA0My4ybC0zLjEtMi4zLTEwLjYtMTQuNy' +
        '0yLjkgMi4yIDEwLjYgMTQuNyAxLjEgMy42IDExLjUgMTUuNXpNMTIuNSAxOS44bDUuOC' +
        'A4IDEwLjMtNy40LTMuMy00LjZzNi45LTUgMTAuOC00LjNjMCAwLTYuNi0zLjEtMTMuMy' +
        '45cy0xMC4zIDcuNC0xMC4zIDcuNHptLTIuNiAyLjlsNC43IDYuNWMtLjUgMS4zLTEuNy' +
        'AyLjEtMyAyLjJsLTQuNy02LjVjLjMtMS40IDEuNi0yLjQgMy0yLjJ6Ii8+PHBhdGggZD' +
        '0iTTQxLjMgMzguNWw1LjEtNi41bS0zLjUtMi43bC00LjYgNS44bTguMS0zLjFjMy4yID' +
        'IuNiA4LjcgMS4yIDEyLjEtMy4yczMuNi05LjkuMy0xMi41bC01LjEgNi41LTIuOC0uMS' +
        '0uOC0yLjcgNS4xLTYuNWMtMy4yLTIuNi04LjctMS4yLTEyLjEgMy4yLTMuNCA0LjMtMy' +
        '42IDkuOS0uMyAxMi41IiBjbGFzcz0iRiIvPjxwYXRoIGQ9Ik0zMC44IDQ0LjRMMTkgNT' +
        'guOWw0IDMgMTAtMTIuNyIgY2xhc3M9IkYiLz48L2c+PC9nPjwvc3ZnPg=="}'
      )
    }
  )

  await runTest(
    'HomeWork reverts when requesting a token URI for a non-existent token',
    HomeWork,
    'tokenURI',
    'call',
    [address + 'ffff00000000000000000000'],
    false
  )

  await runTest(
    'HomeWork can get total supply',
    HomeWork,
    'totalSupply',
    'call',
    [],
    true,
    value => {
      assert.strictEqual(value, '9')
    }
  )

  await runTest(
    'HomeWork can get a token by index',
    HomeWork,
    'tokenByIndex',
    'call',
    [0],
    true,
    value => {
      assert.strictEqual(
        value,
        web3.utils.toBN(address.toLowerCase() + '00112233445566778899aabb')
          .toString(10)
      )
    }
  )

  await runTest(
    'HomeWork cannot get a token by index if it is out-of-bounds',
    HomeWork,
    'tokenByIndex',
    'call',
    [1000000000],
    false
  )

  await runTest(
    'HomeWork can get a token of an owner by index',
    HomeWork,
    'tokenOfOwnerByIndex',
    'call',
    [address, 0],
    true,
    value => {
      assert.strictEqual(
        value,
        web3.utils.toBN(address.toLowerCase() + '00112233445566778899aabb')
          .toString(10)
      )
    }
  )

  await runTest(
    'HomeWork cannot get a token of an owner by index if it is out-of-bounds',
    HomeWork,
    'tokenOfOwnerByIndex',
    'call',
    [address, 1000000000],
    false
  )

  await runTest(
    'HomeWork can mint an additional token',
    HomeWork,
    'lock',
    'send',
    [
      address + '000000000000000000000010',
      address
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        address.toLowerCase() + '000000000000000000000010'
      )
      assert.strictEqual(
        newControllerEvent.newController,
        HomeWork.options.address
      )

      let transferEvent
      if (testingContext === 'coverage') {
        transferEvent = receipt.events.Transfer[0].returnValues
      } else {
        transferEvent = receipt.events.Transfer.returnValues
      }

      assert.strictEqual(transferEvent.from, nullAddress)
      assert.strictEqual(transferEvent.to, address)
      assert.strictEqual(
        transferEvent.tokenId,
        web3.utils.toBN(address + '000000000000000000000010').toString(10)
      )
    }
  )

  await runTest(
    'HomeWork cannot call safeBatchTransferFrom with endowment (non-payable)',
    HomeWork,
    'safeBatchTransferFrom',
    'send',
    [
      address,
      address,
      [address + '000000000000000000000010']
    ],
    false,
    receipt => {},
    address,
    1
  )

  await runTest(
    'HomeWork can call safeBatchTransferFrom',
    HomeWork,
    'safeBatchTransferFrom',
    'send',
    [
      address,
      address,
      [address + '000000000000000000000010']
    ],
    true,
    receipt => {
      let transferEvent
      if (testingContext === 'coverage') {
        transferEvent = receipt.events.Transfer[0].returnValues
      } else {
        transferEvent = receipt.events.Transfer.returnValues
      }

      assert.strictEqual(transferEvent.from, address)
      assert.strictEqual(transferEvent.to, address)
      assert.strictEqual(
        transferEvent.tokenId,
        web3.utils.toBN(address + '000000000000000000000010').toString(10)
      )
    }
  )

  await runTest(
    'HomeWork can mint an additional token',
    HomeWork,
    'lock',
    'send',
    [
      address + '000000000000000000000011',
      address
    ],
    true,
    receipt => {
      let newControllerEvent
      if (testingContext === 'coverage') {
        newControllerEvent = receipt.events.NewController[0].returnValues
      } else {
        newControllerEvent = receipt.events.NewController.returnValues
      }

      assert.strictEqual(
        newControllerEvent.key,
        address.toLowerCase() + '000000000000000000000011'
      )
      assert.strictEqual(
        newControllerEvent.newController,
        HomeWork.options.address
      )

      let transferEvent
      if (testingContext === 'coverage') {
        transferEvent = receipt.events.Transfer[0].returnValues
      } else {
        transferEvent = receipt.events.Transfer.returnValues
      }

      assert.strictEqual(transferEvent.from, nullAddress)
      assert.strictEqual(transferEvent.to, address)
      assert.strictEqual(
        transferEvent.tokenId,
        web3.utils.toBN(address + '000000000000000000000011').toString(10)
      )
    }
  )

  await runTest(
    'HomeWork cannot call safeBatchTransferFrom with data + endowment',
    HomeWork,
    'safeBatchTransferFrom',
    'send',
    [
      address,
      address,
      [address + '000000000000000000000010'],
      '0x0123456789'
    ],
    false,
    receipt => {},
    address,
    1
  )

  await runTest(
    'HomeWork can call safeBatchTransferFrom with data',
    HomeWork,
    'safeBatchTransferFrom',
    'send',
    [
      address,
      address,
      [address + '000000000000000000000010'],
      '0x0123456789'
    ],
    true,
    receipt => {
      let transferEvent
      if (testingContext === 'coverage') {
        transferEvent = receipt.events.Transfer[0].returnValues
      } else {
        transferEvent = receipt.events.Transfer.returnValues
      }

      assert.strictEqual(transferEvent.from, address)
      assert.strictEqual(transferEvent.to, address)
      assert.strictEqual(
        transferEvent.tokenId,
        web3.utils.toBN(address + '000000000000000000000010').toString(10)
      )
    }
  )


  await runTest(
    'HomeWork can deploy a contract that deploys an empty contract itself',
    HomeWork,
    'deploy',
    'send',
    [
      address + 'bbbb00000000000000000000',
      MockReentryPartOneArtifact.bytecode
    ],
    true,
    receipt => {
      let runtimeStorageEvent
      let newResidentEvent
      if (testingContext !== 'coverage') {
        newResidentEventOne = receipt.events.NewResident[0].returnValues
        newResidentEventTwo = receipt.events.NewResident[1].returnValues
        runtimeStorageEventOne = (
          receipt.events.NewRuntimeStorageContract[0].returnValues
        )
        runtimeStorageEventTwo = (
          receipt.events.NewRuntimeStorageContract[1].returnValues
        )

        // Parent runtime storage event is triggered first.
        assert.strictEqual(
          runtimeStorageEventOne.runtimeCodeHash,
          web3.utils.keccak256(
            MockReentryPartOneArtifact.bytecode,
            {encoding: 'hex'}
          )
        )
        assert.strictEqual(
          runtimeStorageEventTwo.runtimeCodeHash,
          web3.utils.keccak256('0x6000', {encoding: 'hex'})
        )

        // Child deployment event is triggered first.
        assert.strictEqual(
          newResidentEventOne.key,
          newResidentEventTwo.homeAddress.toLowerCase() + '000000000000000000000000'
        )
        assert.strictEqual(
          newResidentEventTwo.key,
          address.toLowerCase() + 'bbbb00000000000000000000'
        )
        assert.strictEqual(newResidentEventOne.runtimeCodeHash, emptyHash)
        assert.strictEqual(newResidentEventTwo.runtimeCodeHash, emptyHash)
      }
    }
  )

  await runTest(
    'HomeWork cannot deploy a contract that then locks with an empty contract',
    HomeWork,
    'deploy',
    'send',
    [
      address + 'bbbb00000000000000000000',
      MockReentryPartTwoArtifact.bytecode
    ],
    false
  )

  let payableFallbackCheck = false
  await web3.eth.sendTransaction({
    from: address,
    to: HomeWork.options.address,
    value: 1,
    gas: '0x5208',
    gasPrice: '0x4A817C800'
  }).catch(error => {payableFallbackCheck = true})

  assert.ok(payableFallbackCheck)

  let nonPayableFallbackCheck = false
  await web3.eth.sendTransaction({
    from: address,
    to: HomeWork.options.address,
    value: 0,
    gas: '0x5208',
    gasPrice: '0x4A817C800'
  }).catch(error => {nonPayableFallbackCheck = true})

  assert.ok(nonPayableFallbackCheck)

  let tokenURICheck = false
  await web3.eth.sendTransaction({
    from: address,
    to: '0x000000000071C1c84915c17BF21728BfE4Dac3f3',
    value: 0,
    gas: '0x5208',
    gasPrice: '0x4A817C800'
  }).catch(error => {tokenURICheck = true})

  assert.ok(tokenURICheck)
  
  // TODO: ensure that the payable functions pass all funds along when paid
  // TODO: more reentrancy tests (where deployed contracts call into HomeWork)

  console.log(
    `completed ${passed + failed} test${passed + failed === 1 ? '' : 's'} ` +
    `with ${failed} failure${failed === 1 ? '' : 's'}.`
  )

  if (failed > 0) {
    process.exit(1)
  }

  // exit.
  return 0

}}
