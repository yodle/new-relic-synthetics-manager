
const logger = require('winston');
const _ = require('lodash');
const fs = require('fs');
const defaults = require('./Defaults');

const defaultConfiguration = {
    syntheticsDirectory: defaults.syntheticsDirectory,
    syntheticsListFile: defaults.syntheticsListFile
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
        logger.debug('Using default config file: ' + defaults.configFile);
        configFile = defaults.configFile;
    }

    logger.debug('Using config file: ' + configFile);
    const configuration = _.assign(defaultConfiguration, readConfigFile(configFile));
    logger.debug('configuration: ' + JSON.stringify(configuration));

    return configuration;
}

module.exports = {
    getConfig: getConfig
};
