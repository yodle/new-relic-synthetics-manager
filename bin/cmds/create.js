const dependencies = require('../../lib/dependency');
const logger = require('winston');
const _ = require('lodash');

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
        desc: 'Filename to place synthetic code (require for SCRIPT_API and SCRIPT_BROWSER synthetics)'
    },
    type: {
        alias: 't',
        desc: 'Type of synthetic to create',
        choices: ['SIMPLE', 'BROWSER', 'SCRIPT_BROWSER', 'SCRIPT_API'],
        default: 'SCRIPT_BROWSER'
    },
    frequency: {
        desc: 'Frequency to run synthetic(in minutes)',
        choices: [1, 5, 10, 15, 30, 60, 360, 720, 1440],
        default: 10,
        type: 'number'
    },
    locations: {
        desc: 'Locations to run synthetic',
        default: ['AWS_US_WEST_1'],
        type: 'array'
    },
    uri: {
        alias: 'u',
        desc: 'URI for synthetic (required for SIMPLE and BROWSER synthetics)',
        type: 'string'
    },
    emails: {
        alias: 'e',
        desc: 'Emails to send synthetic alerts to (can be specified multiple times)',
        type: 'array',
    }
}

function validate(argv) {
    if ((argv.type === 'SIMPLE') || (argv.type === 'BROWSER')) {
        if (_.isNil(argv.uri)) {
            throw new Error('ERROR: Missing uri argument');
        }

        if (!_.isNil(argv.filename)) {
            throw new Error('ERROR: Unexpected filename argument');
        }
    }

    if ((argv.type ==='SCRIPT_API') || (argv.type === 'SCRIPT_BROWSER')) {
        if (_.isNil(argv.filename)) {
            throw new Error('ERROR: Missing filename argument');
        }

        if (!_.isNil(argv.uri)) {
            throw new Error('ERROR: Unexpected uri argument');
        }
    }
}

exports.handler = function (argv) {
    require('../../lib/config/LoggingConfig')(argv);

    validate(argv);

    const config = require('../../lib/config/SyntheticsConfig').getConfig(argv);

    logger.verbose('Create: ' + argv.name + ':' + argv.filename);
    logger.verbose(argv);

    dependencies(config).createMonitorOrchestrator.createNewMonitor(
        argv.name, 
        argv.locations,
        argv.type,
        argv.frequency,
        argv.filename,
        null,
        argv.uri,
        argv.emails
    );
}