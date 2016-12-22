
module.exports = {
    configFile: 'synthetics.config.json',
    syntheticsDirectory: './synthetics',
    syntheticsListFile: './synthetics.json',
    syntheticsContent: "require('new-relic-synthetics-manager');\n//----- Add synthetic code below this line\n",
};