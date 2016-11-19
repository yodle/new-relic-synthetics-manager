# synthetics-manager

This project has two goals:
* Be able to run your New Relic Synthethics locally. This lets you do things like debugging.
* Manage your New Relic Synthetics from the command line. Create new synthetics or update existing ones. This allows you to store the synthetics code under source code control.


## Usages

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





## TODO

* create synthetic template
* update synthetic
* track synthetics locally
* import synthetics
* include git information
* 
