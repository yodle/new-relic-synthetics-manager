
const _ = require('lodash');
const fs = require('fs');

const defaultConfigFile = 'synthetics.config.js';

const defaultConfiguration = {
    syntheticsDirectory: "./synthetics"
};

function readConfigFile(configFile) {
    return JSON.parse(
        fs.readFileSync(configFile)
    );
}

function getConfig(configFile) {
    if (configFile === undefined) {
        configFile = defaultConfigFile;
    }

    return  _.assign(defaultConfiguration, readConfigFile(configFile));
}

module.exports = {
    getConfig: getConfig
};
