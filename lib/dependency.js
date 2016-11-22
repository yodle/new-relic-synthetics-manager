

const fileService = require('./service/FileService');
const newRelicServiceFactory = require('./service/NewRelicService');
const syntheticsFileServiceFactory = require('./service/SyntheticsFileService');
const syntheticsListFileServiceFactory = require('./service/SyntheticsListFileService');

const newRelicOrchestratorFactory = require('./orchestrator/NewRelicOrchestrator');
const createMonitorOrchestratorFactory = require('./orchestrator/CreateMonitorOrchestrator');
const updateMonitorOrchestratorFactory = require('./orchestrator/UpdateMonitorOrchestrator');

module.exports = (config) => {
    const newRelicService = newRelicServiceFactory(config.apikey);
    const syntheticsFileService = syntheticsFileServiceFactory(
        config.syntheticsDirectory, 
        fileService
    );
    const syntheticsListFileService = syntheticsListFileServiceFactory(
        config.syntheticsListFile,
        fileService
    );

    const newRelicOrchestrator = newRelicOrchestratorFactory(
        newRelicService,
        syntheticsFileService
    );
    const createMonitorOrchestrator = createMonitorOrchestratorFactory(
        syntheticsFileService,
        newRelicOrchestrator,
        syntheticsListFileService
    );
    const updateMonitorOrchestrator = updateMonitorOrchestratorFactory(
        syntheticsListFileService,
        syntheticsFileService,
        newRelicService
    );

    return {
        fileService: fileService,
        newRelicService: newRelicService,
        newRelicOrchestrator: newRelicOrchestrator,
        syntheticsFileService: syntheticsFileService,
        syntheticsListFileService: syntheticsListFileService,
        createMonitorOrchestrator: createMonitorOrchestrator,
        updateMonitorOrchestrator: updateMonitorOrchestrator
    }
};
