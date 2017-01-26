# Development information

## Prerequisites

* node.js v6 or higher

## Code Structure

* bin/ 
    * command line interface and command line parsing code. bin/synthmanager.js is the entry point. yargs is used to do the command line parsing.
* lib/
    * code that implements the command line functionality.
* test/
    * tests. The tests use mocha, chai and testdouble.js.
* index.js
    * library entrypoint that provides webdriver functionality for running tests locally.

## Command Tasks

### Linting

```
gulp lint
```

### Testing

```
gulp test
```

### Lint and Test in one Tasks

```
gulp
```

or 

```
npm test
```