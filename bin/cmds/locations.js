const dependencies = require('../../lib/dependency');
const logger = require('winston');
const _ = require('lodash');

exports.command = 'locations';
exports.desc = 'List available locations for synthetics to run';

exports.handler = function (argv) {
    require('../../lib/config/LoggingConfig')(argv);

    const config = require('../../lib/config/SyntheticsConfig').getConfig(argv);

    logger.verbose('Locations');
    logger.verbose(argv);

    dependencies(config).listLocationsOrchestrator.listLocations();
}