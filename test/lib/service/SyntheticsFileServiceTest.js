const td = require('testdouble');
const chai = require('chai');
const path = require('path');

const should = chai.should();

const syntheticsFileServiceFactory = require('../../../lib/service/SyntheticsFileService');

describe('SyntheticsFileService', () => {
    const initialSyntheticsCode = '//initial synthetics\ncode';

    const expectedDirectory = 'syntheticsDirectory';
    const expectedFilename = 'createFileFilename';
    const expectedPath = path.join(expectedDirectory, expectedFilename);

    const defaultsMock = {
        syntheticsContent: initialSyntheticsCode
    };

    it ('should write a file when createFile is called', () => {
        const expectedContents = 'Contents\nof\nthe\nfile';

        const fileServiceMock = {
            writeFile: td.function(),
            exists: td.function()
        };

        td.when(fileServiceMock.writeFile(
            expectedPath,
            td.matchers.isA(String),
            td.callback
        )).thenCallback(null);

        td.when(fileServiceMock.exists(
            td.matchers.isA(String),
            td.callback
        )).thenCallback(true);

        const syntheticsFileService = syntheticsFileServiceFactory(expectedDirectory, fileServiceMock, defaultsMock);
        
        syntheticsFileService.createFile(expectedFilename, expectedContents, () => {
            td.verify(fileServiceMock.writeFile(
                expectedPath, expectedContents, td.callback
            ));
        });
    });

    it ('should call to file service to determine if a file exists', () => {
        const fileServiceMock = {
            exists: td.function()
        };

        td.when(fileServiceMock.exists(
            expectedPath, 
            td.callback
        )).thenCallback(true);

        const syntheticsFileService = syntheticsFileServiceFactory(expectedDirectory, fileServiceMock, defaultsMock);

        syntheticsFileService.exists(expectedFilename, (exists) => {
            exists.should.equal(true);
        });
    });

    it ('should get file contents offset by size of file contents', () => {
        const expectedFileContents = 'file\ncontents\nhere';

        const fileServiceMock = {
            getFileContent: td.function()
        };

        td.when(fileServiceMock.getFileContent(
            expectedPath, 
            td.callback,
            td.matchers.isA(Number)
        )).thenCallback(expectedFileContents);

        const syntheticsFileService = syntheticsFileServiceFactory(expectedDirectory, fileServiceMock, defaultsMock);

        syntheticsFileService.getFileContent(expectedFilename, (fileContents) => {
            fileContents.should.equal(expectedFileContents);
            fileServiceMock.getFileContent.should.have.been.calledWith(
                expectedPath,
                td.callback,
                initialSyntheticsCode.length
            );
        });
    });

    it ('getBase64File should get file contents converted to base64', () => {
        const expectedFileContents = 'file\ncontents\nhere';

        const fileServiceMock = {
            getFileContent: td.function()
        };

        td.when(fileServiceMock.getFileContent(
            expectedPath, 
            td.callback,
            td.matchers.isA(Number)
        )).thenCallback(new Buffer(expectedFileContents));

        const syntheticsFileService = syntheticsFileServiceFactory(expectedDirectory, fileServiceMock, defaultsMock);

        syntheticsFileService.getBase64File(expectedFilename, (fileContents) => {
            fileContents.should.equal(new Buffer(expectedFileContents).toString('base64'));
        });
    });

    it ('getBase64File should return an error if it cannot read the file', () => {
        const expectedError = 'cannot read file';
        const expectedFileContents = 'file\ncontents\nhere';

        const fileServiceMock = {
            getFileContent: td.function()
        };

        td.when(fileServiceMock.getFileContent(
            expectedPath, 
            td.callback,
            td.matchers.isA(Number)
        )).thenCallback(null, expectedError);

        const syntheticsFileService = syntheticsFileServiceFactory(expectedDirectory, fileServiceMock, defaultsMock);

        syntheticsFileService.getBase64File(expectedFilename, (fileContents, err) => {
            err.should.equals(expectedError);
        });
    });

    it ('should make a directory if it does not exist', () => {
        const expectedContents = 'Contents\nof\nthe\nfile';

        const fileServiceMock = {
            writeFile: td.function(),
            exists: td.function(),
            mkdir: td.function()
        };

        td.when(fileServiceMock.writeFile(
            expectedPath,
            td.matchers.isA(String),
            td.callback
        )).thenCallback(null);

        td.when(fileServiceMock.exists(
            td.matchers.isA(String),
            td.callback
        )).thenCallback(false);

        td.when(fileServiceMock.mkdir(
            td.matchers.isA(String),
            td.callback
        )).thenCallback();

        const syntheticsFileService = syntheticsFileServiceFactory(expectedDirectory, fileServiceMock, defaultsMock);
        
        syntheticsFileService.createFile(expectedFilename, expectedContents, () => {
            td.verify(fileServiceMock.writeFile(
                expectedPath, expectedContents, td.callback
            ));
        });
    });

    it ('should fail if cannot make a directory', () => {
        const expectedError = 'error making directory';
        const expectedContents = 'Contents\nof\nthe\nfile';

        const fileServiceMock = {
            writeFile: td.function(),
            exists: td.function(),
            mkdir: td.function()
        };

        td.when(fileServiceMock.writeFile(
            expectedPath,
            td.matchers.isA(String),
            td.callback
        )).thenCallback(null);

        td.when(fileServiceMock.exists(
            td.matchers.isA(String),
            td.callback
        )).thenCallback(false);

        td.when(fileServiceMock.mkdir(
            td.matchers.isA(String),
            td.callback
        )).thenCallback(expectedError);

        const syntheticsFileService = syntheticsFileServiceFactory(expectedDirectory, fileServiceMock, defaultsMock);
        
        syntheticsFileService.createFile(expectedFilename, expectedContents, (bytesWritte, err) => {
            err.should.equal(expectedError);
        });
    });
});