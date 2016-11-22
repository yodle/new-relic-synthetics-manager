
const path = require('path');
const fs = require('fs');
const async = require('async');
const logger = require('winston');

function createSyntheticListFileIfNeeded(syntheticsListFile, fileService, callback) {
    fs.exists(syntheticsListFile, function (exists) {
        if (!exists) {
            logger.verbose('File does not exist, creating' + syntheticsListFile);
            
            fileService.writeFile(
                syntheticsListFile, 
                "{}",
                callback
            );
        } else {
            callback();
        }
    });
}

function readSyntheticsListFile(syntheticsListFile, fileService, callback) {
    logger.verbose('Reading file: ' + syntheticsListFile);

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
            logger.debug("Updated synthetics list file");
            callback();
        }
    );
}

class SyntheticsListFileService {
    constructor(syntheticsListFile, fileService) {
        this.syntheticsListFile = syntheticsListFile;
        this.fileService = fileService;
    }

    addSynthetic(syntheticId, syntheticName, syntheticFilename, callback) {
        logger.verbose('Adding synthetic to file');
        async.series([
            function (next) {
                createSyntheticListFileIfNeeded(this.syntheticsListFile, this.fileService, function () {
                    next(null);
                })
            }.bind(this),

            function (next) {
                readSyntheticsListFile(this.syntheticsListFile, this.fileService, function (syntheticJson) {
                    syntheticJson[syntheticName] = {
                        id: syntheticId,
                        filename: syntheticFilename
                    };

                    writeSyntheticsListFile(this.syntheticsListFile, syntheticsJson, this.fileService, function () {
                        next(null);
                    });
                }).bind(this)
            }.bind(this)
        ], function (err) {
            if (err) { throw err; }
            logger.debug('Finished adding Synthetic to list file');
            callback();
        });
    }

    getSynthetic(syntheticName, callback) {
        logger.verbose('Getting synthetic info: ' + syntheticName)

        readSyntheticsListFile(this.syntheticsListFile, this.fileService, function (syntheticsJson) {
            if (syntheticsJson[syntheticName] === undefined) {
                throw new Error('Could not find info for synthetic: ' + syntheticName);
            }
            callback(syntheticsJson[syntheticName]);
        });
    }
}

module.exports = (file, fileService) => { return new SyntheticsListFileService(file, fileService) };