const SnC = require('../main')
const ethers = require('ethers')
const {toBN} = require('../lib/utils')

const privateKey = '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3'
// const privateKey = '0x4d5db4107d237df6a3d58ee5f70ae63d73d7658d4026f2eefd2f204c81682cb7'
const snc = new SnC('local', privateKey)

async function run() {
  console.log(
    'wallet address', snc.wallet.address,
    'total supply', (await snc.eurToken.totalSupply()).toString(),
    'start balance', (await snc.eurToken.balanceOf(snc.wallet.address)).toString()
  )

  const amount = toBN('1e21').toString()
  await snc.eurToken.mint(snc.wallet.address, amount)

  console.log(
    'wallet address', snc.wallet.address,
    'total supply', (await snc.eurToken.totalSupply()).toString(),
    'end balance', (await snc.eurToken.balanceOf(snc.wallet.address)).toString()
  )
}

run()
  .then(console.log)
  .catch(console.error)
