
const path = require('path');
const fs = require('fs');
const async = require('async');
const logger = require('winston');

class SyntheticsListFileService {
    constructor(syntheticsListFile, fileService) {
        this.syntheticsListFile = syntheticsListFile;
        this.fileService = fileService;
    }

    addSynthetic(syntheticId, syntheticName, syntheticFilename, callback) {
        logger.verbose('Adding synthetic to file');
        async.series([
            function (next) {
                fs.exists(this.syntheticsListFile, function (exists) {
                    if (!exists) {
                        logger.verbose('File doesnt exist, creating: ' + this.syntheticsListFile);
                        this.fileService.writeFile(
                            this.syntheticsListFile,
                            "{}",
                            function () {
                                next(null);
                            }
                        );
                    } else {
                        next(null);
                    }
                }.bind(this))
            }.bind(this),

            function (next) {
                logger.verbose('Reading file: ' + this.syntheticsListFile);
                this.fileService.getFileContent(
                    this.syntheticsListFile,
                    function (fileContent) {
                        const syntheticJson = JSON.parse(fileContent);
                        syntheticJson[syntheticName] = {
                            id: syntheticId,
                            filename: syntheticFilename
                        };

                        this.fileService.writeFile(
                            this.syntheticsListFile,
                            JSON.stringify(syntheticJson),
                            function () {
                                logger.debug("Updated");
                                next();
                            }
                        );
                    }.bind(this)
                )
            }.bind(this)
        ], function (err) {
            if (err) { throw err; }
            logger.debug('done');
            callback();
        });
    }

    getFileContent(filename, callback) {
        const fileLocation = path.join(this.directory, filename);
        fs.stat(fileLocation, function (err, stats) {
            if (err) { throw err; }
            const size = stats.size;

            fs.open(fileLocation, 'r', function (err, fd) {
                if (err) { throw err; }
                var buffer = Buffer.alloc(size);

                fs.read(fd, buffer, 0, size, 45, function (err, readBytes) {
                    if (err) { throw err; } 
                    callback(buffer.slice(0, readBytes));
                });
            });
        });
    }

    getBase64File(filename, callback) {
        this.getFileContent(filename, function (buffer) {
            callback(buffer.toString('base64'));
        });
    }

}

module.exports = (file, fileService) => { return new SyntheticsListFileService(file, fileService) };