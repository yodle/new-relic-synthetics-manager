

const newRelicServiceFactory = require('./service/NewRelicService');
const syntheticsFileServiceFactory = require('./service/SyntheticsFileService');

const newRelicOrchestratorFactory = require('./orchestrator/NewRelicOrchestrator');

module.exports = (config) => {
    const newRelicService = newRelicServiceFactory(config.apikey);
    const syntheticsFileService = syntheticsFileServiceFactory(config.syntheticsDirectory);

    const newRelicOrchestrator = newRelicOrchestratorFactory(
        newRelicService,
        syntheticsFileService
    );

    return {
        newRelicService: newRelicService,
        newRelicOrchestrator: newRelicOrchestrator,
        syntheticsFileService: syntheticsFileService
    }
};
