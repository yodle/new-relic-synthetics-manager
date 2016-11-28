const sinon = require('sinon');
const td = require('testdouble');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const should = chai.should();
chai.use(sinonChai);

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
            writeFile: sinon.spy()
        }

        const syntheticsListFileService = syntheticsListFileServiceFactory(expectedSyntheticsListFile, fileServiceMock);

        syntheticsListFileService.addSynthetic(expectedSyntheticId, expectedSynthetic, expectedSyntheticFilename, function () {
            fileService.writeFile.should.have.been.called();
        });
    });

    it ('should not create Synthetics List File if it does exist', function () {
        const fileServiceMock = {
            exists: function (filename, callback) {
                filename.should.equal(expectedSyntheticsListFile);
                callback(true);
            },
            writeFile: sinon.spy(),
            getFileContent: function (filename, callback) {
                filename.should.equal(expectedSyntheticsListFile);
                callback('{}');
            }
        }

        const syntheticsListFileService = syntheticsListFileServiceFactory(expectedSyntheticsListFile, fileServiceMock);

        syntheticsListFileService.addSynthetic(expectedSyntheticId, expectedSynthetic, expectedSyntheticFilename, function () {
            fileService.writeFile.should.not.have.been.called();
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

    it ('should throw an error trying to add an existing synthetic', function () {
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

        (function () {
            syntheticsListFileService.addSynthetic(
                expectedSyntheticId,
                expectedSynthetic,
                expectedSyntheticFilename,
                function (syntheticInfo) {}
            );
        }).should.throw('Synthetic[' + expectedSynthetic + '] already exists');
    });

    it ('should throw an error trying to retrieve a synthetic that does not exist', function () {
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
                })
                );
            }
        };

        const syntheticsListFileService = syntheticsListFileServiceFactory(expectedSyntheticsListFile, fileServiceMock);

        (function () {
            syntheticsListFileService.getSynthetic(
                unknownSynthetic,
                function (syntheticInfo) {}
            );
        }).should.throw('Could not find info for synthetic: ' + unknownSynthetic);
    });
});