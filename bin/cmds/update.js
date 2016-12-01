const logger = require('winston');

const dependencies = require('../../lib/dependency');

exports.command = 'update';
exports.desc = 'Update existing synthetics monitor';
exports.builder = {
    name: {
        alias: 'n',
        desc: 'Name of synthetic to update',
        demand: 1
    }
}

exports.handler = function (argv) {
    require('../../lib/config/LoggingConfig')(argv);

    const config = require('../../lib/config/SyntheticsConfig').getConfig(argv);

    logger.verbose('Update: ' + argv.name);
    logger.verbose(argv);

    dependencies(config).updateMonitorOrchestrator.updateSynthetic(argv.name);
}