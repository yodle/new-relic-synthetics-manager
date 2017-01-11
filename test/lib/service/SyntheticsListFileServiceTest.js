const td = require('testdouble');
const chai = require('chai');
const tdChai = require('testdouble-chai');

const should = chai.should();
chai.use(tdChai(td));

const syntheticsListFileServiceFactory = require('../../../lib/service/SyntheticsListFileService');

describe('SyntheticsListFileService', function () {
    const expectedSyntheticId = 'syntheticId';
    const expectedSynthetic = 'syntheticName';
    const expectedSyntheticFilename = 'filename.js';

    const expectedSyntheticsListFile = 'syntheticslist.json';

    it ('should create Synthetics List File if it does not exist', function () {
        const fileServiceMock = {
            exists: function (filename, callback) {
                filename.should.equals(expectedSyntheticsListFile);
                callback(false);
            },
            writeFile: td.function(),
            getFileContent: td.function()
        }

        td.when(fileServiceMock.writeFile(
            td.matchers.isA(String),
            td.matchers.isA(String),
            td.callback
        )).thenCallback(null);

        td.when(fileServiceMock.getFileContent(
            td.matchers.isA(String),
            td.callback
        )).thenCallback('{}');

        const syntheticsListFileService = syntheticsListFileServiceFactory(expectedSyntheticsListFile, fileServiceMock);

        syntheticsListFileService.addSynthetic(expectedSyntheticId, expectedSynthetic, expectedSyntheticFilename, function () {
            fileServiceMock.writeFile.should.have.been.calledWith(
                expectedSyntheticsListFile, 
                td.matchers.isA(String),
                td.callback
            );
        });
    });

    it ('should not create Synthetics List File if it does exist', function () {
        const fileServiceMock = {
            exists: function (filename, callback) {
                filename.should.equal(expectedSyntheticsListFile);
                callback(true);
            },
            writeFile: td.function(),
            getFileContent: function (filename, callback) {
                filename.should.equal(expectedSyntheticsListFile);
                callback('{}');
            }
        }

        td.when(fileServiceMock.writeFile(
            td.matchers.isA(String),
            td.matchers.isA(String),
            td.callback
        )).thenCallback(null);

        const syntheticsListFileService = syntheticsListFileServiceFactory(expectedSyntheticsListFile, fileServiceMock);

        syntheticsListFileService.addSynthetic(expectedSyntheticId, expectedSynthetic, expectedSyntheticFilename, function () {
            fileServiceMock.writeFile.should.not.have.been.calledWith(
                expectedSyntheticsListFile,
                '{}',
                td.callback
            );
        });
    });

    it ('should add a synthetic to the file', function () {
        const fileServiceMock = {
            exists: function (filename, callback) {
                filename.should.equal(expectedSyntheticsListFile);
                callback(true);
            },
            writeFile: td.function(),
            getFileContent: function (filename, callback) {
                filename.should.equal(expectedSyntheticsListFile);
                callback('{}');
            }
        };

        td.when(fileServiceMock.writeFile(
            expectedSyntheticsListFile,
                td.matchers.contains(expectedSyntheticId),
                td.callback
        )).thenCallback(null);

        const syntheticsListFileService = syntheticsListFileServiceFactory(expectedSyntheticsListFile, fileServiceMock);

        syntheticsListFileService.addSynthetic(expectedSyntheticId, expectedSynthetic, expectedSyntheticFilename, function () {
            td.verify(fileServiceMock.writeFile(
                expectedSyntheticsListFile,
                td.matchers.contains(expectedSyntheticId),
                td.callback
            ));
        });
    })

    it ('should return synthetic info for existing synthetic', function () {
        const fileServiceMock = {
            exists: function (filename, callback) {
                filename.should.equal(expectedSyntheticsListFile);
                callback(true);
            },
            writeFile: td.function(),
            getFileContent: function (filename, callback) {
                filename.should.equal(expectedSyntheticsListFile);
                callback(JSON.stringify({
                    syntheticName: {
                        id: expectedSyntheticId,
                        filename: expectedSyntheticFilename
                    }
                })
                );
            }
        };

        const syntheticsListFileService = syntheticsListFileServiceFactory(expectedSyntheticsListFile, fileServiceMock);

        syntheticsListFileService.getSynthetic(expectedSynthetic, function (syntheticInfo) {
            syntheticInfo.id.should.equal(expectedSyntheticId);
            syntheticInfo.filename.should.equals(expectedSyntheticFilename);
        });
    });

    it ('should give an error trying to add an existing synthetic', function () {
        const fileServiceMock = {
            exists: function (filename, callback) {
                filename.should.equal(expectedSyntheticsListFile);
                callback(true);
            },
            writeFile: td.function(),
            getFileContent: function (filename, callback) {
                filename.should.equal(expectedSyntheticsListFile);
                callback(JSON.stringify({
                    syntheticName: {
                        id: expectedSyntheticId,
                        filename: expectedSyntheticFilename
                    }
                }));
            }
        };

        const syntheticsListFileService = syntheticsListFileServiceFactory(expectedSyntheticsListFile, fileServiceMock);

        syntheticsListFileService.addSynthetic(
            expectedSyntheticId,
            expectedSynthetic,
            expectedSyntheticFilename,
            function (err) {
                err.should.equal('Synthetic[' + expectedSynthetic + '] already exists');
            }
        );
    });

    it ('should give an error trying to retrieve a synthetic that does not exist', function () {
        const unknownSynthetic = 'notInFileSynthetic';

        const fileServiceMock = {
            exists: function (filename, callback) {
                filename.should.equal(expectedSyntheticsListFile);
                callback(true);
            },
            writeFile: td.function(),
            getFileContent: function (filename, callback) {
                filename.should.equal(expectedSyntheticsListFile);
                callback(JSON.stringify({
                    syntheticName: {
                        id: expectedSyntheticId,
                        filename: expectedSyntheticFilename
                    }
                }));
            }
        };

        const syntheticsListFileService = syntheticsListFileServiceFactory(expectedSyntheticsListFile, fileServiceMock);

        syntheticsListFileService.getSynthetic(
            unknownSynthetic,
            function (syntheticInfo, err) {
                err.should.equal('Could not find info for synthetic: ' + unknownSynthetic);
            }
        );
    });

    it ('should be able to search a synthetic by filename', () => {
        const fileServiceMock = {
            exists: function (filename, callback) {
                filename.should.equal(expectedSyntheticsListFile);
                callback(true);
            },
            writeFile: td.function(),
            getFileContent: function (filename, callback) {
                filename.should.equal(expectedSyntheticsListFile);
                callback(JSON.stringify({
                    syntheticName: {
                        id: expectedSyntheticId,
                        filename: expectedSyntheticFilename
                    }
                })
                );
            }
        };

        const syntheticsListFileService = syntheticsListFileServiceFactory(expectedSyntheticsListFile, fileServiceMock);

        syntheticsListFileService.getSyntheticByFilename(expectedSyntheticFilename, function (syntheticInfo) {
            syntheticInfo.id.should.equal(expectedSyntheticId);
            syntheticInfo.filename.should.equals(expectedSyntheticFilename);
        });
    });

    it ('should fail if synthetic filename is not found', () => {
        const unknownSyntheticFilename = 'not_a_synthetic.js';

        const fileServiceMock = {
            exists: function (filename, callback) {
                filename.should.equal(expectedSyntheticsListFile);
                callback(true);
            },
            writeFile: td.function(),
            getFileContent: function (filename, callback) {
                filename.should.equal(expectedSyntheticsListFile);
                callback(JSON.stringify({
                    "synthetic2": {
                        id: "expectedid2",
                        filename: "expectedFilename2"
                    },
                    syntheticName: {
                        id: expectedSyntheticId,
                        filename: expectedSyntheticFilename
                    }
                })
                );
            }
        };

        const syntheticsListFileService = syntheticsListFileServiceFactory(expectedSyntheticsListFile, fileServiceMock);

        syntheticsListFileService.getSyntheticByFilename(unknownSyntheticFilename, (syntheticInfo, err) => {
            err.should.equal('Could not find info for synthetic filename: ' + unknownSyntheticFilename);
        });
    });

    it ('should not require a filename for some synthetics', () => {
        const fileServiceMock = {
            exists: function (filename, callback) {
                filename.should.equal(expectedSyntheticsListFile);
                callback(true);
            },
            writeFile: td.function(),
            getFileContent: function (filename, callback) {
                filename.should.equal(expectedSyntheticsListFile);
                callback('{}');
            }
        };

        td.when(fileServiceMock.writeFile(
            expectedSyntheticsListFile,
                td.matchers.contains(expectedSyntheticId),
                td.callback
        )).thenCallback(null);

        const syntheticsListFileService = syntheticsListFileServiceFactory(expectedSyntheticsListFile, fileServiceMock);

        syntheticsListFileService.addSynthetic(expectedSyntheticId, expectedSynthetic, null, () => {
            td.verify(fileServiceMock.writeFile(
                expectedSyntheticsListFile,
                td.matchers.contains(expectedSyntheticId),
                td.callback
            ));
        });
    });

    it ('should fail if unable to create Synthetics List File', function () {
        const expectedError = 'error writing file';

        const fileServiceMock = {
            exists: function (filename, callback) {
                filename.should.equals(expectedSyntheticsListFile);
                callback(false);
            },
            writeFile: td.function(),
            getFileContent: td.function()
        }

        td.when(fileServiceMock.writeFile(
            td.matchers.isA(String),
            td.matchers.isA(String),
            td.callback
        )).thenCallback(null, expectedError);

        td.when(fileServiceMock.getFileContent(
            td.matchers.isA(String),
            td.callback
        )).thenCallback('{}');

        const syntheticsListFileService = syntheticsListFileServiceFactory(expectedSyntheticsListFile, fileServiceMock);

        syntheticsListFileService.addSynthetic(expectedSyntheticId, expectedSynthetic, expectedSyntheticFilename, (err) => {
            err.should.equals(expectedError);
        });
    });

    it ('should fail getSynthetic if synthetics file cannot be read', () => {
        const expectedError = 'error reading file';
        const fileServiceMock = {
            exists: function (filename, callback) {
                filename.should.equal(expectedSyntheticsListFile);
                callback(true);
            },
            writeFile: td.function(),
            getFileContent: td.function()
        };

        td.when(fileServiceMock.getFileContent(
            td.matchers.isA(String),
            td.callback
        )).thenCallback(null, expectedError);

        const syntheticsListFileService = syntheticsListFileServiceFactory(expectedSyntheticsListFile, fileServiceMock);

        syntheticsListFileService.getSynthetic(expectedSynthetic, (syntheticInfo, err) => {
            err.should.equals(expectedError);
        });
    });

    it ('should fail addSynthetic if synthetics file cannot be read', () => {
        const expectedError = 'error reading file';
        const fileServiceMock = {
            exists: function (filename, callback) {
                filename.should.equal(expectedSyntheticsListFile);
                callback(true);
            },
            writeFile: td.function(),
            getFileContent: td.function()
        };

        td.when(fileServiceMock.getFileContent(
            td.matchers.isA(String),
            td.callback
        )).thenCallback(null, expectedError);

        const syntheticsListFileService = syntheticsListFileServiceFactory(expectedSyntheticsListFile, fileServiceMock);

        syntheticsListFileService.addSynthetic(expectedSyntheticId, expectedSynthetic, expectedSyntheticFilename, (err) => {
            err.should.equals(expectedError);
        });
    });
});