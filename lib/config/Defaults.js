
module.exports = {
    configFile: 'synthetics.config.json',
    syntheticsDirectory: './synthetics',
    syntheticsListFile: './snythetics.json',
    syntheticsContent: "require('synthetics_manager');\n//----- Add synthetic code below this line\n",
};