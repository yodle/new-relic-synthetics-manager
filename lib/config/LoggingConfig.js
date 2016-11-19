const logger = require('winston');

function setupLogging(options) {
    if (options.verbose) {
        logger.level = 'verbose';
        logger.info('Setting log level to verbose');
    }

    if (options.debug) {
        logger.level = 'debug';
        logger.info('Setting log level to debug');
    }
}

module.exports = (options) => setupLogging(options);