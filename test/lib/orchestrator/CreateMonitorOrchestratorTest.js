const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);


const createMonitorOrchestratorFactory = require('../../../lib/orchestrator/createMonitorOrchestrator');

describe('CreateMonitorOrchestrator', function () {

    const syntheticsFileServiceMock = {
        exists: sinon.spy(),
        createFile: sinon.spy()
    };

    const newRelicOrchestratorMock = {
        createSynthetic: sinon.spy()
    };

    const syntheticsListFileServiceMock = {
        exists: sinon.spy(),
        createFile: sinon.spy()
    };

    const createMonitorOrchestrator = createMonitorOrchestratorFactory(
        syntheticsFileServiceMock,
        newRelicOrchestratorMock,
        syntheticsListFileServiceMock
    );

    it ('should create a synthetics file if it does not exist', function () {
        const monitorName = 'Monitor Name';
        const locations = [ 'location' ];
        const type = 'type';
        const frequency = 10;
        const expectedFilename = 'test.js';

        syntheticsFileServiceMock.exists = function (filename, callback) {
            filename.should.equal(expectedFilename);
            callback(false);
        }

        createMonitorOrchestrator.createNewMonitor(monitorName, locations, type, frequency, expectedFilename);

        syntheticsFileServiceMock.createFile.should.have.been.calledWith(expectedFilename);
    });

    it ('should not create a synthetics file if it does exist', function () {
        const monitorName = 'Monitor Name';
        const locations = [ 'location' ];
        const type = 'type';
        const frequency = 10;
        const expectedFilename = 'test.js';

        syntheticsFileServiceMock.exists = function (filename, callback) {
            filename.should.equal(expectedFilename);
            callback(true);
        }

        createMonitorOrchestrator.createNewMonitor(monitorName, locations, type, frequency, expectedFilename);

        syntheticsFileServiceMock.createFile.should.not.have.been.calledWith(expectedFilename);
    });

});