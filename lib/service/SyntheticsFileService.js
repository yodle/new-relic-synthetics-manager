
const path = require('path');
const fs = require('fs');

class SyntheticsFileService {
    constructor(directory) {
        this.directory = directory;
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

module.exports = (directory) => { return new SyntheticsFileService(directory) };