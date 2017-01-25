const logger = require('winston');
const _ = require('lodash');

class ListLocationsOrchestrator {
    constructor(newRelicService) {
        this.newRelicService = newRelicService;
    }

    listLocations() {
        logger.verbose('ListLocationsOrchestrator.listLocations: start');

        this.newRelicService.getAvailableLocations((err, locationList) => {
            if (err) { logger.error(err); throw err; }

            _.forEach(locationList, (location) => {
                console.log('%s: %s', location.label, location.name);
            });
        });
    }

}

module.exports = (newRelicService) => {
    return new ListLocationsOrchestrator(newRelicService);
};