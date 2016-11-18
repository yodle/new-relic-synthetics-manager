
const _ = require('lodash');
const async = require('async');

class NewRelicOrchestrator {
    constructor(newRelicService, syntheticsFileService) {
        this.newRelicService = newRelicService;
        this.syntheticsFileService = syntheticsFileService;
    }

    createSynthetic(name, locations, type, frequency, callback) {
        console.log('Creating Synthetic: ' + name);

        this.newRelicService.createSynthetic({
            name: name,
            type: type,
            frequency: frequency,
            locations: locations,
            status: 'DISABLED'
        }, function (data) {
            const id = this.syntheticUrlToId(data);
            console.log('Synthetic created: ' + id);
            callback(id);
        }.bind(this));
    }

    updateSynthetic(syntheticId, filename, callback) {
        console.log('Reading file: ' + filename);
        this.syntheticsFileService.getBase64File(filename, function (fileContents) {
            console.log('Uploading data for id: ' + syntheticId);
            this.newRelicService.updateMonitorScript(syntheticId, fileContents, callback);
        }.bind(this));
    }

    syntheticUrlToId(syntheticUrl) {
        return _.last(syntheticUrl.split('/'))
    }
}

module.exports = (newRelicService, syntheticsFileService) => {
    return new NewRelicOrchestrator(newRelicService, syntheticsFileService)
};