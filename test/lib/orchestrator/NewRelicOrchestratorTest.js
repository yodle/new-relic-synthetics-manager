const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);

const newRelicOrchestratorFactory = require('../../../lib/orchestrator/NewRelicOrchestrator');

describe('NewRelicOrchestrator', function () { 

    var mock = {
        createSynthetic: sinon.spy()
    }
    const newRelicOrchestrator = newRelicOrchestratorFactory(mock);

    it ('should call createSynthetics with defaults', function () {
        const name = "syntheticName";
        const locations = ["locations"];

        newRelicOrchestrator.createSynthetic(
            name,
            locations
        );

        mock.createSynthetic.should.have.been.calledOnce;
    });

    it ('should get synthetic id from url', function () {
        const expectedId = 'fa21d686-a69d-4cb5-a8b0-6f7228005f5a';
        const url = 'https://synthetics.newrelic.com/synthetics/api/v3/monitors/' + expectedId;

        const id = newRelicOrchestrator.syntheticUrlToId(url);

        id.should.equal(expectedId);
    });
});