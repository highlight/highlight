#!/bin/bash -ex

source env.sh

# startup the infra

SERVICES="clickhouse kafka postgres redis zookeeper collector"
if [[ "$*" == *"--hobby"* ]]; then
  CUSTOM_COMPOSE="-f compose.yml -f compose.hobby.yml"
fi

COLLECTOR_CONFIG="./collector.yml"
if [[ "$IN_DOCKER_GO" == "true" ]]; then
  sed -i "s/https:\/\/host\.docker\.internal:8082/http:\/\/backend:8082/g" $COLLECTOR_CONFIG
  sed -i "18d;19d" $COLLECTOR_CONFIG
elif [[ "$SSL" != "true" ]]; then
  sed -i "s/https:\/\/host\.docker/http:\/\/host\.docker/g" $COLLECTOR_CONFIG
  sed -i "18d;19d" $COLLECTOR_CONFIG
fi

docker compose $CUSTOM_COMPOSE pull $SERVICES
docker compose $CUSTOM_COMPOSE up --detach --wait --remove-orphans $SERVICES

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
