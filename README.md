Share&Charge Smart Contracts

![CircleCI](https://circleci.com/gh/motionwerkGmbH/sharecharge-contracts.svg?style=svg&circle-token=4894d650771ab05ec8efbc595c8e77e151784ac9)

Share&Charge eMobility smart contracts written in Solidity for Ethereum-based networks.

## Install

The contract definitions are available as an NPM package for programmatic access and usage:

```
npm install @shareandcharge/sharecharge-contracts
```

## Usage

```ts
const stage = 'tobalaba';
const contracts = require(`@shareandcharge/sharecharge-contracts/contract.defs.${stage}.json`);
```

The contract definition for each stage contains address, abi and bytecode for the Charging, ExternalStorage and MSPToken contracts.

The possible stages are: `local`, `pilot`, `test` and `tobalaba`.



## Development

Clone and install dependencies:

```
$ git clone https://github.com/motionwerkGmbH/sharecharge-contracts.git
$ cd sharecharge-contracts
$ npm install
```

Ensure you have `ganache-cli` installed and running:

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
truffle migrate --network=<STAGE>
```

Publish contract definitions (<STAGE> defaults to "local"):

```
node bin/publish.js <STAGE>
```

The contract definitions are now available to be used in `./contract.defs.<STAGE>.json`.
