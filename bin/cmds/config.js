const dependencies = require('../../lib/dependency');
const logger = require('winston');
const _ = require('lodash');

exports.command = 'config';
exports.desc = 'Change configuration options of a synthetic';
exports.builder = {
    name: {
        alias: 'n',
        desc: 'Name of synthetic to configure',
        type: 'string',
    },
    id: {
        alias: 'i',
        desc: 'Id of synthetic to configure',
        type: 'string',
    },
    frequency: {
        desc: 'Frequency to run synthetic(in minutes)',
        choices: [1, 5, 10, 15, 30, 60, 360, 720, 1440],
        type: 'number',
    },
    locations: {
        desc: 'Locations to run synthetic',
        type: 'array',
    },
    uri: {
        alias: 'u',
        desc: 'URI for synthetic',
        type: 'string',
    },
    status: {
        alias: 's',
        desc: 'Is the synthetic enabled?',
        choices: ['ENABLED', 'DISABLED', 'MUTED'],
    },
    rename: {
        desc: 'New name to use for synthetic',
        type: 'string',
    }
}

function validate(argv) {
    if (_.isNil(argv.name) && _.isNil(argv.id)) {
        throw new Error('ERROR: Either name or id must be specified');
    }

    const allOptions = [argv.frequency, argv.locations, argv.uri, argv.status, argv.rename];

    if (_.every(allOptions, _.isNil)) {
        throw new Error('Error: No changes specified');
    }
}

exports.handler = function (argv) {
    require('../../lib/config/LoggingConfig')(argv);

    validate(argv);

    const config = require('../../lib/config/SyntheticsConfig').getConfig(argv);

    logger.verbose('Config: ' + argv.name + ':' + argv.id);
    logger.verbose(argv);

    const changeConfigOrchestrator = dependencies(config).changeConfigOrchestrator;

    if (!_.isNil(argv.id)) {
        changeConfigOrchestrator.changeConfigurationById(
            argv.id,
            argv.frequency,
            argv.locations,
            argv.uri,
            argv.status,
            argv.rename
        );
    } else if (!_.isNil(argv.name)) {
        changeConfigOrchestrator.changeConfigurationByName(
            argv.name,
            argv.frequency,
            argv.locations,
            argv.uri,
            argv.status,
            argv.rename
        );
    }
}