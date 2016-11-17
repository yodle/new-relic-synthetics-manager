const http = require('https');
const _ = require('lodash');

const SYNTHETICS_HOST = 'synthetics.newrelic.com';

class SyntheticsService {
    constructor(apikey) {
        this.apikey = apikey;
    }

    getDefaultOptions() {
        return {
            host: SYNTHETICS_HOST,
            headers: {
                'X-Api-Key': this.apikey,
                'Content-Type': 'application/json'
            }
        };
    }

    getOptions(options) {
        return _.assign(this.getDefaultOptions(), options);
    }

    getAllSynthetics(callback) {
        var options = getOptions({
            path: '/synthetics/api/v3/monitors'
        });
          
        var req = http.request(options, function (res) {
            res.on('data', callback);
        });

        req.end();
    }

    createSynthetic(paramObject, callback) {
        var options = this.getOptions({
            path: '/synthetics/api/v3/monitors',
            method: 'POST'
        });

        console.log('sending request to new relic');
        console.log(paramObject);

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
        var options = this.getOptions({
            path: '/synthetics/api/v3/monitors/' + id + '/script',
            method: 'PUT'
        });

        console.log('sending request to new relic');

        var req = http.request(options, function (res) {
            if (res.statusCode != 204) {
                console.log('Error creating Synthetic: ' + res.statusCode);
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