const td = require('testdouble');
const chai = require('chai');
const tdChai = require('testdouble-chai');

chai.should();
chai.use(tdChai(td));

const newRelicServiceFactory = require('../../../lib/service/NewRelicService');

describe('NewRelicService', () => {
    const expectedApiKey = 'apikey';
    const expectedName = 'syntheticName';
    const expectedLocations = ['location1'];
    const expectedFrequency = 10;
    const expectedStatus = 'DISABLED';
    const expectedUrl = 'http://newrelic/id';
    const expectedType = 'SCRIPTED_BROWSER';

    const requestMock = {
        write: td.function(),
        end: td.function()
    };

    it ('should POST to NR when creating a synthetic', () => {
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
            expectedType,
            (syntheticUrl) => {
                syntheticUrl.should.equals(expectedUrl);
            }
        );
    });

    it ('report errors from New Relic when creating a synthetic', () => {
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
            expectedType,
            (syntheticUrl, err) => {
                err.should.equal(expectedStatusMessage);
            }
        );
    });

    it ('should PUT to NR when updating a synthetic', () => {
        const expectedId = 'syntheticId';
        const expectedContent = 'new relic synthetic content';

        const responseMock = {
            statusCode: 204
        };

        const requestMock = td.function();

        td.when(requestMock(
            td.matchers.isA(Object),
            td.callback
        )).thenCallback(null, responseMock);

        const newRelicService = newRelicServiceFactory(expectedApiKey, requestMock);

        newRelicService.updateMonitorScript(
            expectedId,
            expectedContent,
            () => {}
        );
    });

    it ('report errors from New Relic when updating a synthetic', () => {
        const expectedId = 'syntheticId';
        const expectedContent = 'new relic synthetic content';
        const expectedStatusCode = 500;
        const errorMessage = 'error updating synthetic';
        const errorHtml = '<p>' + errorMessage + '</p>';

        const requestMock = td.function();
        const responseMock = {
            statusCode: expectedStatusCode,
            headers: {
                'content-type': 'other'
            }
        };

        td.when(requestMock(
            td.matchers.isA(Object),
            td.callback
        )).thenCallback(null, responseMock, errorHtml);

        const newRelicService = newRelicServiceFactory(expectedApiKey, requestMock);

        newRelicService.updateMonitorScript(
            expectedId,
            expectedContent,
            (err) => {
                err.should.equal('Error updating code for synthetic: ' + expectedStatusCode + '; Unknown Error');
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
        const errorMessage = 'Cannot find synthetic';
        const errorHtml = '<p>' + errorMessage + '</p>';

        const requestMock = td.function();
        const responseMock = {
            statusCode: expectedStatusCode,
            headers: {
                'content-type': 'text/html'
            }
        };

        td.when(requestMock(
            td.matchers.isA(Object),
            td.callback
        )).thenCallback(null, responseMock, errorHtml);

        const newRelicService = newRelicServiceFactory(expectedApiKey, requestMock);

        newRelicService.getSynthetic(expectedSyntheticId, (body, err) => {
            err.should.be.equal(expectedError + '; New Relic Response : ' + errorMessage);
        });
    });

    it ('should return synthetic info from New Relic', () => {
        const expectedBody = '{ "content": "syntheticInfo"}';
        const expectedSyntheticId = 'syntheticId';

        const requestMock = td.function();
        const responseMock = {
            statusCode: 200
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
        const expectedBody = JSON.stringify({ content: "syntheticInfo"});
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

    it ('should query new relic for monitor scripts', () => {
        const expectedSyntheticId = 'syntheticId';
        const expectedContent = 'synthetic\ncode\n';

        const requestMock = td.function();
        const responseMock = {
            statusCode: 200
        };
        const expectedBody = JSON.stringify({
            scriptText: expectedContent
        });

        td.when(requestMock(
            td.matchers.isA(Object),
            td.callback
        )).thenCallback(null, responseMock, expectedBody);

        const newRelicService = newRelicServiceFactory(expectedApiKey, requestMock);

        newRelicService.getMonitorScript(expectedSyntheticId, (content, err) => {
            content.should.equal(expectedContent);
        });
    });

    it ('should return an error if new relic returns an error for monitor scripts', () => {
        const expectedError = 'could not retrieve monitor script';
        const expectedSyntheticId = 'syntheticId';

        const requestMock = td.function();
        const responseMock = {
            statusCode: 200
        };

        td.when(requestMock(
            td.matchers.isA(Object),
            td.callback
        )).thenCallback(expectedError);

        const newRelicService = newRelicServiceFactory(expectedApiKey, requestMock);

        newRelicService.getMonitorScript(expectedSyntheticId, (content, err) => {
            err.should.equal(expectedError);
        });
    });

    it ('should fail to create a SIMPLE synthetic without a uri', () => {
        const type = 'SIMPLE';
        const requestMock = td.function();
        const newRelicService = newRelicServiceFactory(expectedApiKey, requestMock);

        newRelicService.createSynthetic(
            expectedName,
            expectedLocations,
            expectedFrequency,
            expectedStatus,
            type,
            (syntheticUrl, err) => {
                err.should.equals('Error: Missing uri parameter');
            }
        );
    });

    it ('should fail to create a BROWSER synthetic without a uri', () => {
        const type = 'BROWSER';
        const requestMock = td.function();
        const newRelicService = newRelicServiceFactory(expectedApiKey, requestMock);

        newRelicService.createSynthetic(
            expectedName,
            expectedLocations,
            expectedFrequency,
            expectedStatus,
            type,
            (syntheticUrl, err) => {
                err.should.equals('Error: Missing uri parameter');
            }
        );
    });

    it ('should POST to NR when creating a SIMPLE synthetic', () => {
        const type = 'SIMPLE';
        const uri = 'http://simple.uri.com/';

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
            type,
            (syntheticUrl) => {
                syntheticUrl.should.equals(expectedUrl);
            },
            uri
        );
    });

    it ('should GET to NR when listing locations', () => {
        const expectedLocationsList = JSON.stringify({ locations: "list of locations" });
        const responseMock = {
            statusCode: 200
        };

        const requestMock = td.function();

        td.when(requestMock(
            td.matchers.isA(Object),
            td.callback
        )).thenCallback(null, responseMock, expectedLocationsList);

        const newRelicService = newRelicServiceFactory(expectedApiKey, requestMock);

        newRelicService.getAvailableLocations(
            (err, locationsList) => {
                JSON.stringify(locationsList).should.be.equal(expectedLocationsList);
            }
        );
    });

    it ('should fail if NR throws an error when getting locations', () => {
        const errorMessage = 'error getting locations';

        const responseMock = {
            statusCode: 500,
            headers: {
                'content-type': 'application/json'
            }
        };

        const expectedBody = JSON.stringify({errors: [{error: errorMessage}]});

        const requestMock = td.function();

        td.when(requestMock(
            td.matchers.isA(Object),
            td.callback
        )).thenCallback(null, responseMock, expectedBody);

        const newRelicService = newRelicServiceFactory(expectedApiKey, requestMock);

        newRelicService.getAvailableLocations(
            (err, locationsList) => {
                err.should.be.equal('Error getting location values synthetic: 500; New Relic Response : ' + errorMessage);
            }
        );
    });

    it ('should PATCH to NR when changing configuration', () => {
        const expectedId = 'syntheticId';
        const frequency = 5;
        const locations = ['location1', 'location2'];
        const uri = 'http://theuri.com';
        const status = 'ENABLED';
        const newName = 'syntheticName';
        const responseMock = {
            statusCode: 204
        };

        const requestMock = td.function();

        td.when(requestMock(
            td.matchers.isA(Object),
            td.callback
        )).thenCallback(null, responseMock, null);

        const newRelicService = newRelicServiceFactory(expectedApiKey, requestMock);

        newRelicService.updateMonitorSettings(
            expectedId,
            frequency,
            locations,
            uri,
            status,
            newName,
            (err) => {
                requestMock.should.have.been.calledWith(
                    td.matchers.isA(Object),
                    td.callback
                );
            }
        );
    });

    it ('should return error when NR errors on synthetic config change', () => {
        const expectedId = 'syntheticId';
        const frequency = 5;
        const locations = null;
        const uri = 'http://theuri.com';
        const status = null;
        const newName = 'syntheticName';
        const expectedError = 'error changing synthetic config';
        const responseMock = {
            statusCode: 500
        };

        const requestMock = td.function();

        td.when(requestMock(
            td.matchers.isA(Object),
            td.callback
        )).thenCallback(expectedError, responseMock, null);

        const newRelicService = newRelicServiceFactory(expectedApiKey, requestMock);

        newRelicService.updateMonitorSettings(
            expectedId,
            frequency,
            locations,
            uri,
            status,
            newName,
            (err) => {
                err.should.be.equal(expectedError);
            }
        );
    });
});