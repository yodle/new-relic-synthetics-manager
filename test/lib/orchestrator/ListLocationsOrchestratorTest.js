const td = require('testdouble');
const chai = require('chai');
const tdChai = require('testdouble-chai');

chai.should();
chai.use(tdChai(td));

const listLocationsOrchestratorFactory = require('../../../lib/orchestrator/ListLocationsOrchestrator');

describe('ListLocationsOrchestrator', () => {
    it ('should get a list of locations from NR', () => {
        const expectedLocations = [{label: "location", name: "name" }, {label: "location2", name: "name2"}];

        const newRelicServiceMock = {
            getAvailableLocations: (callback) => {
                callback(null, expectedLocations);
            }
        }

        const listLocationsOrchestrator = listLocationsOrchestratorFactory(newRelicServiceMock);

        listLocationsOrchestrator.listLocations();
    });

    it ('should throw an error if NR throws an error', () => {
        const expectedError = "Could not list locations";

        const newRelicServiceMock = {
            getAvailableLocations: (callback) => {
                callback(expectedError);
            }
        }

        const listLocationsOrchestrator = listLocationsOrchestratorFactory(newRelicServiceMock);

        (() => {
            listLocationsOrchestrator.listLocations();
        }).should.throw(expectedError);
    });
});