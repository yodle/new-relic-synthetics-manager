const td = require('testdouble');
const chai = require('chai');
const path = require('path');

const should = chai.should();

const syntheticsFileServiceFactory = require('../../../lib/service/SyntheticsFileService');

describe('SyntheticsFileService', function () {

    const expectedDirectory = 'syntheticsDirectory';
    const expectedFilename = 'createFileFilename';
    const expectedPath = path.join(expectedDirectory, expectedFilename);

    it ('should write a file when createFile is called', function () {
        const expectedContents = 'Contents\nof\nthe\nfile';

        const fileServiceMock = {
            writeFile: td.function()
        };

        td.when(fileServiceMock.writeFile(
            expectedPath,
            td.matchers.isA(String),
            td.callback
        )).thenCallback(null);

        const syntheticsFileService = syntheticsFileServiceFactory(expectedDirectory, fileServiceMock);
        
        syntheticsFileService.createFile(expectedFilename, expectedContents, function () {
            td.verify(fileServiceMock.writeFile(
                expectedPath, expectedContents, td.callback
            ));
        });
    });

    it ('should call to file service to determine if a file exists', function () {
        const fileServiceMock = {
            exists: td.function()
        };

        td.when(fileServiceMock.exists(
            expectedPath, 
            td.callback
        )).thenCallback(true);

        const syntheticsFileService = syntheticsFileServiceFactory(expectedDirectory, fileServiceMock);

        syntheticsFileService.exists(expectedFilename, function (exists) {
            exists.should.equal(true);
        });
    });

    it ('should get file contents offset by 45 characters', function () {
        const expectedFileContents = 'file\ncontents\nhere';

        const fileServiceMock = {
            getFileContent: td.function()
        };

        td.when(fileServiceMock.getFileContent(
            expectedPath, 
            td.callback,
            45
        )).thenCallback(expectedFileContents);

        const syntheticsFileService = syntheticsFileServiceFactory(expectedDirectory, fileServiceMock);

        syntheticsFileService.getFileContent(expectedFilename, function (fileContents) {
            fileContents.should.equal(expectedFileContents);
        });
    });

    it ('getBase64File should get file contents converted to base64', function () {
        const expectedFileContents = 'file\ncontents\nhere';

        const fileServiceMock = {
            getFileContent: td.function()
        };

        td.when(fileServiceMock.getFileContent(
            expectedPath, 
            td.callback,
            45
        )).thenCallback(new Buffer(expectedFileContents));

        const syntheticsFileService = syntheticsFileServiceFactory(expectedDirectory, fileServiceMock);

        syntheticsFileService.getBase64File(expectedFilename, function (fileContents) {
            fileContents.should.equal(new Buffer(expectedFileContents).toString('base64'));
        });
    });
});