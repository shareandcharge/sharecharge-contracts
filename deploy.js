// deploy the config to other locations

const config = require("./config");
const fs = require("fs");

// change this to your needs
const pathToCoreClientLib = process.env.LIB;

console.log("Deploy to", pathToCoreClientLib);

fs.writeFileSync(pathToCoreClientLib + "/src/config/ChargingStation.json",
    JSON.stringify(config.ChargingStation, null, 2));
