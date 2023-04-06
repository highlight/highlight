#!/bin/bash -ex

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# setup env
$(cat .env | grep -vE '^#' | sed -e 's/^/export /')
export CLICKHOUSE_ADDRESS=localhost:9000
export ENABLE_OBJECT_STORAGE=true
export INFLUXDB_SERVER=http://localhost:8086
export IN_DOCKER=true
export KAFKA_SERVERS=localhost:9092
export OBJECT_STORAGE_FS=/tmp/highlight-data
export OPENSEARCH_DOMAIN=http://localhost:9200
export OPENSEARCH_DOMAIN_READ=http://localhost:9200
export PSQL_HOST=localhost
export REACT_APP_AUTH_MODE=simple
export REDIS_EVENTS_STAGING_ENDPOINT=localhost:6379

mkdir -p ${OBJECT_STORAGE_FS}

# setup path to include go installed binaries
export PATH=${PATH}:$(go env GOPATH)/bin

# setup ca cert for cypress testing
export NODE_EXTRA_CA_CERTS="${SCRIPT_DIR}/../backend/localhostssl/server.crt";

for port in 9092 5432 8123 9000 9200 8086 4317 4318
do
    if lsof -i tcp:$port | grep -v COMMAND | grep LISTEN | grep -v doc; then
      echo Port $port is already taken! Please ensure nothing is listening on that port.
      lsof -i tcp:$port
      exit 1
    fi
done
