# synthetics-manager

This project has two goals:
* Be able to run your New Relic Synthethics locally. This lets you do things like debugging.
* Manage your New Relic Synthetics from the command line. Create new synthetics or update existing ones. This allows you to store the synthetics code under source code control.

## Description

This tool is designed to allow creating, writing and managing New Relic scripted browser synthetics. This allows synthetics to be run and debug on a local machine and then push them to New Relic when ready. This also allows synthetics to be stored in a SCM system to track changes and have a CI system push them to New Relic in an automation fashion.

synthetics-manager contains both a command line tool and a library. 

The synthmanager command line tool allows the create, update and import synthetics to/from New Relic. 

The synthetics-manager library provides the setup needed to simulate the environment that synthetics are run in New Relic. This is added to your synthetics with "require ('synthetics_manager')" line of code at the top of your local synthetics script. This line should NOT be removed or changed. It is automatically striped out of the synthetic code when it is uploaded to New Relic.

## Getting Started

Install the synthmanager command via npm to allow you to use the command line tool
```
npm install synthetics_manager -g
```


## Command Line Usage

### Create a new synthetic

```
synthmanager create --name <synthetic_name> --file <filename>
```

Create a synthetic in New Relic and a file to contain the synthetic code.

### Update New Relic with synthetics code

```
synthmanager update --name <synthetic_name>
```

Update New Relic with the latest synthetic code for the specified synthetic.

### Import a synthetic from New Relic

```
synthmanager import --name <synthetic_name> --id <synthetic_id> --file <filename>
```

Import an existing synthetic from New Relic.

## Running Synthetics locally

### Prerequisites





## TODO

* import synthetics
* include git information
