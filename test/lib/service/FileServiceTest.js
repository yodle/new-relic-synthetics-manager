const td = require('testdouble');
const chai = require('chai');
const tdChai = require('testdouble-chai');

chai.should();
chai.use(tdChai(td));

const fileServiceFactory = require('../../../lib/service/FileService');

describe('FileService', () => {
    const expectedFilename = 'filename';

    const fsMock = {
        exists: td.function(),
        open: td.function(),
        write: td.function(),
        read: td.function(),
        stat: td.function()
    };

    it ('should call fs.exists when checking if a file exists', () => {
        const fileService = fileServiceFactory(fsMock);

        fileService.exists(expectedFilename, () => {});

        fsMock.exists.should.have.been.calledWith(expectedFilename, td.callback);
    });

    it ('should write contents to a file on writeFile', () => {
        const expectedFd = 1;
        const expectedContent = "some content";

        td.when(fsMock.open(
            td.matchers.isA(String),
            'w',
            td.callback
        )).thenCallback(null, expectedFd);

        td.when(fsMock.write(
            expectedFd,
            td.matchers.isA(Buffer),
            0, 
            td.matchers.isA(Number),
            0,
            td.callback
        )).thenCallback(null, 42);

        const fileService = fileServiceFactory(fsMock);

        fileService.writeFile(expectedFilename, expectedContent, (bytesWritten) => {
            fsMock.open.should.have.been.calledWith(
                expectedFilename,
                'w',
                td.callback
            );
            fsMock.write.should.have.been.calledWith(
                expectedFd,
                td.matchers.isA(Buffer),
                0,
                expectedContent.length,
                0,
                td.callback
            );
        });
    });

    it ('should throw an error if writeFile cannot open file', () => {
        const expectedError = 'cannot open file';
        const expectedFd = 1;
        const expectedContent = "some content";

        td.when(fsMock.open(
            expectedFilename,
            'w',
            td.callback
        )).thenCallback(expectedError);

        const fileService = fileServiceFactory(fsMock);

        fileService.writeFile(expectedFilename, expectedContent, (bytesWritten, err) => {
            err.should.equal(expectedError);
        });
    });

    it ('should throw an error if writeFile cannot write to file', () => {
        const expectedError = 'cannot write file';
        const expectedFd = 1;
        const expectedContent = "some content";

        td.when(fsMock.open(
            td.matchers.isA(String),
            'w',
            td.callback
        )).thenCallback(null, expectedFd);

        td.when(fsMock.write(
            expectedFd,
            td.matchers.isA(Buffer),
            0, 
            td.matchers.isA(Number),
            0,
            td.callback
        )).thenCallback(expectedError);

        const fileService = fileServiceFactory(fsMock);

        fileService.writeFile(expectedFilename, expectedContent, (bytesWritten, err) => {
            err.should.equal(expectedError);
        });
    });

    it ('should read contents of a file on getFileContent', () => {
        const expectedFd = 1;
        const expectedContent = "some content";

        td.when(fsMock.open(
            td.matchers.isA(String),
            'r',
            td.callback
        )).thenCallback(null, expectedFd);

        td.when(fsMock.stat(
            td.matchers.isA(String),
            td.callback
        )).thenCallback(null, {size: expectedContent.length});

        td.when(fsMock.read(
            expectedFd,
            td.matchers.isA(Buffer),
            0, 
            td.matchers.isA(Number),
            td.matchers.isA(Number),
            td.callback
        )).thenCallback(null, expectedContent);

        const fileService = fileServiceFactory(fsMock);

        fileService.getFileContent(expectedFilename, (fileContents) => {
            fsMock.read.should.have.been.calledWith(
                expectedFd,
                td.matchers.isA(Buffer),
                0,
                expectedContent.length,
                0,  // no offset specified, so start at 0
                td.callback
            );
        });
    });


    it ('should read contents of a file on getFileContent with start offset', () => {
        const expectedFd = 1;
        const expectedContent = "some content to be read";
        const expectedStartOffset = 12;

        td.when(fsMock.open(
            td.matchers.isA(String),
            'r',
            td.callback
        )).thenCallback(null, expectedFd);

        td.when(fsMock.stat(
            td.matchers.isA(String),
            td.callback
        )).thenCallback(null, {size: expectedContent.length});

        td.when(fsMock.read(
            expectedFd,
            td.matchers.isA(Buffer),
            0, 
            td.matchers.isA(Number),
            td.matchers.isA(Number),
            td.callback
        )).thenCallback(null, expectedContent);

        const fileService = fileServiceFactory(fsMock);

        fileService.getFileContent(expectedFilename, (fileContents) => {
            fsMock.read.should.have.been.calledWith(
                expectedFd,
                td.matchers.isA(Buffer),
                0,
                expectedContent.length,
                expectedStartOffset,
                td.callback
            );
        }, 
        expectedStartOffset
        );
    });

    it ('should return error when getFileContent cannot stat', () => {
        const expectedError = 'cannot stat file';

        td.when(fsMock.stat(
            expectedFilename,
            td.callback
        )).thenCallback(expectedError);

        const fileService = fileServiceFactory(fsMock);

        fileService.getFileContent(expectedFilename, (fileContents, err) => {
            err.should.equal(expectedError);
        });
    });

    it ('should return error when getFileContent cannot open', () => {
        const expectedError = 'cannot open file';
        const expectedContent = "some content to be read";

        td.when(fsMock.open(
            expectedFilename,
            'r',
            td.callback
        )).thenCallback(expectedError);

        td.when(fsMock.stat(
            td.matchers.isA(String),
            td.callback
        )).thenCallback(null, {size: expectedContent.length});

        const fileService = fileServiceFactory(fsMock);

        fileService.getFileContent(expectedFilename, (fileContents, err) => {
            err.should.equal(expectedError);
        });
    });

    it ('should return error when getFileContent cannot read', () => {
        const expectedError = 'cannot read file';
        const expectedFd = 1;
        const expectedContent = "some content to be read";

        td.when(fsMock.open(
            td.matchers.isA(String),
            'r',
            td.callback
        )).thenCallback(null, expectedFd);

        td.when(fsMock.stat(
            td.matchers.isA(String),
            td.callback
        )).thenCallback(null, {size: expectedContent.length});

        td.when(fsMock.read(
            expectedFd,
            td.matchers.isA(Buffer),
            0, 
            td.matchers.isA(Number),
            td.matchers.isA(Number),
            td.callback
        )).thenCallback(expectedError);

        const fileService = fileServiceFactory(fsMock);

        fileService.getFileContent(expectedFilename, (fileContents, err) => {
            err.should.equal(expectedError);
        });
    });

    it ('should make a directory when mkdir is called', () => {
        const expectedDirectory = 'expectedDirectory/';
        const mkdirpMock = td.function();

        td.when(mkdirpMock(
            td.matchers.isA(String),
            td.callback
        )).thenCallback();

        const fileService = fileServiceFactory(null, mkdirpMock);

        fileService.mkdir(expectedDirectory, () => {
            mkdirpMock.should.have.been.calledWith(
                expectedDirectory,
                td.callback
            );
        });
    });
});