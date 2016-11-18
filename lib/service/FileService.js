const path = require('path');
const fs = require('fs');


function getFileContent(filename, callback, startOffset) {
    if (startOffset === undefined) { startOffset = 0; }
    fs.stat(filename, function (err, stats) {
        if (err) { throw err; }
        const size = stats.size;

        fs.open(filename, 'r', function (err, fd) {
            if (err) { throw err; }
            var buffer = Buffer.alloc(size);

            fs.read(fd, buffer, 0, size, startOffset, function (err, readBytes) {
                if (err) { throw err; }
                callback(buffer.slice(0, readBytes));
            });
        });
    });
}

function writeFile(filename, content, callback) {
    console.log('writing file: ' + filename);
    fs.open(filename, 'w', function (err, fd) {
        if (err) { throw err; }
        const writeBuffer = Buffer(content);

        fs.write(fd, writeBuffer, 0, writeBuffer.length, 0, function (err, writtenBytes) {
            if (err) { throw err; }
            callback(writtenBytes);
        });
    });

}

module.exports =  {
    getFileContent: getFileContent,
    writeFile: writeFile
};