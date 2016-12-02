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

        const httpMock = {
            request: function (options, callback) {
                options.method.should.equal('POST');
                options.path.should.equal('/synthetics/api/v3/monitors');

                callback(responseMock);
                return requestMock;
            }
        };

        const newRelicService = newRelicServiceFactory(expectedApiKey, httpMock);

        newRelicService.createSynthetic(
            expectedName,
            expectedLocations,
            expectedFrequency,
            expectedStatus,
            function (syntheticUrl) {
                syntheticUrl.should.equals(expectedUrl);
            }
        );

        requestMock.write.should.have.been.calledWith(
            td.matchers.isA(String)
        );
        requestMock.end.should.have.been.called;
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

        const httpMock = {
            request: function (options, callback) {
                options.method.should.equal('POST');
                options.path.should.equal('/synthetics/api/v3/monitors');

                callback(responseMock);
                return requestMock;
            }
        };

        const newRelicService = newRelicServiceFactory(expectedApiKey, httpMock);

        newRelicService.createSynthetic(
            expectedName,
            expectedLocations,
            expectedFrequency,
            expectedStatus,
            function(syntheticUrl, err) {
                err.should.equal('Error creating synthetic: ' + expectedStatusMessage);
            }
        );
    });

    it ('should PUT to NR when updating a synthetic', function () {
        const expectedId = 'syntheticId';
        const expectedContent = 'new relic synthetic content';

        const responseMock = {
            statusCode: 204
        };

        const httpMock = {
            request: function (options, callback) {
                options.method.should.equal('PUT');
                options.path.should.equal('/synthetics/api/v3/monitors/' + expectedId + '/script');

                callback(responseMock);
                return requestMock;
            }
        };

        const newRelicService = newRelicServiceFactory(expectedApiKey, httpMock);

        newRelicService.updateMonitorScript(
            expectedId,
            expectedContent,
            function () {}
        );

        requestMock.write.should.have.been.calledWith(
            td.matchers.isA(String)
        );
        requestMock.end.should.have.been.called;
    });

    it ('report errors from New Relic when updating a synthetic', function () {
        const expectedId = 'syntheticId';
        const expectedContent = 'new relic synthetic content';
        const expectedStatusMessage = 'error message';

        const responseMock = {
            statusCode: 500,
            statusMessage: expectedStatusMessage,
            headers: {
                location: expectedUrl
            }
        };

        const httpMock = {
            request: function (options, callback) {
                options.method.should.equal('PUT');
                options.path.should.equal('/synthetics/api/v3/monitors/' + expectedId + '/script');

                callback(responseMock);
                return requestMock;
            }
        };

        const newRelicService = newRelicServiceFactory(expectedApiKey, httpMock);

        newRelicService.updateMonitorScript(
            expectedId,
            expectedContent,
            function(err) {
                err.should.equal('Error updating synthetic: ' + expectedStatusMessage);
            }
        );
    });
});