const state = (result) => {
    for (let i = 0; i <= 10; i++) {
        delete result[i];
    }
    return result
}

const receipt = (receipt) => {
    return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        events: Object.keys(receipt.events)
    }
}

module.exports = {
    state,
    receipt
}