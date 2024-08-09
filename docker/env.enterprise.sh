#!/bin/bash -e

if [[ "$LICENSE_KEY" == "" ]]; then
    echo "Environment encryption key is not set."
    exit 1
fi

NOW=$(date -d "+1 year" -Iseconds 2>/dev/null || date -v "+1y" -Iseconds)
OUTPUT="../backend/env.enc"

# set env vars from doppler
export DOPPLER_CONFIG
echo "Encrypting with doppler config ${DOPPLER_CONFIG} using license key ${LICENSE_KEY}"
doppler secrets download --format=env-no-quotes --no-file \
    | grep -vE '^#' | grep -E '\S+' | grep -f env.enterprise.keys \
    | while IFS='=' read -r key value; do echo "$key=$(echo -n "$value" | base64 -w0)"; done \
    | (echo "$NOW" && cat) \
    | openssl enc -aes-256-cbc -md sha512 -pbkdf2 -iter 1000000 -nosalt -k $LICENSE_KEY -p -out $OUTPUT \
    | grep 'iv =' | sed -e 's/iv =/\n/' >> $OUTPUT

doppler secrets get --plain ENTERPRISE_ENV_PRIVATE_KEY > enterprise-private.pem
openssl dgst -sha512 -sign enterprise-private.pem -out $OUTPUT.dgst $OUTPUT
rm enterprise-private.pem
