const async = require('async');
const fs = require('fs');
const logger = require('winston');
const _ = require('lodash');

const DEFAULT_SYNTHETICS_CONTENTS = "var manager = require ('synthetics_manager');\n"

function syntheticUrlToId(syntheticUrl) {
    return _.last(syntheticUrl.split('/'))
}

function createSyntheticFile(syntheticsFileService, filename, callback) {
    syntheticsFileService.exists(filename, function (exists) {
        if (!exists) {
            logger.verbose('Synthetics file does not exist, creating: ' + filename);
            syntheticsFileService.createFile(filename, DEFAULT_SYNTHETICS_CONTENTS, function (nBytes) {
                callback(null);
            });
        } else {
            callback(null);
        }
    });
}

function createSyntheticInNewRelic(
    newRelicService,
    syntheticsListFileService,
    name,
    locations,
    type,
    frequency,
    filename,
    status
) {
    async.waterfall([
        function (next) {
            newRelicService.createSynthetic(name, locations, type, frequency, status, function (syntheticUrl) {
                const syntheticId = syntheticUrlToId(syntheticUrl);

                next(null, syntheticId);
            });
        },

        function (id, next) {

            logger.debug('Adding Synthetic to file: ' + id + ' ' + filename);
            syntheticsListFileService.addSynthetic(id, name, filename, function () {
                next(null);
            });
        }
    ], function (err) {
        if (err) { throw err; }
        console.info('done');
    });
}

class CreateMonitorOrchestrator {
    constructor(syntheticsFileService, newRelicService, syntheticsListFileService) {
        this.syntheticsFileService = syntheticsFileService;
        this.newRelicService = newRelicService;
        this.syntheticsListFileService = syntheticsListFileService;
    }

    createNewMonitor(name, locations, type, frequency, filename) {
        logger.debug('Create New Monitor');
        logger.debug(
            'name: ' + name +
            ', locations: ' + locations +
            ', type: ' + type +
            ', frequency: ' + frequency +
            ', filename: ' + filename
        );

        async.parallel([
            function (callback) {
                createSyntheticFile(this.syntheticsFileService, filename, callback);
            }.bind(this),

            function (callback) {
                createSyntheticInNewRelic(
                    this.newRelicService,
                    this.syntheticsListFileService,
                    name,
                    locations,
                    type,
                    frequency,
                    filename,
                    'DISABLED'
                );
            }.bind(this)
        ]);
    }

}

module.exports = (syntheticsFileService, newRelicService, syntheticsListFileService) => {
    return new CreateMonitorOrchestrator(syntheticsFileService, newRelicService, syntheticsListFileService)
}