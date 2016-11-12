
var http = require('https');

const SYNTHETICS_HOST = 'synthetics.newrelic.com';

var syntheticsServer = {
    getAllSynthetics: function (apikey) {
        var options = {
            host: SYNTHETICS_HOST,
            port: 80,
            path: '/synthetics/api/v3/monitors',
            headers: {
                'X-Api-Key': apikey
            }
        }
          
        var req = http.request(options, function (res) {
            res.on('data', function (d) {
                console.log(d);
            });
        });

        req.end();
    }
}

module.exports = syntheticsServer;