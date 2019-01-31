const ethers = require('ethers')
const contracts = require('./lib/contracts')
const sign = require('./lib/signTransfer')
const {networks} = require('./networks')
const {toBN} = require('./lib/utils')
const BigNumber = require('bignumber.js')

class SnC {
  constructor(network, privateKey, provider) {
    if (!contracts[network]) throw new Error(`the network ${network} does not exist`)
    if (!provider) {
      provider = new ethers.providers.JsonRpcProvider(`${networks[network].protocol}://${networks[network].host}:${networks[network].port}`)
    }
    this.provider = provider
    this.wallet = new ethers.Wallet(privateKey, provider)
    this.settlementJson = contracts[network].Settlement
    this.eurTokenJson = contracts[network].EurToken
    this.usdTokenJson = contracts[network].UsdToken

    this.settlement = new ethers.Contract(this.settlementJson.address, this.settlementJson.abi, this.wallet)
    this.eurToken = new ethers.Contract(this.eurTokenJson.address, this.eurTokenJson.abi, this.wallet)
    this.usdToken = new ethers.Contract(this.usdTokenJson.address, this.usdTokenJson.abi, this.wallet)

    this.eurToken.provision = async (amount, recipient) => {
      return this.provisionPaymentTokens(this.eurToken, amount, recipient)
    }
    this.usdToken.provision = async (amount, recipient) => {
      return this.provisionPaymentTokens(this.usdToken, amount, recipient)
    }
  }

  async provisionPaymentTokens(token, amount, recipient) {
    try {
      amount = toBN(amount).toString(10)
      const approval = await token.approve(this.settlement.address, amount)
      await approval.wait()
      const provision = await this.settlement.transferInto(recipient? recipient: this.wallet.address, amount, token.address)
      return provision.wait()
    } catch (e) {
      throw e
    }

  }

  async getSignedTransferRaw(recipient, amount, currency) {
    const token = currency.toUpperCase() === 'EUR' ? this.eurTokenJson : this.usdTokenJson
    return sign(recipient, amount, token.address, this.wallet)
  }

  async getSignedTransfer(recipient, amount, currency) {
    amount = new BigNumber('1e18').multipliedBy(amount).toString(10)
    return this.getSignedTransferRaw(recipient, amount, currency)
  }

  async transfer(recipient, amount, currency, signature) {
    const token = currency.toUpperCase() === 'EUR' ? this.eurTokenJson : this.usdTokenJson
    const tx = await this.settlement.transfer(recipient, toBN(amount).toString(), token.address, signature.v, signature.r, signature.s, {gasLimit: 100000})
    await tx.wait()
    const receipt = await this.provider.getTransactionReceipt(tx.hash)
    if(receipt.status === 0) {
      const setllementBalance = await this.settlement.tokenBalances(token.address, this.wallet.address)
      if(setllementBalance.lt(toBN(amount).toString())) {
        throw new Error(`the transfer failed because of a lack of funds sender has ${setllementBalance.toString()} but needs ${toBN(amount).toString()}`)
      } else {
        throw new Error('the transfer failed for an unknown reason. probably the signature could not be verified')
      }
    }
    return tx.hash
  }

}

module.exports = SnC
