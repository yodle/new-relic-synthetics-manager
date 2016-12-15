const async = require('async');
const fs = require('fs');
const logger = require('winston');
const _ = require('lodash');

function syntheticUrlToId(syntheticUrl) {
    return _.last(syntheticUrl.split('/'));
}

function createSyntheticFile(syntheticsFileService, filename, initialContent, callback) {
    syntheticsFileService.exists(filename, (exists) => {
        if (!exists) {
            logger.verbose('Synthetics file does not exist, creating: ' + filename);
            syntheticsFileService.createFile(filename, initialContent, function (nBytes, err) {
                callback(err);
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
    status,
    callback
) {
    async.waterfall([
        (next) => {
            newRelicService.createSynthetic(name, locations, frequency, status, (syntheticUrl, err) => {
                if (err) { return next(err); }

                const syntheticId = syntheticUrlToId(syntheticUrl);
                next(null, syntheticId);
            });
        },

        (id, next) => {
            logger.debug('Adding Synthetic to file: ' + id + ' ' + filename);
            syntheticsListFileService.addSynthetic(id, name, filename, (err) => {
                next(err);
            });
        }
    ], (err) => {
        if (err) { throw err; }
        callback();
    });
}

class CreateMonitorOrchestrator {
    constructor(syntheticsFileService, newRelicService, syntheticsListFileService, defaults) {
        this.syntheticsFileService = syntheticsFileService;
        this.newRelicService = newRelicService;
        this.syntheticsListFileService = syntheticsListFileService;
        this.defaults = defaults;
    }

    createNewMonitor(name, locations, type, frequency, filename, callback) {
        logger.verbose('CreateMonitorOrchestrator.createNewMonitor: start');
        logger.debug(
            'name: ' + name +
            ', locations: ' + locations +
            ', type: ' + type +
            ', frequency: ' + frequency +
            ', filename: ' + filename
        );

        async.parallel([
            function (next) {
                createSyntheticFile(
                    this.syntheticsFileService,
                    filename,
                    this.defaults.syntheticsContent,
                    next
                );
            }.bind(this),

            function (next) {
                createSyntheticInNewRelic(
                    this.newRelicService,
                    this.syntheticsListFileService,
                    name,
                    locations,
                    type,
                    frequency,
                    filename,
                    'ENABLED',
                    next
                );
            }.bind(this)
        ], 

        (err) => {
            if (err) { throw err; }
            logger.verbose('CreateMonitorOrchestrator.createNewMonitor: complete');
            if (callback !== undefined) {
                callback();
            }
        });
    }

}

module.exports = (syntheticsFileService, newRelicService, syntheticsListFileService, defaults) => {
    return new CreateMonitorOrchestrator(syntheticsFileService, newRelicService, syntheticsListFileService, defaults);
};