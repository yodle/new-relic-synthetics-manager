
const logger = require('winston');
const _ = require('lodash');
const fs = require('fs');

const defaultConfigFile = 'synthetics.config.js';

const defaultConfiguration = {
    syntheticsDirectory: "./synthetics",
    syntheticsListFile: "./synthetics.json"
};

function readConfigFile(configFile) {
    if (fs.existsSync(configFile)) {
        logger.debug('Using config file: ' + configFile);

        return JSON.parse(
            fs.readFileSync(configFile)
        );
    } 

    logger.debug('Config file doesn\'t exist: ' + configFile);
    return {};
}

function getConfig(configFile) {
    if (configFile === undefined) {
        logger.debug('Using default config file: ' + defaultConfigFile);
        configFile = defaultConfigFile;
    }

    logger.debug('Using config file: ' + configFile);
    const configuration = _.assign(defaultConfiguration, readConfigFile(configFile));
    logger.debug('configuration: ' + JSON.stringify(configuration));

    return configuration;
}

module.exports = {
    getConfig: getConfig
};
