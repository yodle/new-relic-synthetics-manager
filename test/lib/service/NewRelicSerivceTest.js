const td = require('testdouble');
const chai = require('chai');
const tdChai = require('testdouble-chai');

chai.should();
chai.use(tdChai(td));

const newRelicServiceFactory = require('../../../lib/service/NewRelicService');

describe('NewRelicService', function () {
    const expectedApiKey = 'apikey';
    const expectedName = 'syntheticName';
    const expectedLocations = ['location1'];
    const expectedFrequency = 10;
    const expectedStatus = 'DISABLED';
    const expectedUrl = 'http://newrelic/id';

    const requestMock = {
        write: td.function(),
        end: td.function()
    };

    it ('should POST to NR when creating a synthetic', function () {
        const responseMock = {
            statusCode: 201,
            headers: {
                location: expectedUrl
            }
        };

        const requestMock = td.function();

        td.when(requestMock(
            td.matchers.isA(Object),
            td.callback
        )).thenCallback(null, responseMock);

        const newRelicService = newRelicServiceFactory(expectedApiKey, requestMock);

        newRelicService.createSynthetic(
            expectedName,
            expectedLocations,
            expectedFrequency,
            expectedStatus,
            function (syntheticUrl) {
                syntheticUrl.should.equals(expectedUrl);
            }
        );
    });

    it ('report errors from New Relic when creating a synthetic', function () {
        const expectedStatusMessage = 'error message';
        const responseMock = {
            statusCode: 404,
            statusMessage: expectedStatusMessage,
            headers: {
                location: expectedUrl
            }
        };

        const requestMock = td.function();

        td.when(requestMock(
            td.matchers.isA(Object),
            td.callback
        )).thenCallback(expectedStatusMessage);

        const newRelicService = newRelicServiceFactory(expectedApiKey, requestMock);

        newRelicService.createSynthetic(
            expectedName,
            expectedLocations,
            expectedFrequency,
            expectedStatus,
            (syntheticUrl, err) => {
                err.should.equal(expectedStatusMessage);
            }
        );
    });

    it ('should PUT to NR when updating a synthetic', function () {
        const expectedId = 'syntheticId';
        const expectedContent = 'new relic synthetic content';

        const responseMock = {
            statusCode: 204
        };

        const requestMock = td.function();

        td.when(requestMock(
            td.matchers.isA(Object),
            td.callback
        )).thenCallback(responseMock);

        const newRelicService = newRelicServiceFactory(expectedApiKey, requestMock);

        newRelicService.updateMonitorScript(
            expectedId,
            expectedContent,
            () => {}
        );
    });

    it ('report errors from New Relic when updating a synthetic', function () {
        const expectedId = 'syntheticId';
        const expectedContent = 'new relic synthetic content';
        const expectedStatusCode = 500;

        const requestMock = td.function();
        const responseMock = {
            statusCode: expectedStatusCode
        };

        td.when(requestMock(
            td.matchers.isA(Object),
            td.callback
        )).thenCallback(null, responseMock);

        const newRelicService = newRelicServiceFactory(expectedApiKey, requestMock);

        newRelicService.updateMonitorScript(
            expectedId,
            expectedContent,
            (err) => {
                err.should.equal('Error updating code for synthetic: ' + expectedStatusCode);
            }
        );
    });

    it ('should return an error if New Relic throws an error getting a synthetic', () => {
        const expectedSyntheticId = 'syntheticId';
        const expectedError = 'error retrieving synthetic';

        const requestMock = td.function();

        td.when(requestMock(
            td.matchers.isA(Object),
            td.callback
        )).thenCallback(expectedError);

        const newRelicService = newRelicServiceFactory(expectedApiKey, requestMock);

        newRelicService.getSynthetic(expectedSyntheticId, (body, err) => {
            err.should.be.equal(expectedError);
        });
    });

    it ('should return an error if New Relic cannot find the synthetic', () => {
        const expectedStatusCode = 404;
        const expectedSyntheticId = 'syntheticId';
        const expectedError = 'Error retrieving synthetic: '  + expectedStatusCode;

        const requestMock = td.function();
        const responseMock = {
            statusCode: expectedStatusCode
        };

        td.when(requestMock(
            td.matchers.isA(Object),
            td.callback
        )).thenCallback(null, responseMock);

        const newRelicService = newRelicServiceFactory(expectedApiKey, requestMock);

        newRelicService.getSynthetic(expectedSyntheticId, (body, err) => {
            err.should.be.equal(expectedError);
        });
    });

    it ('should return synthetic info from New Relic', () => {
        const expectedBody = '{ "content": "syntheticInfo"}';
        const expectedSyntheticId = 'syntheticId';

        const requestMock = td.function();
        const responseMock = {
            statusCode: 201
        };

        td.when(requestMock(
            td.matchers.isA(Object),
            td.callback
        )).thenCallback(null, responseMock, expectedBody);

        const newRelicService = newRelicServiceFactory(expectedApiKey, requestMock);

        newRelicService.getSynthetic(expectedSyntheticId, (body, err) => {
            body.content.should.be.equal('syntheticInfo');
        });
    });

    it ('should throw an error if apikey is undefined', () => {
        const expectedBody = '{ "content": "syntheticInfo"}';
        const expectedSyntheticId = 'syntheticId';

        const requestMock = td.function();
        const responseMock = {
            statusCode: 201
        };

        td.when(requestMock(
            td.matchers.isA(Object),
            td.callback
        )).thenCallback(null, responseMock, expectedBody);

        const newRelicService = newRelicServiceFactory(undefined, requestMock);

        newRelicService.getSynthetic(expectedSyntheticId, (body, err) => {
            err.toString().should.be.equal('Error: Missing New Relic API key');
        });
    });
});