
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
    const config = require('../../lib/config/SyntheticsConfig').getConfig();
    console.log('update: ' + argv.name + ':' + argv.filename);
    console.log(argv.type, argv.frequency, argv.locations, argv.status, argv.slaThreshold);

    dependencies(config).syntheticsListFileService.addSynthetic(
        "id2", "name2", "filename2"
    );

    // dependencies(config).newRelicOrchestrator.createSynthetic(
    //     argv.name, 
    //     argv.locations,
    //     argv.type,
    //     argv.frequency,
    //     argv.filename
    // );
}