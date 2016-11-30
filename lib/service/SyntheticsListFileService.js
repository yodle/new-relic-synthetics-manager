
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
        function (fileContent) {
            callback(JSON.parse(fileContent));
        }
    );
}

function writeSyntheticsListFile(syntheticsListFile, syntheticJson, fileService, callback) {
    fileService.writeFile(
        syntheticsListFile,
        JSON.stringify(syntheticJson),
        function () {
            logger.debug("Write Synthetics List file complete");
            callback();
        }
    );
}

function addSyntheticAndWrite(syntheticName, syntheticId, syntheticFilename, syntheticsListFile, fileService, callback) {
    readSyntheticsListFile(syntheticsListFile, fileService, function (syntheticJson) {
        if (syntheticJson[syntheticName] !== undefined) {
            throw new Error('Synthetic[' + syntheticName + '] already exists');
        }

        syntheticJson[syntheticName] = {
            id: syntheticId,
            filename: syntheticFilename
        };

        writeSyntheticsListFile(syntheticsListFile, syntheticJson, fileService, function () {
            callback();
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
                createSyntheticListFileIfNeeded(this.syntheticsListFile, this.fileService, function () {
                    next(null);
                });
            }.bind(this),

            function (next) {
                addSyntheticAndWrite(syntheticName, syntheticId, syntheticFilename, this.syntheticsListFile, this.fileService, function () {
                    next(null);
                });
            }.bind(this)

        ], function (err) {
            logger.debug('SyntheticsListFileService.addSynthetic: complete');
            if (err) { throw err; }
            callback();
        });
    }

    getSynthetic(syntheticName, callback) {
        logger.verbose('SyntheticsListFileService.getSynthetic: start');
        logger.debug('syntheticName: %s', syntheticName);

        readSyntheticsListFile(this.syntheticsListFile, this.fileService, function (syntheticsJson) {
            if (syntheticsJson[syntheticName] === undefined) {
                throw new Error('Could not find info for synthetic: ' + syntheticName);
            }
            callback(syntheticsJson[syntheticName]);
        });
    }
}

module.exports = (file, fileService) => { return new SyntheticsListFileService(file, fileService); };