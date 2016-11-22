
const async = require('async');
const logger = require('winston');

function getSyntheticInfo(syntheticListFileService, syntheticName, callback) {
    logger.verbose('Getting synthetic info for: ' + syntheticName);

    syntheticListFileService.getSynthetic(syntheticName, callback);
}

function readSyntheticContents(syntheticInfo, syntheticFileService, callback) {
    logger.verbose('Reading synthetic file: ' + syntheticInfo.filename)

    syntheticFileService.getBase64File(syntheticInfo.filename, function (buffer) {
        syntheticInfo['content'] = buffer;
        callback(syntheticInfo);
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
                getSyntheticInfo(this.syntheticListFileService, syntheticName, function (syntheticInfo) {
                    next(null, syntheticInfo);
                });
            }.bind(this),

            function (syntheticInfo, next) {
                readSyntheticContents(syntheticInfo, this.syntheticFileService, function (newInfo) {
                    next(null, newInfo);
                });
            }.bind(this),

            function (syntheticInfo, next) {
                uploadSyntheticToNewRelic(syntheticInfo, this.newRelicService, function () {
                    next(null);
                });
            }.bind(this)
        ], function (err) {
            logger.verbose('Updating synthetic complete: ' + syntheticName)
        });
    }
}

module.exports = (syntheticListFileService, syntheticFileService, newRelicService) => {
    return new UpdateMonitorOrchestrator(syntheticListFileService, syntheticFileService, newRelicService)
}