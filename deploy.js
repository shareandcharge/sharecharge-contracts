// deploy the config to other locations

const config = require("./config");
const fs = require("fs");

// change this to your needs
const pathToCoreClientLib = "../core-client-lib";

console.log("Deploy");

fs.writeFileSync(pathToCoreClientLib + "/src/config/ChargingStation.json",
    JSON.stringify(config.ChargingStation, null, 2));