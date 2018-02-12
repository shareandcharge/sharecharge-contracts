module.exports = {
    register: 'register clientId connectorId [owner]',
    requestStart: 'requestStart connectorId [driver]',
    confirmStart: 'confirmStart connectorId [driver] [owner]',
    requestStop: 'requestStop connectorId [driver]',
    confirmStop: 'confirmStop connectorId [owner]',
    state: 'state connectorId',
    session: 'session connectorId',
    balance: 'balance connectorId',
    mint: 'mint address amount',
    usage: 'Usage: npm run e2e [ http | ws ]',
    index: `COMMANDS:
  register \t\tregister a new charging point connector        
  requestStart \t\task to start charging at a given charging point connector
  confirmStart \t\tstart a charging session at a given charging point connector
  requestStop \t\task to stop charging at a given charging point connector
  confirmStop \t\tstop a charging session at a given charging point connector
  state \t\tdisplay the state of a given charging point connector
  session \t\tdisplay the current charging session of a given charging point connector
  balance \t\tdisplay the EVCoin balance of a given address
  mint \t\t\tcreate new EVCoins for a given address
  accounts \t\tlist accounts accessible via RPC
  listen \t\tstart listening for all ChargingStation contract events (requires websocket connection)
  quit \t\t\texit the interactive console
  
USAGE:
  [command] help \tdisplay usage help for a given command (with optional parameters)` 
}