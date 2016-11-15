#!/usr/bin/env node

const argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('new', 'Create new synthetic on New Relic based on specified file')
    .argv;


const configuration = require('../lib/config/SyntheticsConfig').getConfig();


console.log(configuration.syntheticsDirectory);






// const nr = require('./lib/new_relic');

// nr.getAllSynthetics(config.apikey);