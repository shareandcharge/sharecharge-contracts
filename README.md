Share&Charge Smart Contracts

![CircleCI](https://circleci.com/gh/motionwerkGmbH/sharecharge-contracts.svg?style=svg&circle-token=4894d650771ab05ec8efbc595c8e77e151784ac9)

Share&Charge eMobility smart contracts written in Solidity for Ethereum-based networks.

## Install

The contract definitions are available as an NPM package for programmatic access and usage:

```
npm install @shareandcharge/sharecharge-contracts
```

## Usage

The package provides a class `SnC` which simplifies the work with the smart-contracts. 
The constructor takes 3 parameters:
* stage - one of `local`, `poa`, `test` and `tobalaba`
* privateKey - the private key of the account you want to sign your transactions with
* provider - optionally you can override the default configuration for accessing the node by supplying your own provider

the packages uses [ethers](https://docs.ethers.io/ethers.js/html/) for communicating 
with the parity node. 

the SnC class provides access to the smart contracts in the form of instantiated objects which expose 
all the implemented functions. The available smart-contracts are:
* settlement - the wallet into which you have to send tokens in order for them to be used as payment
* eurToken - the EUR stable coin token
* usdToken - the USD stable coin token
* at this stage we're not using the EVT token for staking. Hence its absence from the list

at this stage there are no faucets to get stable coins for test. Create an issue with your address and the environement on which you work and we'll send some tokens your way

once you have tokens you can provision your account in the Settlement contract by calling the `provision` function on the instantiated `SnC` object. 
That would look something like this:
```
snc.eurToken.provision(amount) // the amount must be a string and can be in scientific notation. e.g. 2.1e28
```

Once your account is provisioned, you can transfer the tokens by delegating the transaction to anyone. Get the signature by calling
```
getSignedTransfer(recipient: address, amount: string, currency: [EUR, USD])
```

this signature can then be forwarded to a server which can submit it to the smart-contract without needing to know the signer's private key


## Development

Clone and install dependencies:

```
$ git clone https://github.com/motionwerkGmbH/sharecharge-contracts.git
$ cd sharecharge-contracts
$ npm install
```

In two different terminal sessions, ensure the contracts are working as expected:

```
$ npm run ganache
$ npm test
```

Initial deployment of the smart contracts:

```
truffle migrate --network=<STAGE>
```

Publish contract definitions (<STAGE> defaults to "local"):

```
npm run publish-dev <STAGE>
```

The contract definitions are now available to be used in `./contract.defs.<STAGE>.json`.
