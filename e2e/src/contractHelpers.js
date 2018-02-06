const receipt = (receipt) => {
    return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        events: Object.keys(receipt.events)
    }
}

module.exports = {
    receipt
}