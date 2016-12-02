
const dependencies = require('../../lib/dependency');
const logger = require('winston');

exports.command = 'import';
exports.desc = 'Import existing synthetics monitor';
exports.builder = {
    id: {
        alias: 'i',
        desc: 'Id of synthetic to import',
        demand: 1
    },
    filename: {
        alias: 'f',
        desc: 'Filename to place synthetic code',
        demand: 1
    },
}

exports.handler = function (argv) {
    require('../../lib/config/LoggingConfig')(argv);

    const config = require('../../lib/config/SyntheticsConfig').getConfig(argv);

    logger.verbose('Import: ' + argv.id + ':' + argv.filename);
    logger.verbose(argv);

    dependencies(config).importMonitorOrchestrator.importSynthetic(
        argv.id, 
        argv.filename
    );
}