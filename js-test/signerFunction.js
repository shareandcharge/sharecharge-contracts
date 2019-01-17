const SnC = require('../main')
const ethers = require('ethers')
const {toBN} = require('../lib/utils')

const privateKey = '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3'
// const privateKey = '0x4d5db4107d237df6a3d58ee5f70ae63d73d7658d4026f2eefd2f204c81682cb7'
const snc = new SnC('poa', privateKey)

async function run() {
  console.log(
    'total supply', (await snc.eurToken.totalSupply()).toString(),
    'start balance', (await snc.eurToken.balanceOf(snc.wallet.address)).toString()
  )

  const amount = toBN('1e21').toString()
  // const mint = await snc.eurToken.mint(snc.wallet.address, amount)
  if((await snc.settlement.tokenBalances(snc.eurToken.address, snc.wallet.address)).lt(amount)){
    const provision = await snc.eurToken.provision(amount)
  }
  console.log('balance after provisioning', (await snc.eurToken.balanceOf(snc.wallet.address)).toString())
  console.log(
    'settlement balance after provisioning',
    (await snc.settlement.tokenBalances(snc.eurToken.address, snc.wallet.address)).toString(),
    (await snc.eurToken.balanceOf(snc.wallet.address)).toString(),
    (await snc.eurToken.balanceOf(snc.settlement.address)).toString()
  )

  const recipient = '0xf17f52151ebef6c7334fad080c5704d77216b732'
  // const recipient = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
  const sig = await snc.getSignedTransfer(recipient, amount, 'EUR')

  await snc.transfer(recipient, toBN(amount), 'EUR', sig)
  console.log(
    'settlement balance after transfer',
    'recipient:',
    (await snc.eurToken.balanceOf(recipient)).toString(),
    'provision for sender:',
    (await snc.settlement.tokenBalances(snc.eurToken.address, snc.wallet.address)).toString(),
    'tokens in settlement contract',
    (await snc.eurToken.balanceOf(snc.settlement.address)).toString()
  )
}

run()
  .then(console.log)
  .catch(console.error)
