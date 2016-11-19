const logger = require('winston');

const dependencies = require('../../lib/dependency');

exports.command = 'update';
exports.desc = 'Update existing synthetics monitor';
exports.builder = {
    name: {
        alias: 'n',
        desc: 'Name of synthetic to update',
        demand: 1
    },
    filename: {
        alias: 'f',
        desc: 'Filename to place sythetic code'
    },
    frequency: {
        desc: 'Frequency to run synthetic',
        default: 10
    },
    locations: {
        desc: 'Locations to run synthetic',
        default: ['AWS_US_WEST_1']

    },
    status: {
        desc: ''
    },
    slaThreshold: {
        desc: ''
    }
}

exports.handler = function (argv) {
    require('../../lib/config/LoggingConfig')(argv);

    const config = require('../../lib/config/SyntheticsConfig').getConfig();

    logger.verbose('update: ' + argv.name + ':' + argv.filename);
    logger.verbose(argv);

    dependencies(config).syntheticsListFileService.addSynthetic(
        "id2", "name2", "filename2"
    );
}