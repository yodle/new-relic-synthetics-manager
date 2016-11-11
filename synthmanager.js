#!/usr/bin/env node

const fs = require('fs');
const defaultConfigFile = 'synthetics.config.js';

const config = JSON.parse(
    fs.readFileSync(defaultConfigFile)
);

console.log(config.apikey);