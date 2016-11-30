const td = require('testdouble');
const chai = require('chai');
const tdChai = require('testdouble-chai');

chai.should();
chai.use(tdChai(td));

const updateMonitorOrchestratorFactory = require('../../../lib/orchestrator/UpdateMonitorOrchestrator');

describe('UpdateMonitorOrchestrator', function () {
    const expectedSyntheticName = 'SyntheticName';

    const syntheticListFileSerivceMock = {
        getSynthetic: td.function()
    };
    const syntheticFileServiceMock = {
        getSynthetic: td.function()
    };
    const newRelicServiceMock = {};

    it ('should fail if no synthetic list file exists', function() {
        const updateMonitorOrchestrator = updateMonitorOrchestratorFactory(
            syntheticListFileSerivceMock,
            syntheticFileServiceMock,
            newRelicServiceMock
        );

        td.when(syntheticFileServiceMock.getSynthetic(
            td.matchers.isA(String),
            td.callback
        )).thenThrow(new Error('synthetic not found'));

        updateMonitorOrchestrator.updateSynthetic(expectedSyntheticName);
    });
});