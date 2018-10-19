const Charging = artifacts.require('Charging')
const ExternalStorage = artifacts.require('ExternalStorage')
const MSPToken = artifacts.require('MSPToken')

const helpers = require('./helpers')

contract('Charging', function (accounts) {

  let store, token, charging

  beforeEach(async () => {
    store = await ExternalStorage.new()
    token = await MSPToken.new('MSPToken', 'MSP')
    charging = await Charging.new()
    charging.setStorageAddress(store.address)
    token.setAccess(charging.address);
  })

  it('setAccess should be restricted to the owner', async () => {
    try {
      await token.setAccess(charging.address, {from: accounts[2]})
      expect.fail()
    } catch (e) {
      expect(e).to.not.be.null
    }
    try {
      await token.setAccess(accounts[2], {from: await token.owner()})
      await token.restrictedApproval(accounts[3], accounts[2], 1000, {from: accounts[2]})
      expect.fail()
    } catch (e) {
      expect(e.message).to.contain(' Owner\'s balance is not greater than or equal to the value being approved')
    }
  })

  async function addLocation(owner) {
    const scId = helpers.randomBytes32String()
    const hash = helpers.randomBytes32String()
    const evseId = '0x42452d4245432d45303431353033303031'
    const connectorId = '0x01'
    await store.addLocation(scId, hash, {from: owner})
    return {scId, evseId, connectorId}
  }

  it('should not allow request start on unregistered location', async () => {
    await token.mint(accounts[1], 500)
    const id = () => helpers.randomBytes32String()
    try {
      await charging.requestStart(id(), id(), id(), 3, 60, token.address, 100, {from: accounts[1]})
      expect.fail()
    } catch (err) {
      expect(err.message.search('revert') != -1).to.equal(true)
    }
  })

  it('should only allow owner to call confirmation functions', async () => {
    await token.mint(accounts[1], 500)
    const {scId, evseId, connectorId} = await addLocation(accounts[0])
    expect(await token.chargingContract()).to.equal(charging.address)
    const charge = await charging.requestStart(scId, evseId, connectorId, 3, 60, token.address, 100, {from: accounts[1]})

    try {
      await charging.confirmStart(scId, evseId, helpers.randomBytes32String(), Date.now() / 1000, {from: accounts[1]})
      expect.fail()
    } catch (err) {
      expect(err.message.search('revert') != -1).to.equal(true)
    }
  })

  it('should get state of charge', async () => {
    await token.mint(accounts[1], 500)
    const {scId, evseId, connectorId} = await addLocation(accounts[0])
    await charging.requestStart(scId, evseId, connectorId, 0, 20, token.address, 150, {from: accounts[1]})
    const session = await charging.state(scId, evseId)
    expect(session).to.not.equal(undefined)
  })

  it('should emit charge detail record event at end of charging session', async () => {

    await token.mint(accounts[1], 500)

    const balanceBefore = await token.balanceOf(accounts[1])
    expect(balanceBefore.toNumber()).to.equal(500)

    const {scId, evseId, connectorId} = await addLocation(accounts[0])

    // console.log(scId, evseId, token.address, 200);
    const requestStart = await charging.requestStart(scId, evseId, connectorId, 0, 20, token.address, 200, {from: accounts[1]})
    console.log('requestStart gas:', requestStart.receipt.gasUsed)

    const allowance = await token.allowance(accounts[1], charging.address)
    expect(allowance.toNumber()).to.equal(200)

    const sessionId = helpers.randomBytes32String()
    const confirmStart = await charging.confirmStart(scId, evseId, sessionId, Date.now() / 1000, {from: accounts[0]})
    console.log('confirmStart gas:', confirmStart.receipt.gasUsed)

    // check allowance has been expended after token transfer
    const allowance2 = await token.allowance(accounts[1], charging.address)
    expect(allowance2.toNumber()).to.equal(0)

    // charged 10kw over 2 hours
    const confirmStop = await charging.confirmStop(scId, evseId, {from: accounts[0]})
    console.log('confirmStop gas:', confirmStop.receipt.gasUsed)

    const cdr = await charging.chargeDetailRecord(scId, evseId, 50, 200, Date.now())
    console.log('chargeDetailRecord gas:', cdr.receipt.gasUsed)

    const balanceAfter = await token.balanceOf(accounts[1])
    expect(balanceAfter.toNumber()).to.equal(300)

    const balanceEvseOwner = await token.balanceOf(accounts[0])
    expect(balanceEvseOwner.toNumber()).to.equal(200)

    const cdrEvent = cdr.logs.filter(log => log.event === 'ChargeDetailRecord')
    expect(cdrEvent.length).to.equal(1)
    expect(cdrEvent[0].args.controller).to.equal(accounts[1])
    expect(cdrEvent[0].args.finalPrice.toNumber()).to.equal(200)
  })

  it('Should correctly refund driver tokens upon early stop', async () => {
    await token.mint(accounts[1], 500)
    const {scId, evseId, connectorId} = await addLocation(accounts[0])

    await charging.requestStart(scId, evseId, connectorId, 1, 0, token.address, 300, {from: accounts[1]})

    const sessionId = helpers.randomBytes32String()
    await charging.confirmStart(scId, evseId, sessionId, Date.now() / 1000, {from: accounts[0]})

    const balanceControllerBefore = await token.balanceOf(accounts[1])
    expect(balanceControllerBefore.toNumber()).to.equal(200)

    await charging.confirmStop(scId, evseId, {from: accounts[0]})

    const result = await charging.chargeDetailRecord(scId, evseId, 40, 225, Date.now())

    const balanceControllerAfter = await token.balanceOf(accounts[1])
    expect(balanceControllerAfter.toNumber()).to.equal(275)
    const balanceEvseOwner = await token.balanceOf(accounts[0])
    expect(balanceEvseOwner.toNumber()).to.equal(225)

    const cdrEvent = result.logs.filter(log => log.event === 'ChargeDetailRecord')
    expect(cdrEvent.length).to.equal(1)
    expect(cdrEvent[0].args.finalPrice.toNumber()).to.equal(225)
  })

})
