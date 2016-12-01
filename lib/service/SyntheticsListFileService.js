
const path = require('path');
const async = require('async');
const logger = require('winston');

function createSyntheticListFileIfNeeded(syntheticsListFile, fileService, callback) {
    fileService.exists(syntheticsListFile, function (exists) {
        if (!exists) {
            logger.verbose('File[%s] does not exist, creating', syntheticsListFile);
            
            fileService.writeFile(
                syntheticsListFile, 
                '{}',
                callback
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
        JSON.stringify(syntheticJson),
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
    readSyntheticsListFile(syntheticsListFile, fileService, function (syntheticJson, err) {
        if (err) { return callback(err); }

        if (syntheticJson[syntheticName] !== undefined) {
            return callback('Synthetic[' + syntheticName + '] already exists');
        }

        syntheticJson[syntheticName] = {
            id: syntheticId,
            filename: syntheticFilename
        };

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

        readSyntheticsListFile(this.syntheticsListFile, this.fileService, function (syntheticsJson) {
            if (syntheticsJson[syntheticName] === undefined) {
                return callback(null, 'Could not find info for synthetic: ' + syntheticName);
            }
            return callback(syntheticsJson[syntheticName]);
        });
    }
}

module.exports = (file, fileService) => { return new SyntheticsListFileService(file, fileService); };