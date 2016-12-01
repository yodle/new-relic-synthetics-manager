const _ = require('lodash');
const logger = require('winston');

const SYNTHETICS_HOST = 'synthetics.newrelic.com';

class SyntheticsService {
    constructor(apikey, http) {
        this.apikey = apikey;
        this.http = http;
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

    getAllSynthetics(callback) {
        logger.verbose('SyntheticsService.getAllSynthetics');

        var options = this._getOptions({
            path: '/synthetics/api/v3/monitors'
        });
          
        var req = this.http.request(options, function (res) {
            res.on('data', callback);
        });

        req.end();
    }

    createSynthetic(name, locations, type, frequency, status, callback) {
        logger.verbose('SyntheticsService.createSynthetic: ' + name);

        var options = this._getOptions({
            path: '/synthetics/api/v3/monitors',
            method: 'POST'
        });

        const paramObject = {
            name: name,
            type: type,
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

            logger.debug('header[location]: ' + res.headers.location);
            return callback(res.headers.location);
        });

        req.write(JSON.stringify(paramObject));
        req.end();
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

module.exports = (apikey, http) => { return new SyntheticsService(apikey, http); };