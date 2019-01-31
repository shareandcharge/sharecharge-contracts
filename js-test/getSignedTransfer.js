const SnC = require('../main')
const {toBN} = require('../lib/utils')

const privateKeys = {
  local: '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
  tobalaba: '0xCAB468AF941365618E45836E3C4E08F53A330C87C37941F011F68BA3D448C47B'
}
const network = 'tobalaba'
const snc = new SnC(network, privateKeys[network])
const recipient = '0xf17f52151ebef6c7334fad080c5704d77216b732'

const run = async () => {
  return snc.getSignedTransfer(recipient, 10.44, 'EUR')
}

run()
  .then(res => console.log(res.r, res.s, res.v))
  .catch(console.error)
