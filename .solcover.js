module.exports = {
  norpc: true,
  testCommand: 'node --max-old-space-size=4096 ./scripts/test/testCoverage.js',
  compileCommand: '../node_modules/.bin/truffle compile',
  copyPackages: ['web3'],
  skipFiles: [
    'HomeWorkDeployer.sol',
    'mock/MockCodeCheck.sol',
    'mock/MockContract.sol',
    'mock/MockERC20Stub.sol',
    'mock/MockERC721Holder.sol',
    'mock/MockHomeWorkWrapper.sol',
    'mock/MockReentryPartOne.sol',
    'mock/MockReentryPartTwo.sol',
    'mock/MockRevertContract.sol',
    'openzeppelin-solidity/drafts/Counters.sol',
    'openzeppelin-solidity/introspection/ERC165.sol',
    'openzeppelin-solidity/introspection/IERC165.sol',
    'openzeppelin-solidity/math/SafeMath.sol',
    'openzeppelin-solidity/token/ERC20/IERC20.sol',
    'openzeppelin-solidity/token/ERC721/IERC721.sol',
    'openzeppelin-solidity/token/ERC721/IERC721Enumerable.sol',
    'openzeppelin-solidity/token/ERC721/IERC721Metadata.sol',
    'openzeppelin-solidity/token/ERC721/IERC721Receiver.sol',
    'openzeppelin-solidity/utils/Address.sol'
  ]
}