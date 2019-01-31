const SnC = require('../main')
const {execute, makePromise} = require('apollo-link')
const {HttpLink} = require('apollo-link-http')
const gql = require('graphql-tag')
const fetch = require('node-fetch')

const snc = new SnC('tobalaba', '0x03364036491b0a98873364bd95da156fd7828dc6e9ace811147c8e37a7a91636')
const sig = snc.getSignedTransfer('0x6d8B18F9b737160A73F536393C908FE89961E570', '10.44', 'EUR')

const uri = 'http://node38777-test-cpo-api.hidora.com:11075'
const link = new HttpLink({uri, fetch})

const operation = {
  query: gql`mutation($sig: InputSignature!) {
      executeTransfer(
          signature: $sig
          amount: 10.44
          recipient: "0x6d8B18F9b737160A73F536393C908FE89961E570"
          currency: "EUR"
      ) {
          txHash
          amount
          currency
      }
  }  `,
  variables: {sig}
}

// For single execution operations, a Promise can be used
makePromise(execute(link, operation))
  .then(data => console.log(`the receipt for the transfer is ${JSON.stringify(data, null, 2)}`))
  .catch(error => console.log(`received error ${error}`))
