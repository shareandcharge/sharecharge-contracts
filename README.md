Share&Charge - Smart Contracts
==============================

![CircleCI](https://circleci.com/gh/motionwerkGmbH/sharecharge-contracts.svg?style=svg&circle-token=4894d650771ab05ec8efbc595c8e77e151784ac9)

Share&Charge eMobility smart contracts

Quick-start
-----------

Clone and install dependencies:

```
$ git clone https://github.com/motionwerkGmbH/sharecharge-contracts.git
$ cd sharecharge-contracts
$ npm install
```

Ensure you have `ganache-cli` (formerly `ethereumjs-testrpc`) installed and running:

```
$ npm install -g ganache-cli
$ ganache-cli
```

In a different terminal session, ensure the contracts are working as expected:

```
$ npm test
```

Initial deployment of the smart contracts:

```
truffle migrate
```

Publish contract definitions (<STAGE> defaults to "local"):

```
node bin/publish.js <STAGE>
```

Copy contract definitions to another project (e.g. `sharecharge-lib`):

```
cp contract.defs.<STAGE>.json ../sharecharge-lib/node_modules/@motionwerk/sharecharge-lib/contract.defs.<STAGE>.json
```