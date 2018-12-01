#!/usr/bin/env bash

file=contract.defs.local.json
path=node_modules/@shareandcharge/sharecharge-contracts/contract.defs.local.json

cp $file ../sharecharge-lib/$path
cp $file ../sharecharge-core-client/$path
cp $file ../sharecharge-cli/$path
cp $file ../sharecharge-api/$path
# cp $file ../sharecharge-token-scan/$path
cp $file ../bsenergy-backend/$path
