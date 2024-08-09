#!/bin/bash -e

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

# check for license key in env, override .env
if [[ "$LICENSE_KEY" != "" ]]; then
    echo "Using LICENSE_KEY from env."
    LICENSE_KEY_OVERRIDE=$LICENSE_KEY
fi

# setup env
$(cat .env | grep -vE '^#' | grep -E '\S+' | sed -e 's/^/export /')
export IN_DOCKER=true
export BACKEND_HEALTH_URI=$(echo "$REACT_APP_PUBLIC_GRAPH_URI" | sed -e 's/\/public/\/health/')
export LICENSE_KEY=$LICENSE_KEY_OVERRIDE
export BUILD_ARGS="--build-arg DOPPLER_TOKEN=${DOPPLER_TOKEN}"

# if doppler is configured, use the doppler SSL value
export -n DOPPLER_CONFIG
DOPPLER_SSL=$(DOPPLER_CONFIG="" DOPPLER_TOKEN="" doppler secrets get SSL --plain || true)
if [[ "$DOPPLER_SSL" =~ ^(true|false)$ ]]; then
    export SSL=${DOPPLER_SSL}
    echo "Using doppler-set SSL value ${SSL}."
fi

if [[ "$*" == *"--go-docker"* ]]; then
    export CLICKHOUSE_ADDRESS=clickhouse:9000
    export IN_DOCKER_GO=true
    export KAFKA_ADVERTISED_LISTENERS="PLAINTEXT://kafka:9092"
    export KAFKA_SERVERS=kafka:9092
    export ON_PREM=true
    export OTLP_DOGFOOD_ENDPOINT=https://otel.highlight.io:4318
    export OTLP_ENDPOINT=http://collector:4318
    export PSQL_HOST=postgres
    export REDIS_EVENTS_STAGING_ENDPOINT=redis:6379
    echo "Using docker-internal infra."
else
    export CLICKHOUSE_ADDRESS=localhost:9000
    export KAFKA_ADVERTISED_LISTENERS="PLAINTEXT://localhost:9092"
    export KAFKA_SERVERS=localhost:9092
    export OTLP_DOGFOOD_ENDPOINT=http://localhost:4318
    export OTLP_ENDPOINT=http://localhost:4318
    export PSQL_HOST=localhost
    export REDIS_EVENTS_STAGING_ENDPOINT=localhost:6379
fi

# setup path to include go installed binaries
export PATH=${PATH}:$(go env GOPATH)/bin

# setup ca cert for cypress testing
export NODE_EXTRA_CA_CERTS="${SCRIPT_DIR}/../backend/localhostssl/server.crt"
