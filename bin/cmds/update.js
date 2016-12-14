const logger = require('winston');

const dependencies = require('../../lib/dependency');

exports.command = 'update';
exports.desc = 'Update existing synthetics monitor';
exports.builder = {
    name: {
        alias: 'n',
        desc: 'Name of synthetic to update'
    },
    filename: {
        alias: 'f',
        desc: 'Filename of synthetic to update'
    }
}

exports.handler = function (argv) {
    if ((argv.name === undefined) && (argv.filename === undefined)) { 
        throw new Error('Either name or filename must be specified');
    }

    require('../../lib/config/LoggingConfig')(argv);

    const config = require('../../lib/config/SyntheticsConfig').getConfig(argv);

    logger.verbose('Update: ' + argv.name);
    logger.verbose(argv);

    if (argv.name !== undefined) {
        dependencies(config).updateMonitorOrchestrator.updateSynthetic(argv.name);
    } else if (argv.filename !== undefined) {
        dependencies(config).updateMonitorOrchestrator.updateSyntheticByFilename(argv.filename);
    }
}