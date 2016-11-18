
const path = require('path');
const fs = require('fs');

class SyntheticsFileService {
    constructor(directory, fileService) {
        this.directory = directory;
        this.fileService = fileService;
    }

    _getSyntheticsFilePath(filename) {
        return path.join(this.directory, filename);
    }

    createFile(filename, contents, callback) {
        const fileLocation = this._getSyntheticsFilePath(filename);
        this.fileService.writeFile(fileLocation, contents, callback);
    }

    exists(filename, callback) {
        const fileLocation = this._getSyntheticsFilePath(filename);
        fs.exists(fileLocation, callback);
    }

    getFileContent(filename, callback) {
        const fileLocation = this._getSyntheticsFilePath(filename);
        this.fileService.getFileContent(fileLocation, callback, 45);
    }

    getBase64File(filename, callback) {
        this.getFileContent(filename, function (buffer) {
            callback(buffer.toString('base64'));
        });
    }

}

module.exports = (directory, fileService) => { 
    return new SyntheticsFileService(directory, fileService) 
};