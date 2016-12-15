const _ = require('lodash');
const logger = require('winston');

const SYNTHETICS_HOST = 'synthetics.newrelic.com';
const MONITORS_ENDPOINT = '/synthetics/api/v3/monitors';
const MONITORS_URL = 'https://' + SYNTHETICS_HOST + MONITORS_ENDPOINT;

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
        logger.verbose('SyntheticsService._sendRequestToNewRelic: start: ' + operation);
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
                    return callback('Error ' + operation + ' synthetic: ' + response.statusCode);
                }

                return callback(null, body, response);
            }
        );
    }

    getSynthetic(id, callback) {
        logger.verbose('SyntheticsService.getSynthetic: ' + id);

        const options = this._getOptions({
            url: MONITORS_URL + '/' + id
        });

        this._sendRequestToNewRelic(
            options,
            201,
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

    createSynthetic(name, locations, frequency, status, callback) {
        logger.verbose('SyntheticsService.createSynthetic: ' + name);

        const paramObject = {
            name: name,
            type: 'SCRIPT_BROWSER',
            frequency: frequency,
            locations: locations,
            status: status
        };

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
        logger.verbose('SyntheticsService.getMonitorScript: ' + id);

        var options = this._getOptions({
            url: 'http://' + SYNTHETICS_HOST + MONITORS_ENDPOINT +'/' + id + '/script',
            method: 'GET'
        });

        this._sendRequestToNewRelic(
            options,
            200,
            'retrieving code for',
            (err, response, body) => {
                if (err) { 
                    return callback(null, err);
                }

                logger.debug('Response Body: ' + body);
                return callback(JSON.parse(body).scriptText);
            }
        );
    }

    updateMonitorScript(id, base64Script, callback) {
        logger.verbose('SyntheticsService.updateMonitorScript: ' + id);

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
        )
    }
}

module.exports = (apikey, request) => { return new SyntheticsService(apikey, request); };