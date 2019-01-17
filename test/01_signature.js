// Copyright (c) 2019 Share&Charge foundation
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* global web3 */

const ethers = require('ethers')
const BigNumber = require('bignumber.js')
const sign = require('../lib/signTransfer')

var CheckSignature = artifacts.require('CheckSignature')

contract('CheckSignature', function (accounts) {
  let sigCheck
  const toBN = (num) => web3.utils.toBN(new BigNumber(num).toString(10))
  const privateKey = '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3'
  const account = '0x627306090abab3a6e1400e9345bc60c78a8bef57'

  const wallet = new ethers.Wallet(privateKey)

  const txMsg = web3.utils.soliditySha3(accounts[1], toBN('2e28'), accounts[2]).substr(2)

  before(async () => {
    sigCheck = await CheckSignature.new()
  })

  it('gets the signer out of a signed bytes32 message', async () => {
    assert.equal(txMsg, (await sigCheck.getHash(accounts[1], toBN('2e28'), accounts[2])).substr(2))
    let messageHashBytes = ethers.utils.arrayify('0x' + txMsg)
    let flatSig = await wallet.signMessage(messageHashBytes)
    let sig = ethers.utils.splitSignature(flatSig)

    assert.equal(account.toLowerCase(),
      (await sigCheck.getTransferSigner(accounts[1], toBN('2e28'), accounts[2], sig.v, sig.r, sig.s)).toLowerCase())
  })

  it('gets the signer from signed hash', async () => {
    let sig = await sign(accounts[1], '2e28', accounts[2], wallet)
    assert.equal(account.toLowerCase(),
      (await sigCheck.getSigner(sig.hash, sig.v, sig.r, sig.s)).toLowerCase())
  })

})
