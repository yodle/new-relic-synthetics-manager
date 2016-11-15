# synthetics-manager

This project has two goals:
* Be able to run your New Relic Synthethics locally. This lets you do things like debugging.
* Manage your New Relic Synthetics from the command line. Create new synthetics or update existing ones. This allows you to store the synthetics code under source code control.


## Usages

### Create a new synthetics

```
synthmanager create --name <synthetic_name> <filename>
```

Create a new synthetic based on the given file.



