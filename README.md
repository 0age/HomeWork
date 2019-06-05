![HomeWork 🏠🛠️](https://raw.github.com/0age/HomeWork/master/images/HomeWork.svg?sanitize=true)
<img src="https://raw.github.com/0age/HomeWork/master/images/HomeWork.svg?sanitize=true?sanitize=true">

# HomeWork 🏠🛠️

![GitHub](https://img.shields.io/github/license/0age/HomeWork.svg?colorB=brightgreen)
[![Build Status](https://travis-ci.org/0age/HomeWork.svg?branch=master)](https://travis-ci.org/0age/HomeWork)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

> HomeWork is an autonomous utility for finding, sharing and reusing home addresses for contracts.

A **home address** is a dedicated account where a specific controller can deploy arbitrary contracts. Unlike a standard contract deployment, where the deployment address is determined by rigid factors like the nonce of the deployer or the contract's creation code, home address contract deployments relax the usual constraints and allow *any* contract to be deployed to a specific address.

Each home address is tied to a specific **key**, or 32-byte identifier, that uniquely identifies it. Each key has a dedicated controller, an approved manager of the key with the exclusive right to deploy contracts to the corresponding home address. By default, each key is initially controlled by the account address matching the first twenty bytes of said key. Control of keys can easily be transferred, either to other accounts and contracts, or to HomeWork itself by locking the home address and minting an NFT.

HomeWork implements **ERC721**, and will take control of any home address without a deployed contract in exchange for a corresponding NFT. The owner of the NFT can then redeem it in order to gain control over deployment to the designated home address. There's no external issuer or anything, so each token must first be discovered and claimed by a valid submitter.

**DISCLAIMER: this implements highly experimental features / bugs - Be careful! These contracts have not yet been fully tested or audited - proceed with caution and please share any exploits or optimizations you discover.**

You can find HomeWork at `0x0000000000001b84b1cb32787b0d64758d019317` *(yes, there are six zero bytes at the start)* on [mainnet](https://etherscan.io/address/0x0000000000001b84b1cb32787b0d64758d019317), [ropsten](https://ropsten.etherscan.io/address/0x0000000000001b84b1cb32787b0d64758d019317), [goerli](https://goerli.etherscan.io/address/0x0000000000001b84b1cb32787b0d64758d019317), [rinkeby](https://rinkeby.etherscan.io/address/0x0000000000001b84b1cb32787b0d64758d019317), and [kovan](https://kovan.etherscan.io/address/0x0000000000001b84b1cb32787b0d64758d019317) - contract verification is, uh, *challenging*, but you can verify it by checking out the [deployment contract](https://etherscan.io/address/0x07cf8f81852a58dd26fa19e69545f72e263347e5#contracts), including the contract creation code from the deployment's [runtime storage contract](0x000000000071C1c84915c17BF21728BfE4Dac3f3).

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Maintainers](#maintainers)
- [Contribute](#contribute)
- [License](#license)

## Install
If you want to install HomeWork locally, you'll need Node.js 10+ and Yarn *(or npm)*. To get everything set up:
```sh
$ git clone https://github.com/0age/HomeWork.git
$ cd HomeWork
$ yarn install
$ yarn build
```

## Usage
To interact with HomeWork, use the following:

Contract address:
```
0x0000000000001b84b1cb32787b0d64758d019317
```

ABI (basic):
```
[{"constant":true,"inputs":[{"name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"homeAddress","type":"address"},{"indexed":false,"name":"key","type":"bytes32"},{"indexed":false,"name":"runtimeCodeHash","type":"bytes32"}],"name":"NewResident","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"runtimeStorageContract","type":"address"},{"indexed":false,"name":"runtimeCodeHash","type":"bytes32"}],"name":"NewRuntimeStorageContract","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"key","type":"bytes32"},{"indexed":false,"name":"newController","type":"address"}],"name":"NewController","type":"event"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"},{"name":"initializationCode","type":"bytes"}],"name":"deploy","outputs":[{"name":"homeAddress","type":"address"},{"name":"runtimeCodeHash","type":"bytes32"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"},{"name":"owner","type":"address"}],"name":"lock","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"tokenId","type":"uint256"},{"name":"controller","type":"address"}],"name":"redeem","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"},{"name":"controller","type":"address"}],"name":"assignController","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"tokenId","type":"uint256"},{"name":"controller","type":"address"},{"name":"initializationCode","type":"bytes"}],"name":"redeemAndDeploy","outputs":[{"name":"homeAddress","type":"address"},{"name":"runtimeCodeHash","type":"bytes32"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"salt","type":"bytes32"}],"name":"deriveKey","outputs":[{"name":"key","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"}],"name":"setReverseLookup","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"}],"name":"staticCreate2Check","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"}],"name":"isDeployable","outputs":[{"name":"deployable","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"key","type":"bytes32"}],"name":"getHomeAddressInformation","outputs":[{"name":"homeAddress","type":"address"},{"name":"controller","type":"address"},{"name":"deploys","type":"uint256"},{"name":"currentRuntimeCodeHash","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"key","type":"bytes32"}],"name":"hasNeverBeenDeployed","outputs":[{"name":"neverBeenDeployed","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"homeAddress","type":"address"}],"name":"reverseLookup","outputs":[{"name":"key","type":"bytes32"},{"name":"salt","type":"bytes32"},{"name":"submitter","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"salt","type":"bytes32"},{"name":"submitter","type":"address"}],"name":"getDerivedKey","outputs":[{"name":"key","type":"bytes32"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"key","type":"bytes32"}],"name":"getHomeAddress","outputs":[{"name":"homeAddress","type":"address"}],"payable":false,"stateMutability":"pure","type":"function"}]
```

ABI (full):
```
[{"constant":true,"inputs":[{"name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":true,"name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"approved","type":"address"},{"indexed":true,"name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"operator","type":"address"},{"indexed":false,"name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"homeAddress","type":"address"},{"indexed":false,"name":"key","type":"bytes32"},{"indexed":false,"name":"runtimeCodeHash","type":"bytes32"}],"name":"NewResident","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"runtimeStorageContract","type":"address"},{"indexed":false,"name":"runtimeCodeHash","type":"bytes32"}],"name":"NewRuntimeStorageContract","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"key","type":"bytes32"},{"indexed":false,"name":"newController","type":"address"}],"name":"NewController","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"key","type":"bytes32"},{"indexed":false,"name":"submitter","type":"address"},{"indexed":false,"name":"score","type":"uint256"}],"name":"NewHighScore","type":"event"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"},{"name":"initializationCode","type":"bytes"}],"name":"deploy","outputs":[{"name":"homeAddress","type":"address"},{"name":"runtimeCodeHash","type":"bytes32"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"},{"name":"owner","type":"address"}],"name":"lock","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"tokenId","type":"uint256"},{"name":"controller","type":"address"}],"name":"redeem","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"},{"name":"controller","type":"address"}],"name":"assignController","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"}],"name":"relinquishControl","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"tokenId","type":"uint256"},{"name":"controller","type":"address"},{"name":"initializationCode","type":"bytes"}],"name":"redeemAndDeploy","outputs":[{"name":"homeAddress","type":"address"},{"name":"runtimeCodeHash","type":"bytes32"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"salt","type":"bytes32"}],"name":"deriveKey","outputs":[{"name":"key","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"salt","type":"bytes32"},{"name":"owner","type":"address"}],"name":"deriveKeyAndLock","outputs":[{"name":"key","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"salt","type":"bytes32"},{"name":"controller","type":"address"}],"name":"deriveKeyAndAssignController","outputs":[{"name":"key","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"salt","type":"bytes32"}],"name":"deriveKeyAndRelinquishControl","outputs":[{"name":"key","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"}],"name":"setReverseLookup","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"salt","type":"bytes32"},{"name":"submitter","type":"address"}],"name":"setDerivedReverseLookup","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"codePayload","type":"bytes"}],"name":"deployRuntimeStorageContract","outputs":[{"name":"runtimeStorageContract","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"},{"name":"initializationRuntimeStorageContract","type":"address"}],"name":"deployViaExistingRuntimeStorageContract","outputs":[{"name":"homeAddress","type":"address"},{"name":"runtimeCodeHash","type":"bytes32"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"tokenId","type":"uint256"},{"name":"controller","type":"address"},{"name":"initializationRuntimeStorageContract","type":"address"}],"name":"redeemAndDeployViaExistingRuntimeStorageContract","outputs":[{"name":"homeAddress","type":"address"},{"name":"runtimeCodeHash","type":"bytes32"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"salt","type":"bytes32"},{"name":"initializationCode","type":"bytes"}],"name":"deriveKeyAndDeploy","outputs":[{"name":"homeAddress","type":"address"},{"name":"key","type":"bytes32"},{"name":"runtimeCodeHash","type":"bytes32"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"salt","type":"bytes32"},{"name":"initializationRuntimeStorageContract","type":"address"}],"name":"deriveKeyAndDeployViaExistingRuntimeStorageContract","outputs":[{"name":"homeAddress","type":"address"},{"name":"key","type":"bytes32"},{"name":"runtimeCodeHash","type":"bytes32"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"owner","type":"address"},{"name":"keys","type":"bytes32[]"}],"name":"batchLock","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"owner","type":"address"},{"name":"salts","type":"bytes32[]"}],"name":"deriveKeysAndBatchLock","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokenIds","type":"uint256[]"}],"name":"safeBatchTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokenIds","type":"uint256[]"},{"name":"data","type":"bytes"}],"name":"safeBatchTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"batchLock_63efZf","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"}],"name":"staticCreate2Check","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"}],"name":"claimHighScore","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"recipient","type":"address"}],"name":"recover","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"}],"name":"isDeployable","outputs":[{"name":"deployable","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getHighScore","outputs":[{"name":"holder","type":"address"},{"name":"score","type":"uint256"},{"name":"key","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"key","type":"bytes32"}],"name":"getHomeAddressInformation","outputs":[{"name":"homeAddress","type":"address"},{"name":"controller","type":"address"},{"name":"deploys","type":"uint256"},{"name":"currentRuntimeCodeHash","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"key","type":"bytes32"}],"name":"hasNeverBeenDeployed","outputs":[{"name":"neverBeenDeployed","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"homeAddress","type":"address"}],"name":"reverseLookup","outputs":[{"name":"key","type":"bytes32"},{"name":"salt","type":"bytes32"},{"name":"submitter","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getInitializationCodeFromContractRuntime_6CLUNS","outputs":[{"name":"initializationRuntimeStorageContract","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"salt","type":"bytes32"},{"name":"submitter","type":"address"}],"name":"getDerivedKey","outputs":[{"name":"key","type":"bytes32"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"key","type":"bytes32"}],"name":"getHomeAddress","outputs":[{"name":"homeAddress","type":"address"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"getMetamorphicDelegatorInitializationCode","outputs":[{"name":"metamorphicDelegatorInitializationCode","type":"bytes32"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"getMetamorphicDelegatorInitializationCodeHash","outputs":[{"name":"metamorphicDelegatorInitializationCodeHash","type":"bytes32"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"getArbitraryRuntimeCodePrelude","outputs":[{"name":"prelude","type":"bytes11"}],"payable":false,"stateMutability":"pure","type":"function"}]
```

To run tests locally, start the testRPC, trigger the tests, run the linter, and tear down the testRPC *(you can do all of this at once via* `yarn all` *if you prefer)*:
```sh
$ yarn start
$ yarn test
$ yarn lint
$ yarn stop
```

You can also run code coverage if you like:
```sh
$ yarn coverage
```

## API

**This documentation is incomplete - see the [HomeWork interface](https://github.com/0age/HomeWork/blob/master/interfaces/IHomeWork.sol), other interfaces, and the contract itself for a more complete summary.**

```Solidity
interface IHomeWork {
  event NewResident(address indexed homeAddress, bytes32 key, bytes32 runtimeCodeHash);
  event NewRuntimeStorageContract(address runtimeStorageContract, bytes32 runtimeCodeHash);
  event NewController(bytes32 indexed key, address newController);
  event NewHighScore(bytes32 key, address submitter, uint256 score);

  function deploy(bytes32 key, bytes calldata initializationCode) external payable returns (address homeAddress, bytes32 runtimeCodeHash);
  function lock(bytes32 key, address owner) external;
  function redeem(uint256 tokenId, address controller) external;
  function assignController(bytes32 key, address controller) external;
  function relinquishControl(bytes32 key) external;
  function redeemAndDeploy(uint256 tokenId, address controller, bytes calldata initializationCode) external payable returns (address homeAddress, bytes32 runtimeCodeHash);
  function deriveKey(bytes32 salt) external returns (bytes32 key);
  function deriveKeyAndLock(bytes32 salt, address owner) external returns (bytes32 key);
  function deriveKeyAndAssignController(bytes32 salt, address controller) external returns (bytes32 key);
  function deriveKeyAndRelinquishControl(bytes32 salt) external returns (bytes32 key);
  function setReverseLookup(bytes32 key) external;
  function setDerivedReverseLookup(bytes32 salt, address submitter) external;
  function deployRuntimeStorageContract(bytes calldata codePayload) external returns (address runtimeStorageContract);
  function deployViaExistingRuntimeStorageContract(bytes32 key, address initializationRuntimeStorageContract) external payable returns (address homeAddress, bytes32 runtimeCodeHash);
  function redeemAndDeployViaExistingRuntimeStorageContract(uint256 tokenId, address controller, address initializationRuntimeStorageContract) external payable returns (address homeAddress, bytes32 runtimeCodeHash);
  function deriveKeyAndDeploy(bytes32 salt, bytes calldata initializationCode) external payable returns (address homeAddress, bytes32 key, bytes32 runtimeCodeHash);
  function deriveKeyAndDeployViaExistingRuntimeStorageContract(bytes32 salt, address initializationRuntimeStorageContract) external payable returns (address homeAddress, bytes32 key, bytes32 runtimeCodeHash);
  function batchLock(address owner, bytes32[] calldata keys) external;
  function deriveKeysAndBatchLock(address owner, bytes32[] calldata salts) external;
  function batchLock_63efZf(/* packed owner and key segments */) external;
  function claimHighScore(bytes32 key) external;
  function recover(address token, address payable recipient) external;
  
  function isDeployable(bytes32 key) external /* view */ returns (bool);
  function getHighScore() external view returns (address holder, uint256 score, bytes32 key);
  function getHomeAddressInformation(bytes32 key) external view returns (address homeAddress, address controller, uint256 deploys, bytes32 currentRuntimeCodeHash);
  function hasNeverBeenDeployed(bytes32 key) external view returns (bool);
  function reverseLookup(address homeAddress) external view returns (bytes32 key, bytes32 salt, address submitter);

  function getDerivedKey(bytes32 salt, address submitter) external pure returns (bytes32);
  function getHomeAddress(bytes32 key) external pure returns (address);
  function getMetamorphicDelegatorInitializationCode() external pure returns (bytes32);
  function getMetamorphicDelegatorInitializationCodeHash() external pure returns (bytes32);
  function getArbitraryRuntimeCodePrelude() external pure returns (bytes11);
}

interface IERC721 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);

    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address operator);
    function setApprovalForAll(address operator, bool _approved) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);

    function transferFrom(address from, address to, uint256 tokenId) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
}
```

## Maintainers

[@0age](https://github.com/0age)

## Contribute

PRs accepted gladly - make sure the tests and linters pass. *(Changes to the contracts themselves should bump the version number and be marked as pre-release.)*

## License

MIT © 2019 0age
