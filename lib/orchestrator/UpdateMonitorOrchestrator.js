
const async = require('async');
const logger = require('winston');

function getSyntheticInfo(syntheticListFileService, syntheticName, callback) {
    logger.verbose('Getting synthetic info for: ' + syntheticName);

    syntheticListFileService.getSynthetic(syntheticName, callback);
}

function getSyntheticInfoByFilename(syntheticListFileService, syntheticFilename, callback) {
    logger.verbose('Getting synthetic info for filename: ' + syntheticFilename);

    syntheticListFileService.getSyntheticByFilename(syntheticFilename, callback);
}

function readSyntheticContents(syntheticInfo, syntheticFileService, callback) {
    logger.verbose('Reading synthetic file: ' + syntheticInfo.filename);

    syntheticFileService.getBase64File(syntheticInfo.filename, function (buffer, err) {
        syntheticInfo.content = buffer;
        callback(syntheticInfo, err);
    });
}

function uploadSyntheticToNewRelic(syntheticInfo, newRelicService, callback) {
    logger.verbose('Uploading synthetic to new relic: ' + syntheticInfo.id);

    newRelicService.updateMonitorScript(syntheticInfo.id, syntheticInfo.content, callback);
}

class UpdateMonitorOrchestrator {
    constructor(syntheticListFileService, syntheticFileService, newRelicService) {
        this.syntheticListFileService = syntheticListFileService;
        this.syntheticFileService = syntheticFileService;
        this.newRelicService = newRelicService;
    }

    updateSynthetic(syntheticName) {
        logger.debug('Updating synthetic: ' + syntheticName);

        async.waterfall([
            function (next) {
                getSyntheticInfo(this.syntheticListFileService, syntheticName, function (syntheticInfo, err) {
                    next(err, syntheticInfo);
                });
            }.bind(this),

            function (syntheticInfo, next) {
                readSyntheticContents(syntheticInfo, this.syntheticFileService, function (newInfo, err) {
                    next(err, newInfo);
                });
            }.bind(this),

            function (syntheticInfo, next) {
                uploadSyntheticToNewRelic(syntheticInfo, this.newRelicService, function (err) {
                    next(err);
                });
            }.bind(this)
        ], function (err) {
            if (err) { throw err; }
            logger.verbose('Updating synthetic complete: ' + syntheticName);
        });
    }

    updateSyntheticByFilename(syntheticFilename) {
        logger.debug('UpdateMonitorOrchestrator.updateSyntheticByFilename: ' + syntheticFilename);

        async.waterfall([
            function (next) {
                getSyntheticInfoByFilename(this.syntheticListFileService, syntheticFilename, (syntheticInfo, err) => {
                    next(err, syntheticInfo);
                });
            }.bind(this),

            function (syntheticInfo, next) {
                readSyntheticContents(syntheticInfo, this.syntheticFileService, function (newInfo, err) {
                    next(err, newInfo);
                });
            }.bind(this),

            function (syntheticInfo, next) {
                uploadSyntheticToNewRelic(syntheticInfo, this.newRelicService, function (err) {
                    next(err);
                });
            }.bind(this)
        ], function (err) {
            if (err) { throw err; }
            logger.verbose('Updating synthetic complete: ' + syntheticName);
        });
    }
}

module.exports = (syntheticListFileService, syntheticFileService, newRelicService) => {
    return new UpdateMonitorOrchestrator(syntheticListFileService, syntheticFileService, newRelicService);
};