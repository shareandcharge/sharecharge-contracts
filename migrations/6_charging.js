const Charging = artifacts.require("./Charging.sol");

module.exports = function(deployer) {
    deployer.deploy(Charging);

    // const evses = await EvseStorage.deployed();
    // return EvseStorage.deployed().then((evses) => {
    //     return , evses.address);
    // });
    // deployer.deploy(Charging).then(() => {
        // return Charging.deployed();
    // }).then(console.log);
    // const charging = await Charging.deployed();

    // charging.setEvsesAddress(evses.address);
    // evses.setAccess(Charging.address);
    // EvseStorage.deployed().then(evses => {
    //     return deployer.deploy(Charging, evses.address).then(() => {
    //         Charging.deployed().then(charging => {
    //             evses.setAccess(charging.address);
    //         });
    //     });
    // });
};
