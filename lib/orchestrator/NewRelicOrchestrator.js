
const _ = require('lodash');
const async = require('async');
const logger = require('winston');

class NewRelicOrchestrator {
    constructor(newRelicService, syntheticsFileService) {
        this.newRelicService = newRelicService;
        this.syntheticsFileService = syntheticsFileService;
    }

    createSynthetic(name, locations, type, frequency, callback) {
        logger.verbose('Creating Synthetic: ' + name);

        this.newRelicService.createSynthetic({
            name: name,
            type: type,
            frequency: frequency,
            locations: locations,
            status: 'DISABLED'
        }, function (data) {
            const id = this.syntheticUrlToId(data);
            logger.verbose('Synthetic created: ' + id);
            callback(id);
        }.bind(this));
    }

    updateSynthetic(syntheticId, filename, callback) {
        logger.debug('Reading file: ' + filename);
        this.syntheticsFileService.getBase64File(filename, function (fileContents) {
            logger.debug('Uploading data for id: ' + syntheticId);
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