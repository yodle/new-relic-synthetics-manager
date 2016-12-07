const td = require('testdouble');
const chai = require('chai');
const tdChai = require('testdouble-chai');

chai.should();
chai.use(tdChai(td));

const importMonitorOrchestratorFactory = require('../../../lib/orchestrator/ImportMonitorOrchestrator');

describe('ImportMonitorOrchestrator', () => {
    const expectedSyntheticId = 'syntheticId';
    const expectedFilename = 'syntheticFilename.js';

    const defaultsMock = {};
    const syntheticsListFileServiceMock = {
        addSynthetic: td.function()
    };
    const syntheticsFileServiceMock = {};
    const newRelicServiceMock = {
        getSynthetic: td.function(),
        getMonitorScript: td.function()
    };
    const syntheticInfoMock = {};

    it('should fail if it cannot find info in New Relic', () => {
        const expectedError = 'Could not find synthetic';

        td.when(newRelicServiceMock.getSynthetic(
            expectedSyntheticId,
            td.callback
        )).thenCallback(null, expectedError);

        const importMonitorOrchestrator = importMonitorOrchestratorFactory(
            syntheticsListFileServiceMock,
            syntheticsFileServiceMock,
            newRelicServiceMock,
            defaultsMock
        );

        (() => {
            importMonitorOrchestrator.importSynthetic(expectedSyntheticId, expectedFilename);
        }).should.throw(expectedError);
    });

    it('should get synthetic from New Relic and write it to disk', () => {

        td.when(newRelicServiceMock.getSynthetic(
            expectedSyntheticId,
            td.callback
        )).thenCallback(syntheticInfoMock);

        const importMonitorOrchestrator = importMonitorOrchestratorFactory(
            syntheticsListFileServiceMock,
            syntheticsFileServiceMock,
            newRelicServiceMock,
            defaultsMock
        );

        importMonitorOrchestrator.importSynthetic(expectedSyntheticId, expectedFilename);

    });

});