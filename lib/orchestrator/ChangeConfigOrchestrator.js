const async = require('async');
const logger = require('winston');
const _ = require('lodash');

class ChangeConfigOrchestrator {
    constructor(newRelicService, syntheticsListFileService) {
        this.newRelicService = newRelicService;
        this.syntheticsListFileService = syntheticsListFileService;
    }

    changeConfigurationById(id, frequency, locations, uri, status, rename, callback) {
        logger.verbose('ChangeConfigOrchestrator.changeConfigurationById');

        this.newRelicService.updateMonitorSettings(id, frequency, locations, uri, status, rename, (err) => {
            if (err) {
                if (callback) { 
                    callback(err); 
                } else {
                    logger.error(err);
                    throw new Error(err);
                }
            }
        });

    }

    changeConfigurationByName(name, frequency, locations, uri, status, rename) {
        logger.verbose('ChangeConfigOrchestrator.changeConfigurationByName');

        async.waterfall([
            ((next) => {
                this.syntheticsListFileService.getSynthetic(name, (syntheticInfo, err) => {
                    if (err) { next(err); }

                    const syntheticId = syntheticInfo.id;
                    next(null, syntheticId);
                });
            }).bind(this),

            ((id, next) => {
                this.changeConfigurationById(id, frequency, locations, uri, status, rename, next);
            }).bind(this),

        ], (err) => {
            if (err) {
                logger.error(err);
                throw new Error(err);
            }
        });
    }
}

module.exports = (newRelicService, syntheticsListFileService) => {
    return new ChangeConfigOrchestrator(newRelicService, syntheticsListFileService);
};