const path = require('path');
const logger = require('winston');


function getContentsOfFile(fs, filename, callback, startOffset) {
    if (startOffset === undefined) { startOffset = 0; }
    fs.stat(filename, function (err, stats) {
        if (err) { return callback(null, err); }
        const size = stats.size;

        fs.open(filename, 'r', function (err, fd) {
            if (err) { return callback(null, err); }
            var buffer = Buffer.alloc(size);

            fs.read(fd, buffer, 0, size, startOffset, function (err, readBytes) {
                if (err) { return callback(null, err); }
                callback(buffer.slice(0, readBytes));
            });
        });
    });
}

function writeContentsToFile(fs, filename, content, callback) {
    logger.verbose('writing file: ' + filename);

    fs.open(filename, 'w', function (err, fd) {
        if (err) { return callback(null, err); }
        const writeBuffer = Buffer(content);

        fs.write(fd, writeBuffer, 0, writeBuffer.length, 0, function (err, writtenBytes) {
            if (err) { return callback(null, err); }
            callback(writtenBytes);
        });
    });
}

function doesFileExist(fs, filename, callback) {
    fs.exists(filename, callback);
}

function createDirectory(mkdirp, directory, callback) {
    mkdirp(directory, callback);
}

class FileService {
    constructor(fs, mkdirp) {
        this.fs = fs;
        this.mkdirp = mkdirp;
    }

    getFileContent(filename, callback, startOffset) {
       logger.verbose('FileService.getFileContent: ' + filename);

        getContentsOfFile(this.fs, filename, callback, startOffset);
    }

    writeFile(filename, content, callback) {
        logger.verbose('FileService.writeFile: ' + filename);

        writeContentsToFile(this.fs, filename, content, callback);
    }

    exists(filename, callback) {
        logger.verbose('FileService.exists: ' + filename);

        doesFileExist(this.fs, filename, callback);
    }

    mkdir(directory, callback) {
        logger.verbose('FileService.mkdir: ' + directory);

        createDirectory(this.mkdirp, directory, callback);
    }
}

module.exports = (fs, mkdirp) =>  { return new FileService(fs, mkdirp); };