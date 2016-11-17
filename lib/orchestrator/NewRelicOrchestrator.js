
const _ = require('lodash');
const async = require('async');

class NewRelicOrchestrator {
    constructor(newRelicService, syntheticsFileService) {
        this.newRelicService = newRelicService;
        this.syntheticsFileService = syntheticsFileService;
    }

    createSynthetic(name, locations, type, frequency, filename) {
        console.log('Creating Synthetic: ' + name);

        async.waterfall([
            function (next) {
                console.log('Creating ...');
                this.newRelicService.createSynthetic({
                    name: name,
                    type: type,
                    frequency: frequency,
                    locations: locations,
                    status: 'DISABLED'
                }, function (data) {
                    const id = this.syntheticUrlToId(data);
                    console.log('Synthetic created: ' + id);
                    next(null, id);
                }.bind(this));
            }.bind(this), 

            function (id, next) {
                console.log('reading file');
                this.syntheticsFileService.getBase64File(filename, function (fileContents) {
                    console.log('Uploading data for id: ' + id);
                    this.newRelicService.updateMonitorScript(id, fileContents, next);
                }.bind(this));
            }.bind(this)
        ], function (err) {
            console.log("done");
        });
    }

    syntheticUrlToId(syntheticUrl) {
        return _.last(syntheticUrl.split('/'))
    }
}

module.exports = (newRelicService, syntheticsFileService) => {
    return new NewRelicOrchestrator(newRelicService, syntheticsFileService)
};