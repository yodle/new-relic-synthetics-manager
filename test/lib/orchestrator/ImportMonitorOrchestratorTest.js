const td = require('testdouble');
const chai = require('chai');
const tdChai = require('testdouble-chai');

chai.should();
chai.use(tdChai(td));

const importMonitorOrchestratorFactory = require('../../../lib/orchestrator/ImportMonitorOrchestrator');

describe('ImportMonitorOrchestrator', () => {
    const expectedSyntheticName = 'syntheticName';
    const expectedSyntheticId = 'syntheticId';
    const expectedFilename = 'syntheticFilename.js';

    const defaultsMock = {
        syntheticsContent: ''
    };
    const syntheticsListFileServiceMock = {
        addSynthetic: td.function()
    };
    const syntheticsFileServiceMock = {
        createFile: td.function()
    };
    const newRelicServiceMock = {
        getSynthetic: td.function(),
        getMonitorScript: td.function()
    };
    const syntheticInfoMock = {
        name: expectedSyntheticName,
        id: expectedSyntheticId
    };

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

    it ('should get synthetic from New Relic and add it to synthetic list file', () => {
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

        syntheticsListFileServiceMock.addSynthetic.should.have.been.calledWith(
            expectedSyntheticId,
            expectedSyntheticName,
            expectedFilename,
            td.callback
        );
    });

    it ('should get synthetic code from New Relic and add it to synthetic file', () => {
        const expectedContent = 'expected\nsynthetic\nfile\ncontent';

        td.when(newRelicServiceMock.getSynthetic(
            expectedSyntheticId,
            td.callback
        )).thenCallback(syntheticInfoMock);

        td.when(newRelicServiceMock.getMonitorScript(
            expectedSyntheticId,
            td.callback
        )).thenCallback(Buffer.from(expectedContent).toString('base64'));

        td.when(syntheticsFileServiceMock.createFile(
            td.matchers.isA(String),
            td.matchers.isA(String),
            td.callback
        )).thenCallback();

        td.when(syntheticsListFileServiceMock.addSynthetic(
            td.matchers.isA(String),
            td.matchers.isA(String),
            td.matchers.isA(String),
            td.callback
        )).thenCallback();

        const importMonitorOrchestrator = importMonitorOrchestratorFactory(
            syntheticsListFileServiceMock,
            syntheticsFileServiceMock,
            newRelicServiceMock,
            defaultsMock
        );

        importMonitorOrchestrator.importSynthetic(expectedSyntheticId, expectedFilename);

        syntheticsFileServiceMock.createFile.should.have.been.calledWith(
            expectedFilename,
            expectedContent,
            td.callback
        );
    });

    it ('should fail if New Relic cannot get synthetic code', () => {
        const expectedError = 'Could not read synthetic code';

        td.when(newRelicServiceMock.getSynthetic(
            expectedSyntheticId,
            td.callback
        )).thenCallback(syntheticInfoMock);

        td.when(newRelicServiceMock.getMonitorScript(
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
});