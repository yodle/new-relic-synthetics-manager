const async = require('async');
const logger = require('winston');

function getSyntheticInfo(newRelicService, syntheticId, callback) {
    logger.verbose('Getting synthetic info from new relic for: ' + syntheticId);

    newRelicService.getSynthetic(syntheticId, callback);
}

function addSyntheticToList(
    syntheticListFileService,
    syntheticId,
    syntheticInfo,
    syntheticFilename,
    callback
) {
    logger.verbose('Adding synthetic info to synthetic list file: ' + syntheticId);
    logger.debug('syntheticInfo: ' + JSON.stringify(syntheticInfo));

    syntheticListFileService.addSynthetic(
        syntheticId,
        syntheticInfo.name,
        syntheticFilename,
        callback
    );
}

function getSyntheticCode(
    newRelicService,
    syntheticId,
    callback
) {
    logger.verbose('Geting synthetic code from New Relic: ' + syntheticId);

    newRelicService.getMonitorScript(syntheticId, (base64Code, err) => {
        if (err) { return callback(null, err); }

        logger.debug('retrieved base64Code: ' + base64Code);
        return callback(Buffer.from(base64Code, 'base64').toString());
    });
}

function addSyntheticCodeToFile(
    syntheticFileService,
    syntheticContent,
    syntheticFilename,
    callback
) {
    logger.verbose('Adding synthetic code to file:' + syntheticFilename);

    syntheticFileService.createFile(syntheticFilename, syntheticContent, (bytesWritten, err) => {
        callback(err);
    });
}

function saveSyntheticCode(
    newRelicService,
    syntheticFileService,
    syntheticId,
    syntheticFilename,
    syntheticPrefix,
    callback
) {
    logger.verbose('Retrieving and saving synthetic code');
    async.waterfall([
        (next) => {
            getSyntheticCode(newRelicService, syntheticId, (fileContent, err) => {
                next(err, fileContent);
            });
        },

        (fileContents, next) => {
            addSyntheticCodeToFile(
                syntheticFileService, 
                syntheticPrefix + fileContents, 
                syntheticFilename, 
                (err) => {
                    next(null, err);
                }
            );
        }
    ], (err) => {
        callback(err);
    });
}

function addSyntheticLocally(
    newRelicService,
    syntheticFileService,
    syntheticListFileService,
    syntheticId,
    syntheticInfo,
    syntheticFilename,
    defaults,
    callback
) {
    logger.verbose('Adding synthetic locally');

    async.parallel([
        (next) => {
            addSyntheticToList(
                syntheticListFileService, 
                syntheticId, 
                syntheticInfo, 
                syntheticFilename, 
                (err) => {
                    return next(err, syntheticInfo);
                }
            );
        },

        (next) => {
            saveSyntheticCode(
                newRelicService, 
                syntheticFileService, 
                syntheticId, 
                syntheticFilename, 
                defaults.syntheticsContent,
                (err) => {
                    return next(err);
                }
            );
        }
    ], (err) => {
        callback(err);
    });
}

class ImportMonitorOrchestrator {
    constructor(syntheticListFileService, syntheticFileService, newRelicService, defaults) {
        this.syntheticListFileService = syntheticListFileService;
        this.syntheticFileService = syntheticFileService;
        this.newRelicService = newRelicService;
        this.defaults = defaults;
    }

    importSynthetic(syntheticId, syntheticFilename) {
        logger.verbose('ImportMonitorOrchestrator.importSynthetic: ' + syntheticId);

        async.waterfall([
            ((next) => {
                getSyntheticInfo(this.newRelicService, syntheticId, (syntheticInfo, err) => {
                    return next(err, syntheticInfo);
                });
            }).bind(this),

            ((syntheticInfo, next) => {
                addSyntheticLocally(
                    this.newRelicService,
                    this.syntheticFileService,
                    this.syntheticListFileService,
                    syntheticId,
                    syntheticInfo,
                    syntheticFilename,
                    this.defaults,
                    (err) => {
                        next(err);
                    }
                );
            }).bind(this)
        ], function (err) {
            if (err) { throw err; }
            logger.verbose('Import synthetic complete: ' + syntheticId);
        });
    }
}

module.exports = (syntheticListFileService, syntheticFileService, newRelicService, defaults) => {
    return new ImportMonitorOrchestrator(syntheticListFileService, syntheticFileService, newRelicService, defaults);
};