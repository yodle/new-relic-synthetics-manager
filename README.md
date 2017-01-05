# New Relic Synthetics Manager

This project has two goals to improve working with [New Relic Synthetics](https://newrelic.com/synthetics):

* Be able to run your New Relic Synthethics locally. This lets you do things like debugging.
* Manage your New Relic Synthetics from the command line. Create new synthetics or update existing ones. This allows you to store the synthetics code under source code control.

For more information on New Relic Synthetics see [New Relic's Documentation](https://docs.newrelic.com/docs/synthetics/new-relic-synthetics/scripting-monitors/write-scripted-browsers)

[![Build Status](https://travis-ci.org/yodle/new-relic-synthetics-manager.svg?branch=master)](https://travis-ci.org/yodle/new-relic-synthetics-manager)

## Description

This tool is designed to allow creating, writing and managing New Relic scripted browser synthetics. This allows synthetics to be run and debug on a local machine and then push them to New Relic when ready. This also allows synthetics to be stored in a SCM system to track changes and have a CI system push them to New Relic in an automation fashion.

new-relic-synthetics-manager contains both a command line tool and a library. 

The synthmanager command line tool allows the create, update and import synthetics to/from New Relic. 

The new-relic-synthetics-manager library provides the setup needed to simulate the environment that synthetics are run in New Relic. This is added to your synthetics with "require ('new-relic-synthetics-manager')" line of code at the top of your local synthetics script. This line should NOT be removed or changed. It is automatically striped out of the synthetic code when it is uploaded to New Relic.

### Important Note

The synthmanager command line tool makes calls to the New Relic Synthetics API, which is rate limited at 3 requests per second. Each run of the command will only make one or two calls, so a single run should not be a problem. But if commands are run in parallel or in rapid succession, the rate limit could be hit. This is especially important if the tool is added to a CI/CD system.

## Getting Started

synthmanager was written for node.js v6 or greater. You will need to have that installed to proceed. Installation instructions can be found here: https://nodejs.org/

Install the synthmanager command via npm to allow you to use the command line tool:

```
$ npm install new-relic-synthetics-manager -g
```

Next, create an npm project to store our synthetics:

```
$ mkdir syntheticsProject
$ cd syntheticsProject
$ npm init
```

After creating a project, add new-relic-synthetics-manager as a dependency:

```
$ npm install new-relic-synthetics-manager --save
```

Now, new synthetics can be created with the 'synthmanager create' command:

```
$ synthmanager create --name "New Synthetic Name" --filename newSyntheticName.js
```

This will create the synthetic in New Relic and create a js file with the specified name under the synthetics directory. The js file has some basic setup needed to run the synthetic locally.

After, when the synthetics code has been completed, it can be uploaded to New Relic with the 'synthmanager update' command: 

```
$ synthmanager update --name "New Synthetic Name"
```

## Command Line Usage

### Create a new synthetic

```
synthmanager create --name <synthetic_name> --file <filename>
```

Create a synthetic in New Relic and a file to contain the synthetic code. The local file will be created in the directory the command was run. This is where you will put your test code.

* --name <synthetic_name> - Name of synthetic. This is the name used in New Relic as well as how it should be refered to by other commands
* --file <filename> - Filename where the synthethics code should go. This file will be created under the 'synthetics' directory. The file should not already exist.
* --frequency <frequency> - Frequency to run the synthetic in minutes. This should be an integer. Possible values are:  1, 5, 10, 15, 30, 60, 360, 720, or 1440. The default is 10.
* --locations <location> - Locations to run the synthetic. This can be specified multiple times to specify multiple locations.


### Update New Relic with synthetics code

```
synthmanager update --name <synthetic_name>
```

Update New Relic with the latest synthetic code for the specified synthetic.

* --name <synthetic_name> - name of synthetic to update. This should be the name used when the synthetic was created.


### Import a synthetic from New Relic

In order to import a New Relic Synthetic, the synthetic id is needed. This can be obtained from the New Relic Synthetics website. Navigate to the Synthetic to import and the id will be the last part of the URL (It is made up of 5 hexidecimal numbers separated by dashes).

```
synthmanager import --name <synthetic_name> --id <synthetic_id> --file <filename>
```

Import an existing synthetic from New Relic.

### Global options

These options can be used with any command:

* --apikey - Specify API key to use to access New Relic.
* --verbose - Provide verbose logging output.
* --debug - Provide debug logging output.

## Configuration

Configuration options can be changed by adding a 'synthetics.config.json' file in the base of the project. 

Available configuration options are:

* apikey - Synthetics API key (Note: There may be security issues storing this value in a file).
* syntheticsDirectory - Directory to store synthetics file in (default: './synthetics/').
* syntheticsListFile - File to store information about created synthetics in (default: './synthetics.json').

## Running Synthetics locally

### Prerequisites

New Relic runs synthetics using the chrome web browser. So that is the recommended way to run them locally. In order to run them, the following need to be setup:

* Chrome Web browser
* Selenium Server (http://www.seleniumhq.org/download/), should be running
* Chrome Driver (https://github.com/SeleniumHQ/selenium/wiki/ChromeDriver), should be in the path

### Running Synthetics

Once the prerequisites are installed and a synthetic is created, it can be run locally. This can be done with an IDE or using node:

```
$ node synthetics/newSyntheticName.js
```

## Samples

See the samples directory for an example of what Synthetics look like and a sample of how synthetics might be added to a continuous delivery system.
