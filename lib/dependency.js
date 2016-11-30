const fs = require('fs');
const https = require('https');

const defaults = require('./config/Defaults');

const fileServiceFactory = require('./service/FileService');
const newRelicServiceFactory = require('./service/NewRelicService');
const syntheticsFileServiceFactory = require('./service/SyntheticsFileService');
const syntheticsListFileServiceFactory = require('./service/SyntheticsListFileService');

const createMonitorOrchestratorFactory = require('./orchestrator/CreateMonitorOrchestrator');
const updateMonitorOrchestratorFactory = require('./orchestrator/UpdateMonitorOrchestrator');

module.exports = (config) => {
    const fileService = fileServiceFactory(fs);
    const newRelicService = newRelicServiceFactory(config.apikey, https);
    const syntheticsFileService = syntheticsFileServiceFactory(
        config.syntheticsDirectory, 
        fileService,
        defaults
    );
    const syntheticsListFileService = syntheticsListFileServiceFactory(
        config.syntheticsListFile,
        fileService
    );

    const createMonitorOrchestrator = createMonitorOrchestratorFactory(
        syntheticsFileService,
        newRelicService,
        syntheticsListFileService,
        defaults
    );
    const updateMonitorOrchestrator = updateMonitorOrchestratorFactory(
        syntheticsListFileService,
        syntheticsFileService,
        newRelicService
    );

    return {
        fileService: fileService,
        newRelicService: newRelicService,
        syntheticsFileService: syntheticsFileService,
        syntheticsListFileService: syntheticsListFileService,
        createMonitorOrchestrator: createMonitorOrchestrator,
        updateMonitorOrchestrator: updateMonitorOrchestrator
    };
};
