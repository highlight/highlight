#!/bin/bash -ex

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
