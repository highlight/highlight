#!/bin/bash -ex

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

# setup env
$(cat .env | grep -vE '^#' | grep -E '\S+' | sed -e 's/^/export /')
export ENABLE_OBJECT_STORAGE=true
export IN_DOCKER=true
export OBJECT_STORAGE_FS=/tmp/highlight-data
export REACT_APP_AUTH_MODE=password
export BACKEND_HEALTH_URI=$(echo "$REACT_APP_PUBLIC_GRAPH_URI" | sed -e 's/\/public/\/health/')

if [[ "$*" == *"--go-docker"* ]]; then
    export KAFKA_ADVERTISED_LISTENERS="PLAINTEXT://kafka:9092"
    export OTLP_ENDPOINT=http://collector:4318
    export OTLP_DOGFOOD_ENDPOINT=https://otel.highlight.io:4318
    export IN_DOCKER_GO=true
    export ON_PREM=true
    echo "Using docker-internal infra."
else
    export CLICKHOUSE_ADDRESS=localhost:9000
    export KAFKA_SERVERS=localhost:9092
    export PSQL_HOST=localhost
    export PSQL_DOCKER_HOST=postgres
    export REDIS_EVENTS_STAGING_ENDPOINT=localhost:6379
fi
export BUILD_ARGS="--build-arg GOARCH=${GOARCH}
--build-arg REACT_APP_AUTH_MODE=${REACT_APP_AUTH_MODE}
--build-arg REACT_APP_FRONTEND_ORG=${REACT_APP_FRONTEND_ORG}
--build-arg REACT_APP_FRONTEND_URI=${REACT_APP_FRONTEND_URI}
--build-arg REACT_APP_IN_DOCKER=${REACT_APP_IN_DOCKER}
--build-arg REACT_APP_PRIVATE_GRAPH_URI=${REACT_APP_PRIVATE_GRAPH_URI}
--build-arg REACT_APP_PUBLIC_GRAPH_URI=${REACT_APP_PUBLIC_GRAPH_URI}
--build-arg TURBO_TOKEN=${TURBO_TOKEN}
--build-arg TURBO_TEAM=${TURBO_TEAM}
--build-arg LICENSE_KEY=${LICENSE_KEY}
--build-arg ADMIN_PASSWORD=${ADMIN_PASSWORD}"

mkdir -p ${OBJECT_STORAGE_FS}

# setup path to include go installed binaries
export PATH=${PATH}:$(go env GOPATH)/bin

# setup ca cert for cypress testing
export NODE_EXTRA_CA_CERTS="${SCRIPT_DIR}/../backend/localhostssl/server.crt"

for port in 9092 5432 8123 9000 9200 8086 4317 4318; do
    if lsof -i tcp:$port | grep -v COMMAND | grep LISTEN | grep -v doc; then
        echo Port $port is already taken! Please ensure nothing is listening on that port.
        lsof -i tcp:$port
        exit 1
    fi
done
