#!/bin/bash -ex

source env.sh

# startup the infra

if [[ "$*" == *"--hobby"* ]]; then
    CUSTOM_COMPOSE="-f compose.yml -f compose.hobby.yml"
fi
SERVICES="clickhouse collector kafka postgres redis zookeeper"
docker compose $CUSTOM_COMPOSE pull $SERVICES
docker compose $CUSTOM_COMPOSE up --detach --wait --remove-orphans $SERVICES

if [[ "$*" == *"--go-docker"* ]]; then
    exit 0
fi
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
echo 'Highlight infrastructure started'
