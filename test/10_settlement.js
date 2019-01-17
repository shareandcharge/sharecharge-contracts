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

var TestToken = artifacts.require('TestToken')
var Settlement = artifacts.require('Settlement')

contract('Settlement', function (accounts) {
  let settlement, token
  const toBN = (num) => web3.utils.toBN(new BigNumber(num).toString(10))
  const privateKey = '0x49b2e2b48cfc25fda1d1cbdb2197b83902142c6da502dcf1871c628ea524f11b'

  const wallet = new ethers.Wallet(privateKey)

  before(async () => {
    settlement = await Settlement.new()
    token = await TestToken.new()
  })

  it('has account0 as owner and can mint tokens', async () => {
    assert.equal(await settlement.owner(), accounts[0])
    const tx = await token.mint(wallet.address, toBN('1e29'))
    assert.equal((await token.balanceOf(wallet.address)).toString(), toBN('1e29').toString())
  })

  it('does hold the correct balance after filling the account', async () => {
    await token.approve(settlement.address, toBN('5e28'), {from: wallet.address})
    assert.equal((await token.allowance(wallet.address, settlement.address)).toString(), toBN('5e28').toString())

    await settlement.transferInto(wallet.address, toBN('5e28'), token.address, {from: wallet.address})
    assert.equal((await settlement.tokenBalances(token.address, wallet.address)).toString(), toBN('5e28').toString())

  })

  it('can transfer tokens given a signed transfer message', async () => {
    let sig = await sign(accounts[1], '2e28', token.address, wallet)

    await settlement.transfer(accounts[1], toBN('2e28'), token.address, sig.v, sig.r, sig.s, {from: accounts[2]})
    assert.equal((await token.balanceOf(accounts[1])).toString(), toBN('2e28').toString())
    assert.equal((await settlement.tokenBalances(token.address, wallet.address)).toString(), toBN('3e28').toString())

  })

  it('reverts the transfer on insufficient funds', async () => {
    let sig = await sign(accounts[1], '2e29', token.address, wallet)

    try {
      await settlement.transfer(accounts[1], toBN('2e29'), token.address, sig.v, sig.r, sig.s, {from: accounts[2]})
      assert.fail()
    } catch (e) {
      assert.equal(e.message, 'Returned error: VM Exception while processing transaction: revert')
    }
    assert.equal((await token.balanceOf(accounts[1])).toString(), toBN('2e28').toString())
    assert.equal((await settlement.tokenBalances(token.address, wallet.address)).toString(), toBN('3e28').toString())

  })

})
