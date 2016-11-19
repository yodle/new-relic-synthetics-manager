#!/usr/bin/env node

// const argv = require('yargs')
//     .usage('Usage: $0 <command> [options]')
//     .command('new', 'Create new synthetic on New Relic based on specified file')
//     .alias('n', 'name')
//     .nargs('n', 1)
//     .demand(1, ['n'])
//     .describe('n', 'synthetic name')
//     .argv;

require('yargs')
    .commandDir('cmds')
    .alias('a', 'apikey')
    .global('a')
    .alias('v', 'verbose')
    .global('v')
    .alias('d', 'debug')
    .global('d')
    .demand(1)
    .help()
    .argv;


// const configuration = require('../lib/config/SyntheticsConfig').getConfig();

// console.log(argv._);

// console.log(configuration.syntheticsDirectory);






// const nr = require('./lib/new_relic');

// nr.getAllSynthetics(config.apikey);