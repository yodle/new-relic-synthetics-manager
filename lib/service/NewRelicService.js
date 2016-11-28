const http = require('https');
const _ = require('lodash');
const logger = require('winston');

const SYNTHETICS_HOST = 'synthetics.newrelic.com';

class SyntheticsService {
    constructor(apikey) {
        this.apikey = apikey;
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
          
        var req = http.request(options, function (res) {
            res.on('data', callback);
        });

        req.end();
    }

    createSynthetic(paramObject, callback) {
        logger.verbose('SyntheticsService.craeteSynthetic');

        var options = this._getOptions({
            path: '/synthetics/api/v3/monitors',
            method: 'POST'
        });

        logger.verbose('Sending request to New Relic');
        logger.debug(paramObject);

        var req = http.request(options, function (res) {
            if (res.statusCode != 201) {
                console.log('Error creating Synthetic');
                process.exit(2);
            }

            console.log(res.headers);
            callback(res.headers.location);
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

        var req = http.request(options, function (res) {
            if (res.statusCode != 204) {
                logger.error('Error creating Synthetic: ' + res.statusCode);
                process.exit(2);
            }

            callback();
        });

        req.write(JSON.stringify({
            scriptText: base64Script
        }));

        req.end();
    }
}

module.exports = (apikey) => { return new SyntheticsService(apikey) };