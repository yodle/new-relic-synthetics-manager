#!/usr/bin/env node

require('yargs')
    .commandDir('cmds')
    .string('a')
    .alias('a', 'apikey')
    .global('a')
    .describe('a', 'New Relic API key')
    .boolean('v')
    .alias('v', 'verbose')
    .global('v')
    .describe('v', 'Provide verbose output')
    .boolean('d')
    .alias('d', 'debug')
    .global('d')
    .describe('d', 'Provide debug output')
    .demand(1)
    .help()
    .argv;