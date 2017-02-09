const async = require('async');
const logger = require('winston');
const _ = require('lodash');

class ChangeConfigOrchestrator {
    constructor(newRelicService, syntheticsListFileService) {
        this.newRelicService = newRelicService;
        this.syntheticsListFileService = syntheticsListFileService;
    }

    changeConfigurationById(id, frequency, locations, uri, status, rename, addAlertEmails, rmAlertEmail, callback) {
        logger.verbose('ChangeConfigOrchestrator.changeConfigurationById');

        async.parallel([
            ((next) => {
                if (!_.isNil(frequency) ||
                    !_.isNil(locations) ||
                    !_.isNil(uri) ||
                    !_.isNil(status) ||
                    !_.isNil(rename)
                ) {
                    this.newRelicService.updateMonitorSettings(
                        id,
                        frequency,
                        locations,
                        uri,
                        status,
                        rename,
                        next
                    );
                }
            }).bind(this),

            ((next) => {
                if (!_.isNil(addAlertEmails)) {
                    this.newRelicService.addAlertEmails(
                        id, 
                        addAlertEmails,
                        next
                    );
                }
            }).bind(this),

            ((next) => {
                if (!_.isNil(rmAlertEmail)) {
                    this.newRelicService.removeAlertEmail(id, rmAlertEmail, next);
                }
            }).bind(this)

        ], (err) => {
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

    changeConfigurationByName(name, frequency, locations, uri, status, rename, addAlertEmails, rmAlertEmail) {
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
                this.changeConfigurationById(id, frequency, locations, uri, status, rename, addAlertEmails, rmAlertEmail, next);
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