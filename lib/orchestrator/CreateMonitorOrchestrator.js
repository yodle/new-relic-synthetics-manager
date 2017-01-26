const async = require('async');
const fs = require('fs');
const logger = require('winston');
const _ = require('lodash');

function syntheticUrlToId(syntheticUrl) {
    return _.last(syntheticUrl.split('/'));
}

function createSyntheticFile(syntheticsFileService, type, filename, initialContent, callback) {
    if ((type === 'SIMPLE') || (type === 'BROWSER')) {
        callback();
    } else {
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
    uri,
    callback
) {
    async.waterfall([
        (next) => {
            newRelicService.createSynthetic(name, locations, frequency, status, type, (syntheticUrl, err) => {
                if (err) { return next(err); }

                const syntheticId = syntheticUrlToId(syntheticUrl);
                next(null, syntheticId);
            }, 
            uri);
        },

        (id, next) => {
            logger.debug('Adding Synthetic to file: ' + id + ' ' + filename);
            syntheticsListFileService.addSynthetic(id, name, filename, (err) => {
                next(err);
            });
        }
    ], (err) => {
        callback(err);
    });
}

class CreateMonitorOrchestrator {
    constructor(syntheticsFileService, newRelicService, syntheticsListFileService, defaults) {
        this.syntheticsFileService = syntheticsFileService;
        this.newRelicService = newRelicService;
        this.syntheticsListFileService = syntheticsListFileService;
        this.defaults = defaults;
    }

    createNewMonitor(name, locations, type, frequency, filename, callback, uri) {
        logger.verbose('CreateMonitorOrchestrator.createNewMonitor: start');
        logger.debug(
            'name: ' + name +
            ', locations: ' + locations +
            ', type: ' + type +
            ', frequency: ' + frequency +
            ', filename: ' + filename + 
            ', uri: ' + uri
        );

        async.parallel([
            function (next) {
                createSyntheticFile(
                    this.syntheticsFileService,
                    type,
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
                    uri,
                    next
                );
            }.bind(this)
        ], 

        (err) => {
            if (err) { logger.error(err); throw err; }
            logger.verbose('CreateMonitorOrchestrator.createNewMonitor: complete');
            if (!_.isNil(callback)) {
                callback();
            }
        });
    }
}

module.exports = (syntheticsFileService, newRelicService, syntheticsListFileService, defaults) => {
    return new CreateMonitorOrchestrator(syntheticsFileService, newRelicService, syntheticsListFileService, defaults);
};