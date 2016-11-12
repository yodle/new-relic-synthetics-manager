#!/usr/bin/env node

const fs = require('fs');
const defaultConfigFile = 'synthetics.config.js';

const config = JSON.parse(
    fs.readFileSync(defaultConfigFile)
);

const nr = require('./lib/new_relic');

nr.getAllSynthetics(config.apikey);