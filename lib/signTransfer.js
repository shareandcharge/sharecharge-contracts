const ethers = require('ethers')
const utils = require('web3-utils')
const {toBN} = require('./utils')

async function signTransfer(recipient, amount, tokenAddress, wallet){
  const txMsg = utils.soliditySha3(recipient, toBN(amount), tokenAddress)
  const messageHashBytes = ethers.utils.arrayify(txMsg)
  const flatSig = await wallet.signMessage(messageHashBytes)
  const sig = ethers.utils.splitSignature(flatSig)

  return {
    ...sig,
    hash: messageHashBytes
  }
}

module.exports = signTransfer
