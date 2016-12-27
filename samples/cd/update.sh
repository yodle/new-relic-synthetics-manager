#!/usr/bin/env bash

lastCommit=

if [ -n "$1" ]; then
  lastCommit=$1
fi

if [ -n "$LAST_COMMIT" ]; then
  lastCommit=$LAST_COMMIT
fi

changedFiles=$(git diff-tree --no-commit-id --name-only -r HEAD $lastCommit | grep "synthetics/")

for file in $changedFiles; do
  f=${file##synthetics/}
  echo "Updating synthetic: " $f
  synthmanager update --filename $f
  sleep 1
done