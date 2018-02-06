const receipt = (receipt) => {
    return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        events: formatEvents(receipt.events)
    }
}

formatEvents = (events) => {
    let newEventObject = {};
    const keys = Object.keys(events);
    keys.forEach(key => {
        newEventObject[key] = {
            address: events[key].address,
            event: events[key].event
        }
    });
    return newEventObject;
}

module.exports = {
    receipt
}