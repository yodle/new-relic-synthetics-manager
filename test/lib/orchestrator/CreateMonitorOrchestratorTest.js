const td = require('testdouble');
const chai = require('chai');
const tdChai = require('testdouble-chai');

chai.should();
chai.use(tdChai(td));

const createMonitorOrchestratorFactory = require('../../../lib/orchestrator/CreateMonitorOrchestrator');

describe('CreateMonitorOrchestrator', function () {
    const initialSyntheticsContent = '// initial Synthetics Content';

    const monitorName = 'Monitor Name';
    const locations = ['location'];
    const type = 'type';
    const frequency = 10;
    const expectedFilename = 'test.js';

    const defaultsMock = {
        syntheticsContent: initialSyntheticsContent
    };

    const newRelicServiceMock = {
        createSynthetic: td.function()
    };

    const syntheticsListFileServiceMock = {
        exists: td.function(),
        createFile: td.function(),
        addSynthetic: td.function()
    };

    it ('should create a synthetics file if it does not exist', function () {
        const syntheticsFileServiceMock = {
            exists: td.function(),
            createFile: td.function()
        };

        td.when(syntheticsFileServiceMock.exists(expectedFilename, td.callback)).thenCallback(false);

        td.when(syntheticsFileServiceMock.createFile(
            td.matchers.isA(String),
            td.matchers.isA(String),
            td.callback
        )).thenCallback();

        const createMonitorOrchestrator = createMonitorOrchestratorFactory(
            syntheticsFileServiceMock,
            newRelicServiceMock,
            syntheticsListFileServiceMock,
            defaultsMock
        );

        createMonitorOrchestrator.createNewMonitor(monitorName, locations, type, frequency, expectedFilename);

        syntheticsFileServiceMock.createFile.should.have.been.calledWith(
            expectedFilename,
            td.matchers.isA(String),
            td.callback
        );
    });

    it ('should not create a synthetics file if it does exist', function () {
        const syntheticsFileServiceMock = {
            exists: td.function(),
            createFile: td.function()
        };

        td.when(syntheticsFileServiceMock.exists(expectedFilename, td.callback)).thenCallback(true);

        const createMonitorOrchestrator = createMonitorOrchestratorFactory(
            syntheticsFileServiceMock,
            newRelicServiceMock,
            syntheticsListFileServiceMock,
            defaultsMock
        );

        createMonitorOrchestrator.createNewMonitor(monitorName, locations, type, frequency, expectedFilename);

        syntheticsFileServiceMock.createFile.should.not.have.been.called;
    });

    it ('should call into new relic', function () {
        const syntheticsFileServiceMock = {
            exists: td.function(),
            createFile: td.function()
        };

        const newRelicServiceMock = {
            createSynthetic: td.function()
        };

        td.when(newRelicServiceMock.createSynthetic(
            td.matchers.isA(String),
            td.matchers.isA(Array),
            td.matchers.isA(Number),
            td.matchers.isA(String),
            td.callback
        )).thenCallback('http://newrelic/id');
        td.when(syntheticsFileServiceMock.exists(expectedFilename, td.callback)).thenCallback(true);
        td.when(syntheticsListFileServiceMock.addSynthetic(
            'id', monitorName, expectedFilename, td.callback
        )).thenCallback(null);


        const createMonitorOrchestrator = createMonitorOrchestratorFactory(
            syntheticsFileServiceMock,
            newRelicServiceMock,
            syntheticsListFileServiceMock,
            defaultsMock
        );

        createMonitorOrchestrator.createNewMonitor(monitorName, locations, type, frequency, expectedFilename, function () {
            newRelicServiceMock.createSynthetic.should.have.been.calledWith(
                monitorName,
                locations,
                frequency,
                'ENABLED',
                td.callback
            );
        });
    });

    it ('should throw an error if New Relic has a problem', () => {
        const expectedError = 'new relic error';

        const syntheticsFileServiceMock = {
            exists: td.function(),
            createFile: td.function()
        };

        const newRelicServiceMock = {
            createSynthetic: td.function()
        };

        td.when(newRelicServiceMock.createSynthetic(
            td.matchers.isA(String),
            td.matchers.isA(Array),
            td.matchers.isA(Number),
            td.matchers.isA(String),
            td.callback
        )).thenCallback(null, expectedError);
        td.when(syntheticsFileServiceMock.exists(expectedFilename, td.callback)).thenCallback(true);
        td.when(syntheticsListFileServiceMock.addSynthetic(
            'id', monitorName, expectedFilename, td.callback
        )).thenCallback(null);


        const createMonitorOrchestrator = createMonitorOrchestratorFactory(
            syntheticsFileServiceMock,
            newRelicServiceMock,
            syntheticsListFileServiceMock,
            defaultsMock
        );

        (() => {
            createMonitorOrchestrator.createNewMonitor(
                monitorName,
                locations,
                type,
                frequency,
                expectedFilename,
                () => {}
            );
        }).should.throw(expectedError);
    });

});