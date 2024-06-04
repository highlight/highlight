#!/bin/bash -e

# import default env vars
source env.sh

# set env vars from doppler
export -n DOPPLER_CONFIG
$(doppler secrets download --format=env-no-quotes --no-file | grep -v '\\n' | grep -vE '^#' | grep -E '\S+' | sed -e 's/^/export /')

if [[ "$LICENSE_KEY" == "" ]]; then
    echo "Environment encryption key is not set."
    exit 1
fi

echo "Encrypting using license key ${LICENSE_KEY}"
NOW=$(date -Iseconds)
OUTPUT="../backend/env.enc"
env | (echo "$NOW" && cat) | openssl enc -aes-256-cbc -nosalt -k $LICENSE_KEY -p -out $OUTPUT \
    | grep 'iv =' | sed -e 's/iv =/\n/' >> $OUTPUT
