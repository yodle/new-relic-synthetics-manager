#!/usr/bin/env node

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