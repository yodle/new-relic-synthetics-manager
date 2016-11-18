const async = require('async');
const fs = require('fs');

const DEFAULT_SYNTHETICS_CONTENTS = "var manager = require ('synthetics_manager');\n"

function createSyntheticFile(syntheticsFileService, filename, callback) {
    syntheticsFileService.exists(filename, function (exists) {
        if (!exists) {
            syntheticsFileService.createFile(filename, DEFAULT_SYNTHETICS_CONTENTS, function (nBytes) {
                callback(null);
            });
        } else {
            callback(null);
        }
    });
}

function createSyntheticInNewRelic(newRelicOrchestrator, syntheticsListFileService, name, locations, type, frequency, filename) {
    async.waterfall([
        function (next) {
            newRelicOrchestrator.createSynthetic(name, locations, type, frequency, function (syntheticId) {
                next(null, syntheticId);
            });
        },

        function (id, next) {
            syntheticsListFileService.addSynthetic(id, name, filename, function () {
                next(null);
            });
        }
    ], function (err) {
        if (err) { throw err; }
        console.log('done');
    });
}

class CreateMonitorOrchestrator {
    constructor(syntheticsFileService, newRelicOrchestrator, syntheticsListFileService) {
        this.syntheticsFileService = syntheticsFileService;
        this.newRelicOrchestrator = newRelicOrchestrator;
        this.syntheticsListFileService = syntheticsListFileService;
    }

    createNewMonitor(name, locations, type, frequency, filename) {
        async.parallel([
            function (callback) {
                createSyntheticFile(this.syntheticsFileService, filename, callback);
            }.bind(this),

            function (callback) {
                createSyntheticInNewRelic(
                    this.newRelicOrchestrator,
                    this.syntheticsListFileService,
                    name,
                    locations,
                    type,
                    frequency,
                    filename
                );
            }.bind(this)
        ]);
    }

}

module.exports = (syntheticsFileService, newRelicOrchestrator, syntheticsListFileService) => {
    return new CreateMonitorOrchestrator(syntheticsFileService, newRelicOrchestrator, syntheticsListFileService)
}