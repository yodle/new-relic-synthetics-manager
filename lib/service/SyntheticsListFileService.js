
const path = require('path');
const async = require('async');
const logger = require('winston');
const _ = require('lodash');

function createSyntheticListFileIfNeeded(syntheticsListFile, fileService, callback) {
    fileService.exists(syntheticsListFile, function (exists) {
        if (!exists) {
            logger.verbose('File[%s] does not exist, creating', syntheticsListFile);
            
            fileService.writeFile(
                syntheticsListFile, 
                '{}',
                (bytestWritten, err) => {
                    if (err) { return callback(err); }
                    callback();
                }
            );
        } else {
            callback();
        }
    });
}

function readSyntheticsListFile(syntheticsListFile, fileService, callback) {
    logger.verbose('Reading Synthetics List file: ' + syntheticsListFile);

    fileService.getFileContent(
        syntheticsListFile,
        function (fileContent, err) {
            callback(JSON.parse(fileContent), err);
        }
    );
}

function writeSyntheticsListFile(syntheticsListFile, syntheticJson, fileService, callback) {
    fileService.writeFile(
        syntheticsListFile,
        JSON.stringify(syntheticJson, null, 4),
        function (bytesWritten, err) {
            logger.debug("Write Synthetics List file complete");
            callback(err);
        }
    );
}

function addSyntheticAndWrite(
    syntheticName,
    syntheticId,
    syntheticFilename,
    syntheticsListFile,
    fileService,
    callback
) {
    readSyntheticsListFile(syntheticsListFile, fileService, (syntheticJson, err) => {
        if (err) { return callback(err); }

        if (syntheticJson[syntheticName] !== undefined) {
            return callback('Synthetic[' + syntheticName + '] already exists');
        }

        syntheticJson[syntheticName] = {
            id: syntheticId
        };

        if (!_.isNil(syntheticFilename)) {
            syntheticJson[syntheticName].filename = syntheticFilename;
        }

        writeSyntheticsListFile(syntheticsListFile, syntheticJson, fileService, function (err) {
            return callback(err);
        });
    });
}

class SyntheticsListFileService {
    constructor(syntheticsListFile, fileService) {
        this.syntheticsListFile = syntheticsListFile;
        this.fileService = fileService;
    }

    addSynthetic(syntheticId, syntheticName, syntheticFilename, callback) {
        logger.verbose('SyntheticsListFileService.addSynthetic: start');
        logger.debug(
            'syntheticId: %s, syntheticName: "%s", syntheticFilename: %s',  
            syntheticId, 
            syntheticName,
            syntheticFilename
        );

        async.series([
            function (next) {
                createSyntheticListFileIfNeeded(this.syntheticsListFile, this.fileService, function (err) {
                    next(err);
                });
            }.bind(this),

            function (next) {
                addSyntheticAndWrite(
                    syntheticName,
                    syntheticId,
                    syntheticFilename,
                    this.syntheticsListFile,
                    this.fileService,
                    function (err) {
                        next(err);
                    }
                );
            }.bind(this)

        ], function (err) {
            logger.debug('SyntheticsListFileService.addSynthetic: complete');
            callback(err);
        });
    }

    getSynthetic(syntheticName, callback) {
        logger.verbose('SyntheticsListFileService.getSynthetic: start');
        logger.debug('syntheticName: %s', syntheticName);

        readSyntheticsListFile(this.syntheticsListFile, this.fileService, (syntheticsJson, err) => {
            if (err) { return callback(null, err); }
            if (syntheticsJson[syntheticName] === undefined) {
                return callback(null, 'Could not find info for synthetic: ' + syntheticName);
            }
            return callback(syntheticsJson[syntheticName]);
        });
    }

    getSyntheticByFilename(syntheticFilename, callback) {
        logger.verbose('SyntheticListFileService.getSyntheticByFilename: start');
        logger.debug('syntheticFilename: %s', syntheticFilename);

        readSyntheticsListFile(this.syntheticsListFile, this.fileService, (syntheticsJson) => {
            const foundSynthetic = _.find(syntheticsJson, (o) => { return o.filename === syntheticFilename; }); 
            if (foundSynthetic === undefined) {
                return callback(null, 'Could not find info for synthetic filename: ' + syntheticFilename);
            }

            return callback(foundSynthetic);
        });
    }
}

module.exports = (file, fileService) => { return new SyntheticsListFileService(file, fileService); };