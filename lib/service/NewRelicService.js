const _ = require('lodash');
const logger = require('winston');

const SYNTHETICS_HOST = 'synthetics.newrelic.com';

class SyntheticsService {
    constructor(apikey, http, request) {
        this.apikey = apikey;
        this.http = http;
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

    getSynthetic(id, callback) {
        logger.verbose('SyntheticsService.getSynthetic: ' + id);

        const options = this._getOptions({
            url: 'https://' + SYNTHETICS_HOST + '/synthetics/api/v3/monitors/' + id,
        });

        logger.verbose('Sending request to New Relic: ' + options.url);
        this.request(
            options,
            function (err, response, body) {
                if (err) { 
                    logger.error('Error retrieving synthetic: ' + err);
                    return callback(null, err);
                }

                if (response.statusCode !== 200) {
                    logger.error('Error retrieving synthetic: %d', response.statusCode);
                    return callback(null, 'Error retriveing synthetic: ' + response.statusCode);
                }

                logger.debug('Response Body: ' + body);
                return callback(JSON.parse(body));
            }
        );
    }

    createSynthetic(name, locations, frequency, status, callback) {
        logger.verbose('SyntheticsService.createSynthetic: ' + name);

        var options = this._getOptions({
            path: '/synthetics/api/v3/monitors',
            method: 'POST'
        });

        const paramObject = {
            name: name,
            type: 'SCRIPT_BROWSER',
            frequency: frequency,
            locations: locations,
            status: status
        };

        logger.verbose('Sending request to New Relic: ' + options.path);
        logger.debug(paramObject);

        var req = this.http.request(options, function (res) {
            if (res.statusCode != 201) {
                logger.error('Error creating synthetic: %d, %s', res.statusCode, res.statusMessage);
                return callback(null, 'Error creating synthetic: ' + res.statusMessage);
            }
        });

        req.write(JSON.stringify(paramObject));
        req.end();
    }

    getMonitorScript(id, callback) {
        logger.verbose('SyntheticsService.getMonitorScript: ' + id);

        var options = this._getOptions({
            url: 'http://' + SYNTHETICS_HOST + '/synthetics/api/v3/monitors/' + id + '/script',
            method: 'GET'
        });

        logger.verbose('Sending request to New Relic: ' + options.url);
        this.request(
            options,
            function (err, response, body) {
                if (err) { 
                    logger.error('Error retrieving synthetic code: ' + err);
                    return callback(null, err);
                }

                if (response.statusCode !== 200) {
                    logger.error('Error retrieving synthetic code: %d', response.statusCode);
                    return callback(null, 'Error retriveing synthetic code: ' + response.statusCode);
                }

                logger.debug('Response Body: ' + body);
                return callback(JSON.parse(body).scriptText);
            }
        );

    }

    updateMonitorScript(id, base64Script, callback) {
        logger.verbose('SyntheticsService.updateMonitorScript: ' + id);

        var options = this._getOptions({
            path: '/synthetics/api/v3/monitors/' + id + '/script',
            method: 'PUT'
        });

        logger.verbose('Sending request to New Relic');

        var req = this.http.request(options, function (res) {
            if (res.statusCode != 204) {
                logger.error('Error updating synthetic: %d, %s', res.statusCode, res.statusMessage);
                return callback('Error updating synthetic: ' + res.statusMessage);
            }

            return callback();
        });

        req.write(JSON.stringify({
            scriptText: base64Script
        }));

        req.end();
    }
}

module.exports = (apikey, http, request) => { return new SyntheticsService(apikey, http, request); };