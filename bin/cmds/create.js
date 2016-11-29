const dependencies = require('../../lib/dependency');
const logger = require('winston');

exports.command = 'create';
exports.desc = 'Create new synthetics monitor';
exports.builder = {
    name: {
        alias: 'n',
        desc: 'Name of synthetic to create',
        demand: 1
    },
    filename: {
        alias: 'f',
        desc: 'Filename to place sythetic code',
        demand: 1
    },
    type: {
        alias: 't',
        desc: 'Type of synthetic to create',
        default: 'SCRIPT_BROWSER'
    },
    frequency: {
        desc: 'Frequency to run synthetic',
        default: 10
    },
    locations: {
        desc: 'Locations to run synthetic',
        default: ['AWS_US_WEST_1']

    },
}

exports.handler = function (argv) {
    require('../../lib/config/LoggingConfig')(argv);

    const config = require('../../lib/config/SyntheticsConfig').getConfig();

    logger.verbose('Create: ' + argv.name + ':' + argv.filename);
    logger.verbose(argv);

    dependencies(config).createMonitorOrchestrator.createNewMonitor(
        argv.name, 
        argv.locations,
        argv.type,
        argv.frequency,
        argv.filename
    );
}