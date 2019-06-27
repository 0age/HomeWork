![HomeWork 🏠🛠️](https://raw.github.com/0age/HomeWork/master/images/HomeWork.svg?sanitize=true)

# HomeWork

![GitHub](https://img.shields.io/github/license/0age/HomeWork.svg?colorB=brightgreen)
[![Build Status](https://travis-ci.org/0age/HomeWork.svg?branch=master)](https://travis-ci.org/0age/HomeWork)
[![Coverage](https://coveralls.io/repos/github/0age/HomeWork/badge.svg?branch=master)](https://coveralls.io/github/0age/HomeWork?branch=master)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

> HomeWork is an autonomous utility for finding, sharing and reusing home addresses for contracts.

A **home address** is a dedicated account where a specific controller can deploy arbitrary contracts. Unlike a standard contract deployment, where the deployment address is determined by rigid factors like the nonce of the deployer or the contract's creation code, home address contract deployments relax the usual constraints and allow *any* contract to be deployed to a specific address.

Each home address is uniquely identified by a specific 32-byte **key**. Each key has a dedicated controller, an account with the exclusive right to deploy contracts to the corresponding home address. By default, each key is initially controlled by the account whose address matches the first twenty bytes of said key. Alternately, they can be derived using a full 32-byte salt for any submitting account. Control of keys can easily be transferred, either to other accounts and contracts, or to HomeWork itself by locking the home address and minting an NFT.

HomeWork implements **ERC721**, and will take control of any home address without a deployed contract in exchange for a corresponding NFT. The owner of the NFT can then redeem it in order to gain control over deployment to the designated home address. There's no external issuer or anything, so each token must first be discovered and claimed by a valid submitter.

**DISCLAIMER: this implements highly experimental features / bugs - Be careful! These contracts have not yet been fully tested or audited - proceed with caution and please share any exploits or optimizations you discover.**

You can find HomeWork at `0x0000000000001b84b1cb32787B0D64758d019317` *(yes, there are six zero bytes at the start)* on [mainnet](https://etherscan.io/address/0x0000000000001b84b1cb32787b0d64758d019317), [ropsten](https://ropsten.etherscan.io/address/0x0000000000001b84b1cb32787b0d64758d019317), [goerli](https://goerli.etherscan.io/address/0x0000000000001b84b1cb32787b0d64758d019317), [rinkeby](https://rinkeby.etherscan.io/address/0x0000000000001b84b1cb32787b0d64758d019317), and [kovan](https://kovan.etherscan.io/address/0x0000000000001b84b1cb32787b0d64758d019317) - contract verification is, uh, *challenging*, but you can verify it by checking out the [deployment contract](https://etherscan.io/address/0x07cf8f81852a58dd26fa19e69545f72e263347e5#contracts), including the contract creation code from the deployment's [runtime storage contract](0x000000000071C1c84915c17BF21728BfE4Dac3f3).

To learn more about HomeWork, check out [this article](https://medium.com/@0age/on-efficient-ethereum-transactions-introducing-homework-6ae4f21801ed).

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [How It Works](#how-it-works)
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
0x0000000000001b84b1cb32787B0D64758d019317
```

ABI (basic):
```
[{"constant":true,"inputs":[{"name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"homeAddress","type":"address"},{"indexed":false,"name":"key","type":"bytes32"},{"indexed":false,"name":"runtimeCodeHash","type":"bytes32"}],"name":"NewResident","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"runtimeStorageContract","type":"address"},{"indexed":false,"name":"runtimeCodeHash","type":"bytes32"}],"name":"NewRuntimeStorageContract","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"key","type":"bytes32"},{"indexed":false,"name":"newController","type":"address"}],"name":"NewController","type":"event"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"},{"name":"initializationCode","type":"bytes"}],"name":"deploy","outputs":[{"name":"homeAddress","type":"address"},{"name":"runtimeCodeHash","type":"bytes32"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"},{"name":"owner","type":"address"}],"name":"lock","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"tokenId","type":"uint256"},{"name":"controller","type":"address"}],"name":"redeem","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"},{"name":"controller","type":"address"}],"name":"assignController","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"tokenId","type":"uint256"},{"name":"controller","type":"address"},{"name":"initializationCode","type":"bytes"}],"name":"redeemAndDeploy","outputs":[{"name":"homeAddress","type":"address"},{"name":"runtimeCodeHash","type":"bytes32"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"salt","type":"bytes32"}],"name":"deriveKey","outputs":[{"name":"key","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"}],"name":"setReverseLookup","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"}],"name":"staticCreate2Check","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"}],"name":"isDeployable","outputs":[{"name":"deployable","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"key","type":"bytes32"}],"name":"getHomeAddressInformation","outputs":[{"name":"homeAddress","type":"address"},{"name":"controller","type":"address"},{"name":"deploys","type":"uint256"},{"name":"currentRuntimeCodeHash","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"key","type":"bytes32"}],"name":"hasNeverBeenDeployed","outputs":[{"name":"neverBeenDeployed","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"homeAddress","type":"address"}],"name":"reverseLookup","outputs":[{"name":"key","type":"bytes32"},{"name":"salt","type":"bytes32"},{"name":"submitter","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"salt","type":"bytes32"},{"name":"submitter","type":"address"}],"name":"getDerivedKey","outputs":[{"name":"key","type":"bytes32"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"key","type":"bytes32"}],"name":"getHomeAddress","outputs":[{"name":"homeAddress","type":"address"}],"payable":false,"stateMutability":"pure","type":"function"}]
```

ABI (full):
```
[{"constant":true,"inputs":[{"name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":true,"name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"approved","type":"address"},{"indexed":true,"name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"operator","type":"address"},{"indexed":false,"name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"homeAddress","type":"address"},{"indexed":false,"name":"key","type":"bytes32"},{"indexed":false,"name":"runtimeCodeHash","type":"bytes32"}],"name":"NewResident","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"runtimeStorageContract","type":"address"},{"indexed":false,"name":"runtimeCodeHash","type":"bytes32"}],"name":"NewRuntimeStorageContract","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"key","type":"bytes32"},{"indexed":false,"name":"newController","type":"address"}],"name":"NewController","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"key","type":"bytes32"},{"indexed":false,"name":"submitter","type":"address"},{"indexed":false,"name":"score","type":"uint256"}],"name":"NewHighScore","type":"event"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"},{"name":"initializationCode","type":"bytes"}],"name":"deploy","outputs":[{"name":"homeAddress","type":"address"},{"name":"runtimeCodeHash","type":"bytes32"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"},{"name":"owner","type":"address"}],"name":"lock","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"tokenId","type":"uint256"},{"name":"controller","type":"address"}],"name":"redeem","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"},{"name":"controller","type":"address"}],"name":"assignController","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"}],"name":"relinquishControl","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"tokenId","type":"uint256"},{"name":"controller","type":"address"},{"name":"initializationCode","type":"bytes"}],"name":"redeemAndDeploy","outputs":[{"name":"homeAddress","type":"address"},{"name":"runtimeCodeHash","type":"bytes32"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"salt","type":"bytes32"}],"name":"deriveKey","outputs":[{"name":"key","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"salt","type":"bytes32"},{"name":"owner","type":"address"}],"name":"deriveKeyAndLock","outputs":[{"name":"key","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"salt","type":"bytes32"},{"name":"controller","type":"address"}],"name":"deriveKeyAndAssignController","outputs":[{"name":"key","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"salt","type":"bytes32"}],"name":"deriveKeyAndRelinquishControl","outputs":[{"name":"key","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"}],"name":"setReverseLookup","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"salt","type":"bytes32"},{"name":"submitter","type":"address"}],"name":"setDerivedReverseLookup","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"codePayload","type":"bytes"}],"name":"deployRuntimeStorageContract","outputs":[{"name":"runtimeStorageContract","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"},{"name":"initializationRuntimeStorageContract","type":"address"}],"name":"deployViaExistingRuntimeStorageContract","outputs":[{"name":"homeAddress","type":"address"},{"name":"runtimeCodeHash","type":"bytes32"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"tokenId","type":"uint256"},{"name":"controller","type":"address"},{"name":"initializationRuntimeStorageContract","type":"address"}],"name":"redeemAndDeployViaExistingRuntimeStorageContract","outputs":[{"name":"homeAddress","type":"address"},{"name":"runtimeCodeHash","type":"bytes32"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"salt","type":"bytes32"},{"name":"initializationCode","type":"bytes"}],"name":"deriveKeyAndDeploy","outputs":[{"name":"homeAddress","type":"address"},{"name":"key","type":"bytes32"},{"name":"runtimeCodeHash","type":"bytes32"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"salt","type":"bytes32"},{"name":"initializationRuntimeStorageContract","type":"address"}],"name":"deriveKeyAndDeployViaExistingRuntimeStorageContract","outputs":[{"name":"homeAddress","type":"address"},{"name":"key","type":"bytes32"},{"name":"runtimeCodeHash","type":"bytes32"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"owner","type":"address"},{"name":"keys","type":"bytes32[]"}],"name":"batchLock","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"owner","type":"address"},{"name":"salts","type":"bytes32[]"}],"name":"deriveKeysAndBatchLock","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokenIds","type":"uint256[]"}],"name":"safeBatchTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokenIds","type":"uint256[]"},{"name":"data","type":"bytes"}],"name":"safeBatchTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"batchLock_63efZf","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"}],"name":"staticCreate2Check","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"}],"name":"claimHighScore","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"recipient","type":"address"}],"name":"recover","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes32"}],"name":"isDeployable","outputs":[{"name":"deployable","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getHighScore","outputs":[{"name":"holder","type":"address"},{"name":"score","type":"uint256"},{"name":"key","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"key","type":"bytes32"}],"name":"getHomeAddressInformation","outputs":[{"name":"homeAddress","type":"address"},{"name":"controller","type":"address"},{"name":"deploys","type":"uint256"},{"name":"currentRuntimeCodeHash","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"key","type":"bytes32"}],"name":"hasNeverBeenDeployed","outputs":[{"name":"neverBeenDeployed","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"homeAddress","type":"address"}],"name":"reverseLookup","outputs":[{"name":"key","type":"bytes32"},{"name":"salt","type":"bytes32"},{"name":"submitter","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getInitializationCodeFromContractRuntime_6CLUNS","outputs":[{"name":"initializationRuntimeStorageContract","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"salt","type":"bytes32"},{"name":"submitter","type":"address"}],"name":"getDerivedKey","outputs":[{"name":"key","type":"bytes32"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"key","type":"bytes32"}],"name":"getHomeAddress","outputs":[{"name":"homeAddress","type":"address"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"getMetamorphicDelegatorInitializationCode","outputs":[{"name":"metamorphicDelegatorInitializationCode","type":"bytes32"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"getMetamorphicDelegatorInitializationCodeHash","outputs":[{"name":"metamorphicDelegatorInitializationCodeHash","type":"bytes32"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"getArbitraryRuntimeCodePrelude","outputs":[{"name":"prelude","type":"bytes11"}],"payable":false,"stateMutability":"pure","type":"function"}]
```

To try it out, start by deploying a contract by choosing an account to submit from, picking a home key with the first twenty bytes set to that account address, and calling `deploy` with the key and your contract’s creation code (including ABI-encoded constructor arguments, of course). Alternately, you can call `lock` to give control to HomeWork and mint an NFT, and `redeem` or `redeemAndDeploy` to burn it and take control back.

Two big caveats to be aware of:
- `msg.sender` will refer to HomeWork, not to the submitter - you can still get at the submitter by calling into HomeWork *(easiest if you set a reverse lookup for the home address first)*, or you can just include it as a constructor arg.
- you won’t be able to deploy any contract to a home address that already has a contract deployed. If you deploy a contract that can’t be removed via `SELFDESTRUCT`, HomeWork’s job is done and it will not be able to interact with that home address anymore. *(Well, state rent might change that...)*

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
#### Summary
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

> *Note: ERC721 and related interfaces not included as part of this documentation.*

#### Standard Keys
* [`deploy`](#deploy)
* [`assignController`](#assigncontroller)
* [`relinquishControl`](#relinquishcontrol)
* [`setReverseLookup`](#setreverselookup)

#### Derived Keys
* [`deriveKey`](#derivekey)
* [`deriveKeyAndDeploy`](#derivekeyanddeploy)
* [`deriveKeyAndAssignController`](#derivekeyandassigncontroller)
* [`deriveKeyAndRelinquishControl`](#derivekeyandrelinquishcontrol)
* [`setDerivedReverseLookup`](#setderivedreverselookup)

#### Home Address NFTs
* [`lock`](#lock)
* [`redeem`](#redeem)
* [`redeemAndDeploy`](#redeemanddeploy)
* [`deriveKeyAndLock`](#derivekeyandlock)
* [`batchLock`](#batchlock)
* [`deriveKeysAndBatchLock`](#derivekeysandbatchlock)

#### View Functions
* [`isDeployable`](#isdeployable)
* [`getHighScore`](#gethighscore)
* [`getHomeAddressInformation`](#gethomeaddressinformation)
* [`hasNeverBeenDeployed`](#hasneverbeendeployed)
* [`reverseLookup`](#reverselookup)

#### Pure Functions
* [`getDerivedKey`](#getderivedkey)
* [`getHomeAddress`](#gethomeaddress)
* [`getMetamorphicDelegatorInitializationCode`](#getmetamorphicdelegatorinitializationcode)
* [`getMetamorphicDelegatorInitializationCodeHash`](#getmetamorphicdelegatorinitializationcodehash)
* [`getArbitraryRuntimeCodePrelude`](#getarbitraryruntimecodeprelude)

#### Events
* [`event NewResident`](#newresident-event)
* [`event NewRuntimeStorageContract`](#newruntimestoragecontract-event)
* [`event NewController`](#newcontroller-event)
* [`event NewHighScore`](#newhighscore-event)

### Advanced Usage
* [`deployRuntimeStorageContract`](#deployruntimestoragecontract)
* [`deployViaExistingRuntimeStorageContract`](#deployviaexistingruntimestoragecontract)
* [`deriveKeyAndDeployViaExistingRuntimeStorageContract`](#derivekeyanddeployviaexistingruntimestoragecontract)
* [`redeemAndDeployViaExistingRuntimeStorageContract`](#redeemanddeployviaexistingruntimestoragecontract)
* [`batchLock_63efZf`](#batchlock_63efzf)
* [`claimHighScore`](#claimhighscore)
* [`recover`](#recover)

### deploy
---
```Solidity
function deploy(bytes32 key, bytes calldata initializationCode)
  external
  payable
  returns (address homeAddress, bytes32 runtimeCodeHash);
```
Deploy a new contract with the supplied initialization code and `msg.value` to the home address corresponding to a given key. Two conditions must be met:
* the submitter must be designated as the controller of the home address *(with the initial controller set to the address corresponding to the first twenty bytes of the key)*, and
* there must not be a contract currently deployed at the home address.

These conditions can be checked by calling `getHomeAddressInformation` and `isDeployable` with the same key.

##### parameters:
| | | |
|-|-|-|
| *bytes32* | key | The unique value used to derive the home address. |
| *bytes* | initializationCode | The contract creation code that will be used to deploy the contract to the home address. |

##### returns:
| | | |
|-|-|-|
| *address* | homeAddress | The home address of the deployed contract. |
| *bytes32* | runtimeCodeHash | The runtime code hash of the deployed contract. |

> In order to deploy the contract to the home address, a new contract will be deployed with runtime code set to the initialization code of the contract that will be deployed to the home address. Then, metamorphic initialization code will retrieve that initialization code and use it to set up and deploy the desired contract to the home address.
> 
> Bear in mind that the deployed contract will interpret msg.sender as the address of THIS contract, and not the address of the submitter - if the constructor of the deployed contract uses msg.sender to set up ownership or other variables, you must modify it to accept a constructor argument with the appropriate address, or alternately to hard-code the intended address. 
> 
> Also, if your contract DOES have constructor arguments, remember to include them as ABI-encoded arguments at the end of the initialization code, just as you would when performing a standard deploy.
> 
> You may also want to provide the key to `setReverseLookup` in order to find it again using only the home address to prevent accidentally losing the key.

### lock
---
```Solidity
function lock(bytes32 key, address owner) external;
```
Mint an ERC721 token to the supplied owner that can be redeemed in order to gain control of a home address corresponding to a given key. Two conditions must be met:
* the submitter must be designated as the controller of the home address *(with the initial controller set to the address corresponding to the first twenty bytes of the key)*, and
* there must not be a contract currently deployed at the home address.

These conditions can be checked by calling `getHomeAddressInformation` and `isDeployable` with the same key.

##### parameters:
| | | |
|-|-|-|
| *bytes32* | key | The unique value used to derive the home address. |
| *address* | owner | The account that will be granted ownership of the ERC721 token. |

> In order to mint an ERC721 token, the assocated home address cannot be in use, or else the token will not be able to deploy to the home address. The controller is set to this contract until the token is redeemed and burned, at which point the redeemer designates a new controller for the home address.
> 
> The key of the home address and the tokenId of the ERC721 token are the same value, but different types *(bytes32 vs. uint256)*.

### redeem
---
```Solidity
function redeem(uint256 tokenId, address controller) external;
```
Burn an ERC721 NFT to allow the supplied controller to gain the ability to deploy to the home address corresponding to the key matching the burned token. The submitter must be designated as either the owner of the NFT or as an approved spender.

##### parameters:
| | | |
|-|-|-|
| *uint256* | tokenId | The ID of the ERC721 NFT to redeem. |
| *address* | controller | The account that will be granted control of the home address corresponding to the given NFT. |

> The controller cannot be designated as the address of this contract, the null address, or the home address *(the restriction on setting the home address as the controller is due to the fact that the home address will not be able to deploy to itself, as it needs to be empty before a contract can be deployed to it)*.

### assignController
---
```Solidity
function assignController(bytes32 key, address controller) external;
```
Transfer control over deployment to the home address corresponding to a given key. The caller must be designated as the current controller of the home address *(with the initial controller set to the address corresponding to the first 20 bytes of the key)* - This condition can be checked by calling `getHomeAddressInformation` with the same key.

##### parameters:
| | | |
|-|-|-|
| *bytes32* | key | The unique value used to derive the home address. |
| *address* | controller | The account that will be granted control of the home address corresponding to the given key. |

> The controller cannot be designated as the address of this contract, the null address, or the home address *(the restriction on setting the home address as the controller is due to the fact that the home address will not be able to deploy to itself, as it needs to be empty before a contract can be deployed to it)*.

### relinquishControl
---
```Solidity
function relinquishControl(bytes32 key) external;
```
Transfer control over deployment to the home address corresponding to a given key to the null address, which will prevent it from being deployed to again in the future. The caller must be designated as the current controller of the corresponding home address *(with the initial controller set to the address corresponding to the first 20 bytes of the key)* - This condition can be checked by calling `getHomeAddressInformation` with the same key.

##### parameters:
| | | |
|-|-|-|
| *bytes32* | key | The unique value used to derive the home address. |

### redeemAndDeploy
---
```Solidity
function redeemAndDeploy(
  uint256 tokenId,
  address controller,
  bytes calldata initializationCode
)
  external
  payable
  returns (address homeAddress, bytes32 runtimeCodeHash);
```
Burn an ERC721 token, set a supplied controller, and deploy a new contract with the supplied initialization code and `msg.value` to the corresponding home address for the given token.  Two conditions must be met:
* The submitter must be designated as either the owner of the token or as an approved spender, and
* there must not be a contract currently deployed at the home address.

These conditions can be checked by calling either `ownerOf` or `getApproved` for the `tokenId` *(or* `isApprovedForAll` *for the owner of the token and the caller)*, and `isDeployable` with the `bytes32` representation of the `tokenId`.

##### parameters:
| | | |
|-|-|-|
| *uint256* | tokenId | The ID of the ERC721 NFT to redeem. |
| *address* | controller | The account that will be granted control of the home address corresponding to the given NFT. |
| *bytes* | initializationCode | The contract creation code that will be used to deploy the contract to the home address. |

##### returns:
| | | |
|-|-|-|
| *address* | homeAddress | The home address of the deployed contract. |
| *bytes32* | runtimeCodeHash | The runtime code hash of the deployed contract. |

> In order to deploy the contract to the home address, a new contract will be deployed with runtime code set to the initialization code of the contract that will be deployed to the home address. Then, metamorphic initialization code will retrieve that initialization code and use it to set up and deploy the desired contract to the home address.
> 
> Bear in mind that the deployed contract will interpret msg.sender as the address of THIS contract, and not the address of the submitter - if the constructor of the deployed contract uses msg.sender to set up ownership or other variables, you must modify it to accept a constructor argument with the appropriate address, or alternately to hard-code the intended address. 
> 
> Also, if your contract DOES have constructor arguments, remember to include them as ABI-encoded arguments at the end of the initialization code, just as you would when performing a standard deploy. You may also want to provide the key to `setReverseLookup` in order to find it again using only the home address to prevent accidentally losing the key.
> 
> The controller cannot be designated as the address of this contract, the null address, or the home address (the restriction on setting the home address as the controller is due to the fact that the home address will not be able to deploy to itself, as it needs to be empty before a contract can be deployed to it).
> 
> Also, checks on the contract at the home address being empty or not having the correct controller are unnecessary, as they are performed when minting the token and cannot be altered until the token is redeemed.

### deriveKey
---
```Solidity
function deriveKey(bytes32 salt) external returns (bytes32 key);
```
Derive a new key by concatenating an arbitrary 32-byte salt value and the address of the caller and performing a keccak256 hash. This allows for the creation of keys with additional entropy where desired while also preventing collisions with standard keys. The caller will be set as the controller of the derived key *(unless the key already exists, in which case no action will be taken)*.

##### parameters:
| | | |
|-|-|-|
| *bytes32* | salt | The desired salt value to use *(along with the address of the caller)* when deriving the resultant key and corresponding home address. |

##### returns:
| | | |
|-|-|-|
| *bytes32* | key | The derived key. |

> Home addresses from derived keys will take longer to "mine" or locate, as an additional hash must be performed when computing the corresponding home address for each given salt input. Each caller will derive a different key, even if they are supplying the same salt value.

### deriveKeyAndLock
---
```Solidity
function deriveKeyAndLock(bytes32 salt, address owner)
  external
  returns (bytes32 key);
```
Mint an ERC721 token to the supplied owner that can be redeemed in order to gain control of a home address corresponding to a given derived key. Two conditions must be met:
* the submitter must be designated as the controller of the home address corresponding to the derived key, and
* there must not be a contract currently deployed at the home address.

These conditions can be checked by calling `getHomeAddressInformation` and `isDeployable` with the key determined by calling `getDerivedKey`.

##### parameters:
| | | |
|-|-|-|
| *bytes32* | salt | The desired salt value to use *(along with the address of the caller)* when deriving the resultant key and corresponding home address. |
| *address* | owner | The account that will be granted ownership of the ERC721 token. |

##### returns:
| | | |
|-|-|-|
| *bytes32* | key | The derived key. |

> In order to mint an ERC721 token, the assocated home address cannot be in use, or else the token will not be able to deploy to the home address. The controller is set to this contract until the token is redeemed, at which point the redeemer designates a new controller for the home address.
> 
> The key of the home address and the tokenId of the ERC721 token are the same value, but different types *(bytes32 vs. uint256)*.

### deriveKeyAndAssignController
---
```Solidity
function deriveKeyAndAssignController(bytes32 salt, address controller)
  external
  returns (bytes32 key);
```
Transfer control over deployment to the home address corresponding to a given derived key. The caller must be designated as the current controller of the home address - This condition can be checked by calling `getHomeAddressInformation` with the key obtained via `getDerivedKey`.

##### parameters:
| | | |
|-|-|-|
| *bytes32* | salt | The desired salt value to use *(along with the address of the caller)* when deriving the resultant key and corresponding home address. |
| *address* | controller | The account that will be granted control of the home address corresponding to the given derived key.

##### returns:
| | | |
|-|-|-|
| *bytes32* | key | The derived key. |

> The controller cannot be designated as the address of this contract, the null address, or the home address *(the restriction on setting the home address as the controller is due to the fact that the home address will not be able to deploy to itself, as it needs to be empty before a contract can be deployed to it)*.

### deriveKeyAndRelinquishControl
---
```Solidity
function deriveKeyAndRelinquishControl(bytes32 salt)
  external
  returns (bytes32 key);
```
Transfer control over deployment to the home address corresponding to a given derived key to the null address, which will prevent it from being deployed to again in the future. The caller must be designated as the current controller of the home address - This condition can be checked by calling `getHomeAddressInformation` with the key determined by calling `getDerivedKey`.

##### parameters:
| | | |
|-|-|-|
| *bytes32* | salt | The desired salt value to use *(along with the address of the caller)* when deriving the resultant key and corresponding home address. |

##### returns:
| | | |
|-|-|-|
| *bytes32* | key | The derived key. |

### setReverseLookup
---
```Solidity
function setReverseLookup(bytes32 key) external;
```
Record a key that corresponds to a given home address by supplying said key and using it to derive the address. This enables reverse lookup of a key using only the home address in question.

This method may be called by anyone - control of the key is not required.

##### parameters:
| | | |
|-|-|-|
| *bytes32* | key | The unique value used to derive the home address. |

> This does not set the salt or submitter fields, as those apply only to derived keys *(although a derived key may also be set with this method, just without the derived fields)*.

### setDerivedReverseLookup
---
```Solidity
function setDerivedReverseLookup(bytes32 salt, address submitter) external;
```
@notice Record the derived key that corresponds to a given home address by supplying the salt and submitter that were used to derive the key. This facititates reverse lookup of the derivation method of a key using only the home address in question. 

This method may be called by anyone - control of the derived key is not required.

##### parameters:
| | | |
|-|-|-|
| *bytes32* | salt | The desired salt value to use *(along with the address of the caller)* when deriving the resultant key and corresponding home address. |
| *address* | submitter | The account that can submit the salt that is used to derive the key. |

### deployRuntimeStorageContract
---
```Solidity
function deployRuntimeStorageContract(bytes calldata codePayload)
  external
  returns (address runtimeStorageContract);
```
Deploy a new storage contract with the supplied code as runtime code without deploying a contract to a home address. This can be used to store the contract creation code for use in future deployments of contracts to home addresses.

##### parameters:
| | | |
|-|-|-|
| *bytes* | codePayload | The code to set as the runtime code of the deployed contract. |

##### returns:
| | | |
|-|-|-|
| *address* | runtimeStorageContract | The address of the deployed runtime storage contract. |

> If you plan on reusing the runtime storage contract, consider placing adequate protections on it to prevent unwanted callers from modifying or destroying it. 
> 
> Also, if you are placing contract contract creation code into the runtime storage contract, remember to include any constructor parameters as ABI-encoded arguments at the end of the contract creation code, similar to how you would perform a standard deployment.

### deployViaExistingRuntimeStorageContract
---
```Solidity
function deployViaExistingRuntimeStorageContract(
  bytes32 key,
  address initializationRuntimeStorageContract
)
  external
  payable
  returns (address homeAddress, bytes32 runtimeCodeHash);
```
Deploy a new contract, with the supplied `msg.value` and the initialization code stored in the runtime code at the specified initialization runtime storage contract, to the home address corresponding to a given key. Two conditions must be met:
* the submitter must be designated as the controller of the home address *(with the initial controller set to the address corresponding to the first twenty bytes of the key)*, and
* there must not be a contract currently deployed at the home address.

These conditions can be checked by calling `getHomeAddressInformation` and `isDeployable` with the same key.

##### parameters:
| | | |
|-|-|-|
| *bytes32* | key | The unique value used to derive the home address. |
| *address* | initializationRuntimeStorageContract | The storage contract with runtime code equal to the contract creation code that will be used to deploy the contract to the home address. |

##### returns:
| | | |
|-|-|-|
| *address* | homeAddress | The home address of the deployed contract. |
| *bytes32* | runtimeCodeHash | The runtime code hash of the deployed contract. |

> When deploying a contract to a home address via this method, the metamorphic initialization code will retrieve whatever initialization code currently resides at the specified address and use it to set up and deploy the desired contract to the home address.
> 
> Bear in mind that the deployed contract will interpret `msg.sender` as the address of THIS contract, and not the address of the submitter - if the constructor of the deployed contract uses `msg.sender` to set up ownership or other variables, you must modify it to accept a constructor argument with the appropriate address, or alternately to hard-code the intended address. 
> 
> Also, if your contract DOES have constructor arguments, remember to include them as ABI-encoded arguments at the end of the initialization code, just as you would when performing a standard deploy.
> 
> You may also want to provide the key to `setReverseLookup` in order to find it again using only the home address to prevent accidentally losing the key.

### redeemAndDeployViaExistingRuntimeStorageContract
---
```Solidity
function redeemAndDeployViaExistingRuntimeStorageContract(
  uint256 tokenId,
  address controller,
  address initializationRuntimeStorageContract
)
  external
  payable
  returns (address homeAddress, bytes32 runtimeCodeHash);
```
Burn an ERC721 token, set a supplied controller, and deploy a new contract, with the supplied `msg.value` and the initialization code stored in the runtime code at the specified initialization runtime storage contract, to the home address corresponding to a given key. Two conditions must be met:
* The submitter must be designated as either the owner of the token or as an approved spender, and
* there must not be a contract currently deployed at the home address.

These conditions can be checked by calling either `ownerOf` or `getApproved` for the `tokenId` *(or* `isApprovedForAll` *for the owner of the token and the caller)*, and `isDeployable` with the `bytes32` representation of the `tokenId`.

##### parameters:
| | | |
|-|-|-|
| *uint256* | tokenId | The ID of the ERC721 NFT to redeem. |
| *address* | controller | The account that will be granted control of the home address corresponding to the given NFT. |
| *address* | initializationRuntimeStorageContract | The storage contract with runtime code equal to the contract creation code that will be used to deploy the contract to the home address. |

##### returns:
| | | |
|-|-|-|
| *address* | homeAddress | The home address of the deployed contract. |
| *bytes32* | runtimeCodeHash | The runtime code hash of the deployed contract. |

> When deploying a contract to a home address via this method, the metamorphic initialization code will retrieve whatever initialization code currently resides at the specified address and use it to set up and deploy the desired contract to the home address.
> 
> Bear in mind that the deployed contract will interpret `msg.sender` as the address of THIS contract, and not the address of the submitter - if the constructor of the deployed contract uses `msg.sender` to set up ownership or other variables, you must modify it to accept a constructor argument with the appropriate address, or alternately to hard-code the intended address. 
> 
> Also, if your contract DOES have constructor arguments, remember to include them as ABI-encoded arguments at the end of the initialization code, just as you would when performing a standard deploy.
> 
> You may also want to provide the key to `setReverseLookup` in order to find it again using only the home address to prevent accidentally losing the key.
> 
> The controller cannot be designated as the address of this contract, the null address, or the home address (the restriction on setting the home address as the controller is due to the fact that the home address will not be able to deploy to itself, as it needs to be empty before a contract can be deployed to it).
> 
> Also, checks on the contract at the home address being empty or not having the correct controller are unnecessary, as they are performed when minting the token and cannot be altered until the token is redeemed.

### deriveKeyAndDeploy
---
```Solidity
function deriveKeyAndDeploy(bytes32 salt, bytes calldata initializationCode)
  external
  payable
  returns (address homeAddress, bytes32 key, bytes32 runtimeCodeHash);
```
Deploy a new contract with the supplied `msg.value` and initialization code to the home address corresponding to a given derived key. Two conditions must be met:
* the submitter must be designated as the controller of the home address corresponding to the derived key, and
* there must not be a contract currently deployed at the home address.

These conditions can be checked by calling `getHomeAddressInformation` and `isDeployable` with the key determined by calling `getDerivedKey`.

##### parameters:
| | | |
|-|-|-|
| *bytes32* | salt | The desired salt value to use *(along with the address of the caller)* when deriving the resultant key and corresponding home address. |
| *bytes* | initializationCode | The contract creation code that will be used to deploy the contract to the home address. |

##### returns:
| | | |
|-|-|-|
| *address* | homeAddress | The home address of the deployed contract. |
| *bytes32* | key | The derived key. |
| *bytes32* | runtimeCodeHash | The runtime code hash of the deployed contract. |


> In order to deploy the contract to the home address, a new contract will be deployed with runtime code set to the initialization code of the contract that will be deployed to the home address. Then, metamorphic initialization code will retrieve that initialization code and use it to set up and deploy the desired contract to the home address.
> 
> Bear in mind that the deployed contract will interpret `msg.sender` as the address of THIS contract, and not the address of the submitter - if the constructor of the deployed contract uses `msg.sender` to set up ownership or other variables, you must modify it to accept a constructor argument with the appropriate address, or alternately to hard-code the intended address. 
> 
> Also, if your contract DOES have constructor arguments, remember to include them as ABI-encoded arguments at the end of the initialization code, just as you would when performing a standard deploy.
> 
> You may want to provide the salt and submitter to `setDerivedReverseLookup` in order to find the salt, submitter, and derived key using only the home address to prevent accidentally losing them.

### deriveKeyAndDeployViaExistingRuntimeStorageContract
---
```Solidity
function deriveKeyAndDeployViaExistingRuntimeStorageContract(
  bytes32 salt,
  address initializationRuntimeStorageContract
)
  external
  payable
  returns (address homeAddress, bytes32 key, bytes32 runtimeCodeHash);
```
Deploy a new contract, with the supplied `msg.value` and the initialization code stored in the runtime code at the specified initialization runtime storage contract, to the home address corresponding to a given derived key. Two conditions must be met:
* the submitter must be designated as the controller of the home address corresponding to the derived key, and
* there must not be a contract currently deployed at the home address.

These conditions can be checked by calling `getHomeAddressInformation` and `isDeployable` with the key determined by calling `getDerivedKey`.

##### parameters:
| | | |
|-|-|-|
| *bytes32* | salt | The desired salt value to use *(along with the address of the caller)* when deriving the resultant key and corresponding home address. |
| *address* | initializationRuntimeStorageContract | The storage contract with runtime code equal to the contract creation code that will be used to deploy the contract to the home address. |

##### returns:
| | | |
|-|-|-|
| *address* | homeAddress | The home address of the deployed contract. |
| *bytes32* | key | The derived key. |
| *bytes32* | runtimeCodeHash | The runtime code hash of the deployed contract. |


> When deploying a contract to a home address via this method, the metamorphic initialization code will retrieve whatever initialization code currently resides at the specified address and use it to set up and deploy the desired contract to the home address.
> 
> Bear in mind that the deployed contract will interpret `msg.sender` as the address of THIS contract, and not the address of the submitter - if the constructor of the deployed contract uses `msg.sender` to set up ownership or other variables, you must modify it to accept a constructor argument with the appropriate address, or alternately to hard-code the intended address. 
> 
> Also, if your contract DOES have constructor arguments, remember to include them as ABI-encoded arguments at the end of the initialization code, just as you would when performing a standard deploy.
> 
> You may want to provide the salt and submitter to `setDerivedReverseLookup` in order to find the salt, submitter, and derived key using only the home address to prevent accidentally losing them.

### batchLock
---
```Solidity
function batchLock(address owner, bytes32[] calldata keys) external;
```
Mint multiple ERC721 tokens, designated by their keys, to the specified owner. Keys that aren't controlled, or that point to home addresses that are currently deployed, will be skipped.

##### parameters:
| | | |
|-|-|-|
| *address* | owner | The account that will be granted ownership of the ERC721 tokens. |
| *bytes32[]* | keys | An array of unique values used to derive each home address. |

> If you plan to use this method regularly or want to keep gas costs to an absolute minimum, and are willing to go without standard ABI encoding, see `batchLock_63efZf` for a more efficient (and unforgiving) implementation.
> 
> For batch token minting with *derived* keys, see `deriveKeysAndBatchLock`.

### deriveKeysAndBatchLock
---
```Solidity
function deriveKeysAndBatchLock(address owner, bytes32[] calldata salts)
  external;
```
Mint multiple ERC721 tokens, designated by salts that are hashed with the caller's address to derive each key, to the specified owner. Derived keys that aren't controlled, or that point to home addresses that are currently deployed, will be skipped.

##### parameters:
| | | |
|-|-|-|
| *address* | owner | The account that will be granted ownership of the ERC721 tokens. |
| *bytes32[]* | salts | An array of values used to derive each key and corresponding home address. |

> See `batchLock` for batch token minting with standard, non-derived keys.

### batchLock_63efZf
---
```Solidity
function batchLock_63efZf(/* packed owner and key segments */) external;
```
Efficient version of `batchLock` that uses less gas.

The first twenty bytes of each key are automatically populated using `msg.sender`, and the remaining key segments are passed in as a packed byte array, using twelve bytes per segment.

A function selector of `0x00000000` followed by a twenty-byte segment for the desired owner of the minted ERC721 tokens, are both placed before the array of key segments.

> Note that an attempt to lock a key that is not controlled, or one with its contract already deployed, will cause the entire batch to revert.
> 
> Checks on whether the owner is a valid ERC721 receiver are also skipped, similar to using `transferFrom` instead of `safeTransferFrom`.

### claimHighScore
---
```Solidity
function claimHighScore(bytes32 key) external;
```
Submit a key to claim the "high score" - the lower the `uint160` value of the key's home address, the higher the score.

The high score holder has the exclusive right to recover lost ether and tokens on this contract.

##### parameters:
| | | |
|-|-|-|
| *bytes32* | key | The unique value used to derive the home address that will determine the resultant score. |

> The high score must be claimed by a direct key *(one that is submitted by setting the first twenty bytes of the key to the address of the submitter)* and not by a derived key, and is non-transferable.
> 
> If you want to help people recover their lost tokens, you might consider deploying a contract to the high score address *(probably a destructible one so that you can use the home address later)* with your contact information.

### recover
---
```Solidity
function recover(IERC20 token, address payable recipient) external;
```
Transfer any ether or ERC20 tokens that have somehow ended up at this contract by specifying a token address *(set to the null address for ether)* as well as a recipient address.

Only the high score holder can recover lost ether and tokens on this contract.

##### parameters:
| | | |
|-|-|-|
| *address* | token | The contract address of the ERC20 token to recover, or the null address for recovering Ether. |
| *address* | recipient | The account where recovered funds should be transferred. |

> If you are trying to recover funds that were accidentally sent into this contract, see if you can contact the holder of the current high score, found by calling `getHighScore`. Better yet, try to find a new high score yourself!

### isDeployable
---
```Solidity
function isDeployable(bytes32 key)
  external
  /* view */
  returns (bool deployable);
```
"View" function to determine if a contract can currently be deployed to a home address given the corresponding key. A contract is only deployable if no account currently exists at the address - any existing contract must be destroyed via `SELFDESTRUCT` before a new contract can be deployed to a home address.


##### parameters:
| | | |
|-|-|-|
| *bytes32* | key | The unique value used to derive the home address. |

##### returns:
| | | |
|-|-|-|
| *bool* | deployable | A boolean signifying if a contract can be deployed to the home address that corresponds to the provided key. |


@param key bytes32 The unique value used to derive the home address.
@return A boolean signifying if a contract can be deployed to the home address that corresponds to the provided key.
> This method does not modify state but is inaccessible via `STATICCALL` *(well, it actually does modify state, but only temporarily)*.
> 
> This method will not detect if a contract is not deployable due control having been relinquished on the key.

### getHighScore
---
```Solidity
function getHighScore()
  external
  view
  returns (address holder, uint256 score, bytes32 key);
```
View function to get the current "high score", or the lowest uint160 value of a home address of all keys submitted. The high score holder has the exclusive right to recover lost ether and tokens on this contract.

##### returns:
| | | |
|-|-|-|
| *address* | holder | The account that submitted the current high score. |
| *uint256* | score | The current high score. |
| *bytes32* | key | The key that was submitted to obtain the current high score. |

### getHomeAddressInformation
---
```Solidity
function getHomeAddressInformation(bytes32 key)
  external
  view
  returns (
    address homeAddress,
    address controller,
    uint256 deploys,
    bytes32 currentRuntimeCodeHash
  );
```
View function to get information on a home address given the corresponding key.

##### parameters:
| | | |
|-|-|-|
| *bytes32* | key | The unique value used to derive the home address. |

##### returns:
| | | |
|-|-|-|
| *address* | homeAddress | The home address of the supplied key. |
| *address* | controller | The current controller of deployments to the home address. |
| *uint256* | deploys | The number of times that a contract has been deployed to the home address. |
| *bytes32* | currentRuntimeCodeHash | The runtime code hash of the contract code currently at the home address *(if any)*. |

> There is also an `isDeployable` method for determining if a contract can be deployed to the address, but in extreme cases it must actually perform a dry-run to determine if the contract is deployable, which means that it does not support `STATICCALL`s.
> 
> There is also a convenience method, `hasNeverBeenDeployed`, but the information it conveys can be determined from this method alone as well.

### hasNeverBeenDeployed
---
```Solidity
function hasNeverBeenDeployed(bytes32 key)
  external
  view
  returns (bool neverBeenDeployed);
```
View function to determine if no contract has ever been deployed to a home address given the corresponding key. This can be used to ensure that a given key or corresponding token is "new" or not.

##### parameters:
| | | |
|-|-|-|
| *bytes32* | key | The unique value used to derive the home address. |

##### returns:
| | | |
|-|-|-|
| *bool* | neverBeenDeployed | A boolean signifying if a contract has never been deployed using the supplied key before. |

### reverseLookup
---
```Solidity
function reverseLookup(address homeAddress)
  external
  view
  returns (bytes32 key, bytes32 salt, address submitter);
```
View function to search for a known key, salt, and/or submitter given a supplied home address. Keys can be controlled directly by an address that matches the first 20 bytes of the key, or they can be derived from a salt and a submitter - if the key is not a derived key, the salt and submitter fields will both have a value of zero.

##### parameters:
| | | |
|-|-|-|
| *address* | homeAddress | The home address to perform a reverse lookup on. |

##### returns:
| | | |
|-|-|-|
| *bytes32* | key | The key corresponding to the supplied home address. |
| *bytes32* | salt | The salt value that is used to derive the key - always `0x0` for non-derived keys. |
| *address* | submitter | The submitter of the salt value used to derive the key - always `0x0` for non-derived keys. |


> To populate these values, call `setReverseLookup` for cases where keys are used directly or are the only value known, and `setDerivedReverseLookup` for cases where keys are derived from a known salt and submitter.
> 
> The absence of a submitter does not necessarily mean that the key is not a derived key. All it implies is that the salt and submitter were not provided. However, the *existence* of a submitter does imply that the key is a derived key *(and not a standard key)*.

### getDerivedKey
---
```Solidity
function getDerivedKey(bytes32 salt, address submitter)
  external
  pure
  returns (bytes32 key);
```
Pure function to determine the key that is derived from a given salt and submitting address.

##### parameters:
| | | |
|-|-|-|
| *bytes32* | salt | The salt value that is used to derive the key. |
| *address* | submitter | The submitter of the salt value used to derive the key. |

##### returns:
| | | |
|-|-|-|
| *bytes32* | key | The derived key. |

### getHomeAddress
---
```Solidity
function getHomeAddress(bytes32 key)
  external
  pure
  returns (address homeAddress);
```
Pure function to determine the home address that corresponds to a given key.

##### parameters:
| | | |
|-|-|-|
| *bytes32* | key | The unique value used to derive the home address. |

##### returns:
| | | |
|-|-|-|
| *address* | homeAddress | The home address of the supplied key. |

### getMetamorphicDelegatorInitializationCode
---
```Solidity
function getMetamorphicDelegatorInitializationCode()
  external
  pure
  returns (bytes32 metamorphicDelegatorInitializationCode);
```
Pure function for retrieving the metamorphic initialization code used to deploy arbitrary contracts to home addresses. Provided for easy verification and for use in other applications.

##### returns:
| | | |
|-|-|-|
| *bytes32* | metamorphicDelegatorInitializationCode | The 32-byte metamorphic initialization code. |

> This metamorphic init code works via the "metamorphic delegator" mechanism, which is explained in greater detail in the "How It Works" section.

### getMetamorphicDelegatorInitializationCodeHash
---
```Solidity
function getMetamorphicDelegatorInitializationCodeHash()
  external
  pure
  returns (bytes32 metamorphicDelegatorInitializationCodeHash);
```
Pure function for retrieving the keccak256 of the metamorphic initialization code used to deploy arbitrary contracts to home addresses. This is the value that you should use, along with this contract's address and a caller address that you control, to mine for an partucular type of home address *(such as one at a compact or gas-efficient address)*.

##### returns:
| | | |
|-|-|-|
| *bytes32* | metamorphicDelegatorInitializationCodeHash | The keccak256 hash of the metamorphic initialization code. |

### getArbitraryRuntimeCodePrelude
---
```Solidity
function getArbitraryRuntimeCodePrelude()
  external
  pure
  returns (bytes11 prelude);
```
Pure function for retrieving the prelude that will be inserted ahead of the code payload in order to deploy a runtime storage contract.

##### returns:
| | | |
|-|-|-|
| *bytes11* | prelude | The 11-byte "arbitrary runtime" prelude. |

### NewResident event
---
```Solidity
event NewResident(
  address indexed homeAddress,
  bytes32 key,
  bytes32 runtimeCodeHash
);
```
Fires when a contract is deployed or redeployed to a given home address.

##### parameters:
| | | |
|-|-|-|
| *address* | homeAddress | The home address of the deployed contract. |
| *bytes32* | key | The key corresponding to the home address. |
| *bytes32* | runtimeCodeHash | The runtime code hash of the deployed contract. |

### NewRuntimeStorageContract event
---
```Solidity
event NewRuntimeStorageContract(
  address runtimeStorageContract,
  bytes32 runtimeCodeHash
);
```
Fires when a new runtime storage contract is deployed.

##### parameters:
| | | |
|-|-|-|
| *address* | runtimeStorageContract | The address of the deployed runtime storage contract. |
| *bytes32* | runtimeCodeHash | The runtime code hash of the deployed contract. |

### NewController event
---
```Solidity
event NewController(bytes32 indexed key, address newController);
```
Fires when a controller is changed from the default controller.

##### parameters:
| | | |
|-|-|-|
| *bytes32* | key | The key for which control has been reassigned. |
| *address* | controller | The account that has been granted control of the given key. |

### NewHighScore event
---
```Solidity
event NewHighScore(bytes32 key, address submitter, uint256 score);
```
Fires when a new high score is submitted.

##### parameters:
| | | |
|-|-|-|
| *bytes32* | key | The key that was submitted to obtain the current high score. |
| *address* | holder | The account that submitted the current high score. |
| *uint256* | score | The current high score. |


## How It Works
HomeWork deploys contracts using the **metamorphic delegator** pattern. The same contract creation bytecode is used for all deployments, but the bytecode is non-deterministic: it simply retrieves an account address from HomeWork, then performs a `DELEGATECALL` to that address and passes along the return or revert values. The contract at the retrieved address is a **runtime storage contract** that contains the creation code for the *actual* contract. Constructor logic is executed in the context of the home address, and the runtime code returned by the `DELEGATECALL` will be set as the runtime code of the home address.

The metamorphic delegator pattern confers a few key benefits over other metamorphic deployment methods:
- Constructors are fully supported *(in contrast to patterns where code is simply cloned from another account)*
- Address derivation can be performed in one hash / step *(vs. using a transient metamorphic contract, deployed via `CREATE2` that deploys the target contract via `CREATE` and `SELFDESTRUCT`s, which takes 2 steps)*
- Runtime storage contracts do not need to be deployed every time and can safely be reused *(as opposed to retrieving, deploying, and delegatecalling all in the scope of the metamorphic creation code)*

Here's the 32-byte sequence for deploying contracts:
```
0x5859385958601c335a585952fa1582838382515af43d3d93833e601e57fd5bf3

PC  OP  NAME             [STACK] + <MEMORY> + {RETURN} + *RUNTIME*
--  --  ---------------  ----------------------------------------------------
00  58  PC               [0]
01  59  MSIZE            [0, 0]
02  38  CODESIZE         [0, 0, codesize -> 32]
03  59  MSIZE            [0, 0, 32, 0]
04  58  PC               [0, 0, 32, 0, 4]
05  60  PUSH1 0x1c       [0, 0, 32, 0, 4, 28]
07  33  CALLER           [0, 0, 32, 0, 4, 28, caller]
08  5a  GAS              [0, 0, 32, 0, 4, 28, caller, gas]
09  58  PC               [0, 0, 32, 0, 4, 28, caller, gas, 9 -> selector]
10  59  MSIZE            [0, 0, 32, 0, 4, 28, caller, gas, selector, 0]
11  52  MSTORE           [0, 0, 32, 0, 4, 28, caller, gas] <selector>
12  fa  STATICCALL       [0, 0, 1 => success] <init_in_runtime_address>
13  15  ISZERO           [0, 0, 0]
14  82  DUP3             [0, 0, 0, 0]
15  83  DUP4             [0, 0, 0, 0, 0]
16  83  DUP4             [0, 0, 0, 0, 0, 0]
17  82  DUP3             [0, 0, 0, 0, 0, 0, 0]
18  51  MLOAD            [0, 0, 0, 0, 0, 0, init_in_runtime_address]
19  5a  GAS              [0, 0, 0, 0, 0, 0, init_in_runtime_address, gas]
20  f4  DELEGATECALL     [0, 0, 1 => success] {runtime_code}
21  3d  RETURNDATASIZE   [0, 0, 1 => success, size]
22  3d  RETURNDATASIZE   [0, 0, 1 => success, size, size]
23  93  SWAP4            [size, 0, 1 => success, size, 0]
24  83  DUP4             [size, 0, 1 => success, size, 0, 0]
25  3e  RETURNDATACOPY   [size, 0, 1 => success] <runtime_code_or_revert_msg>
26  60  PUSH1 0x1e       [size, 0, 1 => success, 30]
28  57  JUMPI            [size, 0]
29  fd  REVERT           [] {revert_msg}
30  5b  JUMPDEST         [size, 0]
31  f3  RETURN           [] *runtime_code*
```

Bear in mind that contract verification is much more difficult to achieve with contracts deployed, or redeployed, using *any* metamorphic method.

## Maintainers

[@0age](https://github.com/0age)

## Contribute

PRs accepted gladly - make sure the tests and linters pass. *(Changes to the contracts themselves should bump the version number and be marked as pre-release.)*

## License

MIT © 2019 0age
