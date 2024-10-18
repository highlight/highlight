#!/bin/bash -e

source env.sh

# startup the infra

SERVICES="clickhouse kafka postgres redis zookeeper collector predictions"
BUILD_ARGS="--build-arg OTEL_COLLECTOR_ALPINE_IMAGE_NAME=${OTEL_COLLECTOR_ALPINE_IMAGE_NAME} \
            --build-arg OTEL_COLLECTOR_IMAGE_NAME=${OTEL_COLLECTOR_IMAGE_NAME}"

docker compose pull $SERVICES
docker compose build --pull $BUILD_ARGS $SERVICES
docker compose up --detach --wait --remove-orphans $SERVICES

if [[ "$*" != *"--go-docker"* ]]; then
  pushd ../backend
  # migrate postgres schema
  go run ./migrations/main.go > /tmp/highlightSetup.log 2>&1
  if grep -e 'OPENSEARCH_ERROR' /tmp/highlightSetup.log; then
    echo 'Failed to migrate highlight infrastructure.'
    grep -e 'OPENSEARCH_ERROR' /tmp/highlightSetup.log
    echo 'Full output.'
    cat /tmp/highlightSetup.log
    exit 1
  fi
  popd
fi
echo 'Highlight infrastructure started'
