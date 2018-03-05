// deploy the config to other locations
const config = require("./config");
const fs = require("fs");

// change this to your needs
const pathToCoreClientLib = process.env.LIB;

console.log("Deploy");

if (!pathToCoreClientLib) {
    throw new Error("No, path to lib found. Please run 'set LIB=xxx'");
}

const pathToJson = pathToCoreClientLib + "/src/config/ChargingStation.json";

console.log("Path to .json:", pathToJson);

fs.writeFileSync(pathToJson, JSON.stringify(config.ChargingStation, null, 2));
