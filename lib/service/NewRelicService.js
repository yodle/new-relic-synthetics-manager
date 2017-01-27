const _ = require('lodash');
const logger = require('winston');
const htmlToText = require('html-to-text');

const SYNTHETICS_HOST = 'synthetics.newrelic.com';
const MONITORS_ENDPOINT = '/synthetics/api/v3/monitors';
const MONITORS_URL = 'https://' + SYNTHETICS_HOST + MONITORS_ENDPOINT;
const ALERTS_ENDPOINT = '/synthetics/api/v1/locations';
const ALERTS_URL = 'https://' + SYNTHETICS_HOST + ALERTS_ENDPOINT;

class SyntheticsService {
    constructor(apikey, request) {
        this.apikey = apikey;
        this.request = request;
    }

    _getDefaultOptions() {
        return {
            host: SYNTHETICS_HOST,
            headers: {
                'X-Api-Key': this.apikey,
                'Content-Type': 'application/json'
            }
        };
    }

    _getOptions(options) {
        return _.assign(this._getDefaultOptions(), options);
    }

    _sendRequestToNewRelic(options, expectedResponse, operation, callback) {
        logger.verbose('NewRelicService._sendRequestToNewRelic: start: ' + operation);
        logger.debug('Options: ' + JSON.stringify(options));

        if (this.apikey === undefined) {
            return callback(new Error('Missing New Relic API key'));
        }

        this.request(
            options,
            (err, response, body) => {
                if (err) { 
                    logger.error('Error %s synthetic: ' + err, operation);
                    return callback(err);
                }

                if (response.statusCode !== expectedResponse) {
                    logger.error('Error %s synthetic: %d', operation, response.statusCode);
                    logger.debug(response.headers);
                    logger.debug(body);

                    const _getError = (response, body) => {
                        const responseType = response.headers['content-type'];
                        logger.debug('content-type: ' + responseType);
                        if (responseType === 'application/json') {
                            return _.reduce(JSON.parse(body).errors, (acc, err) => {
                                return acc + ' : ' + err.error;
                            }, 'New Relic Response');
                        } else if (responseType.indexOf('text/html') != -1) {
                            return 'New Relic Response : ' + htmlToText.fromString(body);
                        }

                        return 'Unknown Error';
                    };

                    return callback('Error ' + operation + ' synthetic: ' + response.statusCode + '; ' + _getError(response, body));
                }

                return callback(null, body, response);
            }
        );
    }

    getSynthetic(id, callback) {
        logger.verbose('NewRelicService.getSynthetic: ' + id);

        const options = this._getOptions({
            url: MONITORS_URL + '/' + id
        });

        this._sendRequestToNewRelic(
            options,
            200,
            'retrieving',
            (err, body) => {
                if (err) { 
                    return callback(null, err);
                }

                logger.debug('Response Body: ' + body);
                return callback(JSON.parse(body));
            }
        );
    }

    createSynthetic(name, locations, frequency, status, type, callback, uri) {
        logger.verbose('NewRelicService.createSynthetic: ' + name);

        const paramObject = {
            name: name,
            type: type,
            frequency: frequency,
            locations: locations,
            status: status
        };

        logger.debug('parameters: %s', JSON.stringify(paramObject));


        if ((type === 'SIMPLE') || (type === 'BROWSER')) {
            logger.debug('uri: ' + uri);
            if (_.isNil(uri)) {
                return callback(null, 'Error: Missing uri parameter');
            }

            paramObject.uri = uri;
        }

        const options = this._getOptions({
            url: MONITORS_URL,
            method: 'POST',
            body: JSON.stringify(paramObject)
        });

        this._sendRequestToNewRelic(
            options, 
            201,
            'creating',
            (err, body, response) => {
                if (err) {
                    return callback(null, err);
                }

                return callback(response.headers.location);
            }
        );
    }

    getMonitorScript(id, callback) {
        logger.verbose('NewRelicService.getMonitorScript: ' + id);

        const options = this._getOptions({
            url: 'http://' + SYNTHETICS_HOST + MONITORS_ENDPOINT +'/' + id + '/script',
            method: 'GET'
        });

        this._sendRequestToNewRelic(
            options,
            200,
            'retrieving code for',
            (err, body, response) => {
                if (err) { 
                    return callback(null, err);
                }

                logger.debug('Response Body: ' + body);
                return callback(JSON.parse(body).scriptText);
            }
        );
    }

    updateMonitorScript(id, base64Script, callback) {
        logger.verbose('NewRelicService.updateMonitorScript: ' + id);

        const  requestParam = {
            scriptText: base64Script
        };

        const options = this._getOptions({
            url: MONITORS_URL + '/' + id + '/script',
            method: 'PUT',
            body: JSON.stringify(requestParam)
        });

        this._sendRequestToNewRelic(
            options,
            204,
            'updating code for',
            (err, response, body) => {
                if (err) {
                    return callback(err);
                }

                return callback();
            }
        );
    }

    getAvailableLocations(callback) {
        logger.verbose('NewRelicService.getAvailableLocation');

        const options = this._getOptions({
            url: ALERTS_URL
        });

        this._sendRequestToNewRelic(
            options,
            200,
            'getting location values',
            (err, body, response) => {
                if (err) {
                    return callback(err);
                }

                logger.debug(body);

                return callback(null, JSON.parse(body));
            }
        );
    }

    updateMonitorSettings(id, frequency, locations, uri, status, rename, callback) {
        logger.verbose('NewRelicService.updateMonitorSettings: ' + id);

        var requestParam = {};

        if (!_.isNil(frequency)) {
            requestParam.frequency = frequency;
        }

        if (!_.isNil(locations)) {
            requestParam.locations = locations;
        }

        if (!_.isNil(uri)) {
            requestParam.uri = uri;
        }

        if (!_.isNil(status)) {
            requestParam.status = status;
        }

        if (!_.isNil(rename)) {
            requestParam.name = rename;
        }

        logger.debug('request parameters: ' + JSON.stringify(requestParam));

        const options = this._getOptions({
            url: MONITORS_URL + '/' + id,
            method: 'PATCH',
            body: JSON.stringify(requestParam)
        });

        this._sendRequestToNewRelic(
            options,
            204,
            'updating synthetic configuration',
            (err, body, response) => {
                if (err) {
                    return callback(err);
                }

                return callback();
            }
        );
    }
}

module.exports = (apikey, request) => { return new SyntheticsService(apikey, request); };